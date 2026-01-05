---
title: "Serve Dockerized Django App on ECS"
summary: "Provision essential AWS resources such as task definitions, load balancer and more to serve your Django app."
createdAt: "2023-07-21"
tags: ['cdk', 'docker', "django"]
image: '/images/posts/general/docker.svg'
---
The completed project can be found [here](https://github.com/hahuaz/cdk-examples/tree/dev/django-dockerized).

## System design diagram
![system-design-diagram](/images/posts/serve-dockerized-django-app-on-ecs/design-diagram.png)

## Introduction

AWS ECS (Amazon Elastic Container Service) is a fully managed container orchestration service that simplifies deployment, management, and scaling of containerized applications using Docker containers. Here's a basic components of ECS:

1. Containers: Containers are lightweight packages that bundle an application and all its dependencies, including code, runtime, libraries, and system tools. It encapsulates your application, ensuring consistency across different environments.
2. Task Definition: A task definition is a plan that describes how a container should be started within ECS. It includes details such as the Docker image to use, CPU and memory requirements, networking information, and any necessary data volumes.
3. Launch types: ECS supports both EC2 launch type and Fargate launch type. When creating a Task, you associate it with one of these launch types.
4. ECS Cluster: An ECS cluster is a logical group of EC2 instances or AWS Fargate tasks (serverless containers) where containerized applications run. 

To summarize and connect these components, you start by defining a Task Definition that specifies the container image and resource requirements.
Then, you choose the appropriate launch type - either EC2 or Fargate - for your task.
And ECS takes care of running and managing the tasks, ensuring that the desired number of containers are always running.

## Closer look at launch types:
### EC2 launch type:

With the EC2 launch type, you are responsible for provisioning, configuring, and managing the underlying EC2 instances where your containers will run.
You have more control over the underlying infrastructure, allowing you to customize the EC2 instances to suit your specific requirements.
You can choose different EC2 instance types based on your application's resource needs and performance requirements.
EC2 launch type is well-suited for applications with specific hardware or networking requirements, or for those that require access to specific EC2 features.

#### Downsides of EC2 launch type:
1. Infrastructure Management: Managing the infrasturcture requires expertiese which can  be time-consuming and complex, especially when dealing with large-scale deployments.  Tasks such as patching, scaling, and ensuring high availability become the responsibility of the deployment team.
2. Scalability Complexity: Scaling EC2 instances to handle fluctuating workloads requires careful planning and automation. Implementing effective auto-scaling policies can be challenging, and improper scaling decisions may lead to underutilized resources or performance bottlenecks.

### Fargate launch type:

With the Fargate launch type, AWS manages the underlying infrastructure for you. You don't need to provision or manage any EC2 instances.
Fargate abstracts away the infrastructure layer, providing a serverless experience for running containers. You only need to specify the CPU and memory requirements for your tasks.
Each task runs in its own isolated environment without sharing resources with other tasks, ensuring greater security and isolation.
Fargate automatically scales the infrastructure for you, based on the resource requirements of your containers, allowing you to focus solely on your application's code.
Fargate is well-suited for applications where you don't want to manage the underlying infrastructure and prefer a serverless, scalable, and more cost-efficient solution.


#### Downsides of Fargate Launch Type:
1. Lack of Instance-Level Access: With Fargate, you don't have direct access to individual EC2 instances. This means that traditional methods of debugging and troubleshooting, such as logging into specific instances via SSH, are not available. Even though logging and monitoring is provided, diagnosing certain application issues that require direct instance access may be more challenging with Fargate.
2. Startup Latency: The initial startup time for Fargate tasks can be higher compared to traditional EC2 instances due to the underlying infrastructure setup.

Let's say you have a legacy application that requires a specific software library that is not pre-installed in the Fargate environment. However, with Fargate, you don't have direct access to the underlying EC2 instances, and you can't install custom software directly on the host environment.   
In this scenario, you would need to explore workarounds or modify your application to use alternative software or libraries that are available within the Fargate environment. 


## Infrastructure as Code with CDK

### Store construct
Store construct will provision RDS instance and new secret in Secret Manger service.

```ts filename-store
export class StoreConstruct extends Construct {
  public readonly rdsCredentials: aws_secretsmanager.Secret;
  public readonly rdsInstance: aws_rds.DatabaseInstance;

  constructor(scope: Construct, id: string, props: StoreConstructProps) {
    super(scope, id);

    const { vpc } = props;

    this.rdsCredentials = new aws_secretsmanager.Secret(
      this,
      `rdsCredentials`,
      {
        generateSecretString: {
          secretStringTemplate: JSON.stringify({
            username: 'postgres', // rds only accepts "username" prop
          }),
          excludePunctuation: true,
          includeSpace: false,
          generateStringKey: 'password', // rds only accepts "password" prop
        },
      }
    );

    this.rdsInstance = new aws_rds.DatabaseInstance(this, `rds`, {
      databaseName: 'postgres',
      engine: aws_rds.DatabaseInstanceEngine.postgres({
        version: aws_rds.PostgresEngineVersion.VER_14_3,
      }),
      instanceType: aws_ec2.InstanceType.of(
        aws_ec2.InstanceClass.T4G,
        aws_ec2.InstanceSize.MICRO
      ),
      vpc,
      vpcSubnets: {
        // RDS either should be in private subnet or SG shouldn't allow public access
        subnetType: aws_ec2.SubnetType.PUBLIC,
      },
      allocatedStorage: 20,
      maxAllocatedStorage: 50,
      securityGroups: [
        new aws_ec2.SecurityGroup(this, 'rdsSG', {
          vpc,
          allowAllOutbound: false,
        }),
      ],
      credentials: aws_rds.Credentials.fromSecret(this.rdsCredentials), // Get both username and password from existing secret
      multiAz: false,
    });

    // OUTPUTS
    new cdk.CfnOutput(this, 'dbInstanceEndpointAddress', {
      value: this.rdsInstance.dbInstanceEndpointAddress,
      description: 'dbInstanceEndpointAddress',
    });
  }
}
```
- Generated secret value will be value for `password` property on secret object since RDS only accepts password prop. We also add `username: 'postgres'` key-value pair to generated secret object, which will be used on RDS connection. Be aware, hardcoding username in here for the convenience and envrionment variables should be used since its sensetive information. Generated secret object structure will be as following:

```ts 
{
  username: "postgres",
  password: "{autoGenerated}"
}
```
- After calling `aws_rds.Credentials.fromSecret(this.rdsCredentials)` method on our secret, content of the secret will include new properties and structure will be as following:

```ts 
{
  username: "postgres",
  password: "{autoGenerated}",
  dbname: "postgres",
  engine: "postgres",
  port: 5432,
  dbInstanceIdentifier: "hahuaz-cdk-examples-storerds6b7e2f45-jt6nb5rvzlgv",
  host: "hahuaz-cdk-examples-storerds6b7e2f45-jt6nb5rvzlgv.ch3xdo8jwyqp.us-west-2.rds.amazonaws.com"
}
```
- These new props on the secret object created in order to have secure reference for RDS credentials. Containers will get RDS credentials from Secret Manager Service.
- RDS instance is created on public subnet but security group of RDS will only allow connections from containers.


### Compute construct

I will digest every resource and only show related IaC but you can found intact code in the provided repository.


#### Web app task definition
We kick off by creating task definition for our web app and add a container to it. 

```ts filename-compute
// create webApp def
const webAppDef = new ecs.FargateTaskDefinition(this, 'webAppDef', {
  memoryLimitMiB: 512,
  cpu: 256,
  ephemeralStorageGiB: 21,
});
const webAppCont = webAppDef.addContainer('webAppCont', {
  image: ecs.ContainerImage.fromAsset('./django'),
  memoryLimitMiB: 512,
  secrets: {
    DB_NAME: ecs.Secret.fromSecretsManager(rdsCredentials, 'dbname'),
    DB_USER: ecs.Secret.fromSecretsManager(rdsCredentials, 'username'),
    DB_PASSWORD: ecs.Secret.fromSecretsManager(rdsCredentials, 'password'),
  },
  environment: {
    DB_HOST: rdsInstance.dbInstanceEndpointAddress,
  },
  logging: ecs.LogDriver.awsLogs({
    streamPrefix: 'django-webapp',
  }),
  portMappings: [
    {
      containerPort: 80,
    },
  ],
});
```

- ECS will run this task definition, which is the way launching the container.
- Container image will be created and registered to ECR from `./django` directory. So you need open Docker Desktop App before making the deployment for image creation.
- Both `secrets` and `environment` variables will be passed as environment variable to container but the difference is `secrets` are encrypted and hold only reference to actual value. Even on AWS ECS console, only reference value will be displayed. Here is the example:

```csv
DB_HOST	value	hahuaz-cdk-examples-storerds6b7e2f45-jt6nb5rvzlgv.ch3xdo8jwyqp.us-west-2.rds.amazonaws.com
DB_NAME	valueFrom  arn:aws:secretsmanager:us-west-2:accountID:secret:storerdsCredentials04DCDA20-ly3zXUQlona3-IoYXvN:dbname::

```
- The `portMappings` configuration ensures that incoming HTTP requests, which typically use port 80, are forwarded to the web app running inside the container on the same port.

<hr />

#### Fargate service

The created task will be launched with Fargete service.

```ts filename-compute
const fargateSG = new ec2.SecurityGroup(this, 'fargateSG', {
  vpc,
});
rdsInstance.connections.allowFrom(
  ec2.Peer.ipv4(`${HOME_IP}/32`),
  ec2.Port.tcp(5432),
  'Allow inbound from home'
);
rdsInstance.connections.allowFrom(
  fargateSG,
  ec2.Port.tcp(5432),
  'Allow inbound from Fargate'
);
const webService = new ecs.FargateService(this, 'webService', {
  vpcSubnets: {
    subnetType: ec2.SubnetType.PUBLIC,
  },
  securityGroups: [fargateSG],
  cluster,
  taskDefinition: webAppDef,
  desiredCount: 1,
  assignPublicIp: true, // if it's set to false, task creation of cluster will fail and report "unable to pull secrets or registry auth"
});

```
- We're adding ingress rules to RDS security group from both containers and our home ip incase we want it to connect through PG Admin.
- The `desiredCount` specifices number of instantiations of the task definition in the service. It should be more than one if high availibility is required.
- The `assignPublicIp` is set to true since our intent is to serve web app. With this, ECS Fargate tasks are given public IP addresses in addition to their private IP addresses. This allows the tasks to communicate directly with the internet if needed. When a public IP is assigned, the Fargate tasks can initiate outbound connections to external resources or be reachable from the internet, allowing, for example, outbound API calls or incoming HTTP requests from the internet.
However, when assignPublicIp is set to false, the Fargate tasks are only given private IP addresses within the specified subnets. This means the tasks can still communicate with other resources within the VPC and with other services using private IP addresses, but they won't have direct internet access.

<hr />

#### Application Load Balancer

ALB will manage incoming traffics and distribute them among the multiple containers running your web application.

```ts filename-compute
const lb = new elbv2.ApplicationLoadBalancer(this, 'LB', {
  vpc,
  internetFacing: true,
});
const listener = lb.addListener('HttpListener', {
  port: 80,
});

webService.registerLoadBalancerTargets({
  containerName: webAppCont.containerName,
  containerPort: 80,
  newTargetGroupId: 'ECS',
  listener: ecs.ListenerConfig.applicationListener(listener, {
    protocol: elbv2.ApplicationProtocol.HTTP,
  }),
});
```

- A listener is added to the load balancer. The listener specifies that the load balancer should listen for incoming web traffic on port 80.
- The `registerLoadBalancerTargets()` will create new target group and it will point the Fargate web service.
  - The `containerName` is required since the Fargate web service can hold multiple different containers.
  - The `listener` prop takes `cdk.aws_ecs.ListenerConfig` as value which defines config for the target group.
- Only HTTP listener is added and HTTPS can be included before app going for production.


<hr />

#### Task definition for database migration
Often you need to run migrate command against your RDS instance while integrating new features on Django web app.
We can define new task definition for this process. It can be executed manually on AWS ECS Console and terminated after migration is completed. 

```ts filename-compute
// create migration def
const migrateDef = new ecs.FargateTaskDefinition(this, 'migrateDef', {
  memoryLimitMiB: 512,
  cpu: 256,
  ephemeralStorageGiB: 21,
});
migrateDef.addContainer('migrateCont', {
  image: ecs.ContainerImage.fromAsset('./django'),
  memoryLimitMiB: 512,
  secrets: {
    DB_NAME: ecs.Secret.fromSecretsManager(rdsCredentials, 'dbname'),
    DB_USER: ecs.Secret.fromSecretsManager(rdsCredentials, 'username'),
    DB_PASSWORD: ecs.Secret.fromSecretsManager(rdsCredentials, 'password'),
  },
  environment: {
    DB_HOST: rdsInstance.dbInstanceEndpointAddress,
  },
  command: ['python3', 'manage.py', 'migrate', '--no-input'],
  logging: ecs.LogDriver.awsLogs({
    streamPrefix: 'django-migration',
  }),
});

```

- Specific `command` property is configured for this task which will be run by the container to make migration. 
- To run migrate task, you should either make blu-green deployment or temporarily stop all running containers during the migration process, which requires down time. This ensures consistency between the application's code and the database schema and avoids running different application versions with incompatible database structures.


## Deployment 
We've gone through every piece of resource definition that is required for Django app and now we can deploy CDK stack. 

```bash
npx cdk deploy --profile <namedAwsProfile>
```

During the deployment process, you may observe that provisioning new tasks on ECS is relatively slow compared to provisioning other services. This is because ECS needs to create and configure the necessary resources for the tasks, such as networking, security groups, load balancers, and container instances.

After successfull deployment Django web app can be accessed through DNS of ALB on HTTP. It will printed as CfnOutput at the end of the deployment.


## Wrap up

We explored how to deploy a Django web application on AWS using the AWS Cloud Development Kit (CDK) and Elastic Container Service (ECS) Fargate. We took a step-by-step approach to set up the infrastructure required to run the web app securely and efficiently.

We started by creating a Fargate task definition. This definition allowed us to specify the container image, resource allocation, environment variables, and secrets required for securely connecting to our RDS database using AWS Secrets Manager.

Next, we delved into creating an Application Load Balancer (ALB) and setting up a listener to receive incoming web traffic. By registering our ECS Fargate service with the ALB, we achieved automatic load balancing and ensured high availability for our web application.

Throughout the process, we emphasized best practices for securing sensitive data, such as database credentials, by using AWS Secrets Manager to manage and retrieve them securely.

Finally, we discussed how to handle tasks like database migration by creating a specific task definition dedicated to the migration process. This allowed us to run the migration command against the RDS instance seamlessly and manage the process separately from our main web app tasks.

## References
- [django-migrations-deployment-strategy-with-aws-ecs-fargate](https://stackoverflow.com/questions/75406805/django-migrations-deployment-strategy-with-aws-ecs-fargate)