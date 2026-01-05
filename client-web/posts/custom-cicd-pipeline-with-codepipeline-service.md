---
title: "Custom CI/CD Pipeline with CodePipeline service"
summary: "Set up a CI/CD pipeline for your Next.js web app that is running on EC2 instance."
createdAt: "2023-07-19"
tags: ['cdk', 'devops']
image: '/images/posts/general/aws-codepipeline.jpg'
---

The completed project can be found [here](https://github.com/hahuaz/cdk-examples/tree/dev/custom-cicd-pipeline).

## Introduction
In this blog post, we will create CI/CD pipeline using [CodePipeline service](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_codepipeline-readme.html) directly instead of using opinionated [L2 Pipelines Construct](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.pipelines-readme.html). 

CodePipeline is an orchestration tool that orchestrates CodeCommit, CodeBuild and CodeDeploy services. It controls each service in the pipeline by listens events. It also provides a GUI on AWS Console for monitoring the progress of your pipeline.

We will deploy basic SSR web app and relatively small infrastructure. The primary focus of this post is to provide a clear understanding of the flow logic and how each stage in the pipeline connects with one another.

### Continues Integration flow

1. The engineer develops the app through a local Next.js server. 
2. Once the app is ready for deployment, they push a new commit to the specific branch in the CodeCommit repository. This action triggers a CodeCommit event, which then kicks off the pipeline process.

### Continous Deployment flow

1. The CodeBuild service comes into play by setting up a fresh sandbox environment and generating a build artifact for your web application. This build artifact will serve as the input for the subsequent deployment process. Optionally, you can run your tests before building your artifacts.
2. The CodeDeploy service steps in by taking the build artifact from CodeBuild and initiating the deployment process. It deploys your application to an existing EC2 instances by using code deploy agent. Unlike Lambda and ECS deployments, no new sandbox environment is created for EC2 deployments.

In summary, the pipeline is triggered by CodeCommit events, build artifacts are created by CodeBuild service, and CodeDeploy deploys the Next.js web application into existing EC2 instances.


## Infrastructure as Code (IaC)

### Compute construct

```ts filename-compute
export class ComputeConstruct extends Construct {
  public readonly vpc: ec2.Vpc;
  public readonly autoScalingGroup: autoscaling.AutoScalingGroup;
  constructor(scope: Construct, id: string, props: ComputeConstructProps) {
    super(scope, id);

    // const { } = props;

    this.vpc = new ec2.Vpc(this, 'vpc', {
      maxAzs: 2,
      subnetConfiguration: [
        {
          name: `${id}publicSubnet`,
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    const ec2sg = new ec2.SecurityGroup(this, 'ec2sg', {
      vpc: this.vpc,
      allowAllOutbound: true, // will let your instance send outboud traffic
    });
    ec2sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(8080));
    ec2sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));
    ec2sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443));
    ec2sg.addIngressRule(
      ec2.Peer.anyIpv4(), // TODO use your ip adresss
      ec2.Port.tcp(22) // open the SSH port
    );

    this.autoScalingGroup = new autoscaling.AutoScalingGroup(
      this,
      'autoScalingGroup',
      {
        vpc: this.vpc,
        minCapacity: 1,
        maxCapacity: 1,
        desiredCapacity: 1,
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T4G,
          ec2.InstanceSize.NANO
        ),
        vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
        securityGroup: ec2sg,
        machineImage: new ec2.AmazonLinuxImage({
          generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
          cpuType: ec2.AmazonLinuxCpuType.ARM_64,
        }),
        keyName: new ec2.CfnKeyPair(this, 'MyKeyPair', {
          keyName: `${id}-key-pair`,
        }).keyName,

        userData: ec2.UserData.custom(`
        #!/bin/bash
        echo "Hello, World!" >> /var/log/mylog.txt        
        `),
      }
    );
    // TODO give least privilege to the instance
    this.autoScalingGroup.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')
    );
  }
}
```
- Only public subnet is created on VPC to serve web app.
- Ingress rules for HTTP, HTTPS and SSH connection are added to EC2 security group. SSH (port 22) is permitted to facilitate developers' access for debugging and troubleshooting purposes.
- AutoScalingGroup is initiated with cost in mind. Naked EC2 instances (without web app) are provisioned through auto scaling group. Be aware, web application deployment is decoupled from the initial EC2 instance provisioning. After the whole stack is deployed, the CodePipeline service will run and deploy web app into EC2 instances.
- For ease of development admin access is granted to EC2 instances but you should never go into production with that privilege. 
- Key-pair value will be put into System Parameter Store. You must check the mentioned service on AWS console in order to download and use it.

### Services that compose CI/CD pipeline

First, let me present the complete file with all the services included, and afterward, I will try to explain every service the best way I can.

```ts filename-app-stack
export default class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // const {  } = process.env;
    const CODECOMMIT_REPO_NAME = 'custom-cicd-pipeline';
    const CODECOMMIT_BRANCH_NAME = 'dev';

    const { autoScalingGroup } = new ComputeConstruct(
      this,
      `compute`,
      {} as ComputeConstructProps
    );

    const codeBuildProject = new codebuild.Project(this, 'MyProject', {
      role: new cdk.aws_iam.Role(this, 'codebuildRole', {
        assumedBy: new cdk.aws_iam.ServicePrincipal('codebuild.amazonaws.com'),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            'AdministratorAccess' // TODO give least privilege to the codebuild role
          ),
        ],
      }),
      environment: {
        computeType: codebuild.ComputeType.LARGE,
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        privileged: true,
      },
      buildSpec: codebuild.BuildSpec.fromAsset('frontend/buildspec.yml'), // if content of the file is changed, stack needs to be redeployed. Otherwise pipeline will use the old version.
    });

    const codeDeploymentGroup = new codedeploy.ServerDeploymentGroup(
      this,
      'DeployGroup',
      {
        application: new codedeploy.ServerApplication(
          this,
          'DeployApplication'
        ),
        role: new iam.Role(this, 'DeployServiceRole', {
          assumedBy: new iam.ServicePrincipal('codedeploy.amazonaws.com'),
          managedPolicies: [
            iam.ManagedPolicy.fromAwsManagedPolicyName(
              'AdministratorAccess' // TODO give least privilege to the codebuild role
            ),
          ],
        }),
        deploymentConfig: codedeploy.ServerDeploymentConfig.ALL_AT_ONCE,
        ec2InstanceTags: new codedeploy.InstanceTagSet({
          app: ['next-app'],
        }),
        autoScalingGroups: [autoScalingGroup],
        installAgent: true,
      }
    );

    const sourceArtifact = new codepipeline.Artifact('sourceArtifact');
    const buildArtifact = new codepipeline.Artifact('buildArtifact');
    new codepipeline.Pipeline(this, 'MyPipeline', {
      crossAccountKeys: false,
      stages: [
        {
          stageName: 'CodeCommit',
          actions: [
            new codepipeline_actions.CodeCommitSourceAction({
              actionName: 'CodeCommit',
              repository: codecommit.Repository.fromRepositoryName(
                this,
                'codeCommitRepo',
                CODECOMMIT_REPO_NAME
              ),
              branch: CODECOMMIT_BRANCH_NAME,
              output: sourceArtifact,
            }),
          ],
        },
        {
          stageName: 'CodeBuild',
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: 'CodeBuild',
              input: sourceArtifact,
              project: codeBuildProject,
              outputs: [buildArtifact],
            }),
          ],
        },
        {
          stageName: 'CodeDeploy',
          actions: [
            new codepipeline_actions.CodeDeployServerDeployAction({
              actionName: 'CodeDeploy',
              input: buildArtifact,
              deploymentGroup: codeDeploymentGroup,
            }),
          ],
        },
      ],
    });
  }
}
```
<hr />

#### CodePipeline Service

The pipeline will consist of three stages, each encompassing essential action: source code commit, build artifact generation, and application deployment.

```ts filename-app-stack
const sourceArtifact = new codepipeline.Artifact('sourceArtifact');
const buildArtifact = new codepipeline.Artifact('buildArtifact');
new codepipeline.Pipeline(this, 'MyPipeline', {
  crossAccountKeys: false,
  stages: [
    {
      stageName: 'CodeCommit',
      actions: [
        new codepipeline_actions.CodeCommitSourceAction({
          actionName: 'CodeCommit',
          repository: codecommit.Repository.fromRepositoryName(
            this,
            'codeCommitRepo',
            CODECOMMIT_REPO_NAME
          ),
          branch: CODECOMMIT_BRANCH_NAME,
          output: sourceArtifact,
        }),
      ],
    },
    {
      stageName: 'CodeBuild',
      actions: [
        new codepipeline_actions.CodeBuildAction({
          actionName: 'CodeBuild',
          input: sourceArtifact,
          project: codeBuildProject,
          outputs: [buildArtifact],
        }),
      ],
    },
    {
      stageName: 'CodeDeploy',
      actions: [
        new codepipeline_actions.CodeDeployServerDeployAction({
          actionName: 'CodeDeploy',
          input: buildArtifact,
          deploymentGroup: codeDeploymentGroup,
        }),
      ],
    },
  ],
});

```
- We create two artifacts: `sourceArtifact` and `buildArtifact`. Artifacts are essentially S3 objects in compressed zip format. These artifacts are used to pass data between the different stages of the pipeline.
- The CodeCommit stage in the pipeline is configured to monitor a specific repository and branch, serving as the trigger for the pipeline. Once triggered, the source code is fetched from the designated CodeCommit repository and stored in the `sourceArtifact`, preparing it for subsequent stages in the pipeline.
- Next, the CodeBuild stage takes this source code artifact as input, triggers the specified CodeBuild project, and generates a `buildArtifact` as output.
- Finally, in the CodeDeploy stage, the web application is deployed using the contents of the `buildArtifact`.


<hr/>

#### CodeBuild service

```ts filename-app-stack
const codeBuildProject = new codebuild.Project(this, 'MyProject', {
  role: new cdk.aws_iam.Role(this, 'codebuildRole', {
    assumedBy: new cdk.aws_iam.ServicePrincipal('codebuild.amazonaws.com'),
    managedPolicies: [
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'AdministratorAccess' // TODO give least privilege to the codebuild role
      ),
    ],
  }),
  environment: {
    computeType: codebuild.ComputeType.LARGE,
    buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
    privileged: true,
  },
  buildSpec: codebuild.BuildSpec.fromAsset('frontend/buildspec.yml'), // if content of the file is changed, stack needs to be redeployed. Otherwise pipeline will use the old version.
});
```
- To build the web app, new sandbox envrionment will be created. The `computeType` is chosen as LARGE since I've witnessed out of memory couple of times. The `buildImage` chosen as STANDARD_7_0 since it's only image suppports node 18.
- The `buildspec.yml` is config file that describes how to build web app. If we look at the content of the file:

```json
version: 0.2
phases:
  install:
    runtime-versions:
      nodejs: 18
  pre_build:
    commands:
      - echo "Hello, CodeBuild!"
      - ls
      - node --version
      - cd frontend
      - npm install
  build:
    commands:
      - npm run build
  post_build:
    commands:
      - rm -r -f node_modules
      - ls
artifacts:
  files:
    - frontend/**/*
 
```
1. The directory is changed to the "frontend" folder, where the Next.js web app resides, and the necessary dependencies are installed. This phase can include tests or linters if required.
2. The build command run to produce build directory, which is .next by default.
3. After the build, node_modules is removed to not include dependencies in build artifact. Keep in mind, arficats will be stored in S3 and it can be costy to store dependencies on every deployment.
4. The `files` block is where you tell the CodeBuild to include the desired files in the build artifact. In this case, all the source code of the web app, along with the build directory, is included using the `frontend/**/*` statement.


<hr />

#### CodeDeploy service

```ts filename-app-stack
const codeDeploymentGroup = new codedeploy.ServerDeploymentGroup(
  this,
  'DeployGroup',
  {
    application: new codedeploy.ServerApplication(
      this,
      'DeployApplication'
    ),
    role: new iam.Role(this, 'DeployServiceRole', {
      assumedBy: new iam.ServicePrincipal('codedeploy.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'AdministratorAccess' // TODO give least privilege to the codebuild role
        ),
      ],
    }),
    deploymentConfig: codedeploy.ServerDeploymentConfig.ALL_AT_ONCE,
    ec2InstanceTags: new codedeploy.InstanceTagSet({
      app: ['next-app'],
    }),
    autoScalingGroups: [autoScalingGroup],
    installAgent: true,
  }
);
```
- CodeDeploy can be used for the three deployment types: Lambda, ECS and EC2/on-premise. We are using `ServerApplication` class to deploy into EC2 instance.
- The `autoScalingGroups` prop is where you pass array of auto scaling groups and all the EC2 instances that deployed by these groups will be target for the web app deployment.
- Setting the `installAgent` to true installs code deploy agent to your EC2 instances. You can see its status via ssh-ing into your instance and running:   
  `sudo service codedeploy-agent status`
- If you end up having errors on CodeDeploy service you should look at the logs and they can be found through:    
  `cat opt/codedeploy-agent/deployment-root/deployment-logs/codedeploy-agent-deployments.log`

- Even though `appspec.yml` file is not presented on CodeDeploy config, it will be used as specification file for the deployment process. It should be included in the `buildArtifact` hence it resides on the `/frontend` directory. If we look at the content of file:
 
```json
version: 0.0
os: linux
files:
  - source: /
    destination: /frontend
file_exists_behavior: OVERWRITE
hooks:
  ApplicationStart:
    - location: cicd-scripts/start-server.sh
      timeout: 300
      runas: root
```
1. The `files` block instructs CodeDeploy to take all the contents of the `buildArtifact`  and place them inside the `/frontend` directory within the EC2 instance.
2. file_exists_behavior: OVERWRITE instructs CodeDeploy to replace any file even if it exists `/frontend` directory. 
3. The `hooks` block is where you can run custom scripts through life cycle events of CodeDeploy service. We're gonna use only one hook for convinence and here is the content of `start-server.sh` 


```bash
#!/bin/bash
echo "hello from start-server"
pwd
whoami
ls
sudo su

#Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash 
/.nvm/nvm.sh #.nvm will be available inside the $HOME directory
#configure to use nvm right away:
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  #This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion"  #This loads nvm bash_completion
nvm install 16
node -v

cd /frontend
npm i

#Find and kill all Node.js processes related to the previous Next.js app
killall -TERM node

#Wait for the processes to stop (adjust the sleep duration based on your application's shutdown time)
sleep 5

#Run the npm start command in the background
npm run start -- -p 80 >/dev/null 2>&1 &

#Exit the script immediately after starting the server
exit 0

```
- Current working directory, current user's username, and the contents of the current directory, respectively printed. These commands are there for debugging purposes and I include them all the time.
- Nodejs is installed and path is configured to include nvm and npm scripts.
- Directory is changed to /frontend and npm dependencies is installed that web app relies.
- `killall -TERM node` is there to kill previous Next.js server if it exists. The subsequent sleep 5 command provides a brief delay, allowing time for the previous server to shut down properly before launching the new Next.js server.
- Lastly, Next.js web application is started on port 80. The `>/dev/null 2>&1` redirects the standard output and error streams to /dev/null, discarding any output. The `&` at the end runs the command in the background, allowing the script to continue immediately without waiting for the application to finish. If `&` is ommited, start-server.sh will never exit and code deploy agent won't be able to talk with CodePipeline service. Resulting as fail on pipeline process.

## See the deployed Next.js app on browser
Head over to AWS EC2 console and learn your Public DNS. It should be similar to following, "ec2-52-34-158-235.us-west-2.compute.amazonaws.com".
Open the domain on HTTP protocol for my case it's http://ec2-52-34-158-235.us-west-2.compute.amazonaws.com

Tadaa!

![Nextjs start](/images/posts/custom-cicd-pipeline-with-codepipeline-service/nextjs-start.png)


## Test drive

Make modifications on Next.js app then push your commits to CodeCommit to trigger pipeline. Watch the pipeline process on the AWS console while CodePipeline does his thing. After couple of minutes, your changes should reflect on EC2 instance.

## What could be done better?

1. The provided repository is designed as a monorepo for the purpose of being a single reference in a blog post. However, being monorepo leads to that even if only IaC is changed, Next.js app will be redeployed which is unnecessary. Here are the solutions:
   -  Separate Repositories: One option is to have separate repositories for the `/frontend` directory and the Infrastructure as Code (IaC) code. This way, changes to the IaC code won't trigger redeployments of the Next.js app. The CI/CD process should listen to the repository containing the `/frontend` directory, ensuring that only changes to the app code trigger the deployment pipeline.
   -  Conditional Pipeline Start: Alternatively, the CI/CD pipeline can be enhanced to start the pipeline process only if the commit includes changes in the `/frontend` directory. This can be achieved by configuring the pipeline to check for modifications in the specific directory before initiating the deployment process. If no changes are detected in the `/frontend` directory, the pipeline will not be triggered, avoiding unnecessary redeployments.

2. Define least privilege for every service. Admin access is used for the EC2, CodeBuild and CodeDeploy services. With this permission attached to any service, using the repository in production is not safe and recommended.

## References
- https://docs.aws.amazon.com/codedeploy/latest/userguide/codedeploy-agent-operations-install-linux.html
- https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file.html
- https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html