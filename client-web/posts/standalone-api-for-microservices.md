---
title: "Standalone API for Microservices"
summary: "Create a standalone API for your microservices and map them to your API Gateway custom domain name."
createdAt: "2023-07-15"
tags: ['microservice', 'api']
image: '/images/posts/general/apigateway.png'
---

The completed project can be found [here](https://github.com/hahuaz/cdk-examples/tree/dev/standalone-api-for-microservices).

## Introduction

Before diving into creating a standalone API, let's quickly recap the key concepts.   
Microservices are small, self-contained services that focus on specific business functionalities. These services communicate with each other through APIs.
Each microservice can be developed and deployed by seperate teams, as long as the API contract remains consistent. Moreover, microservice approach supports scalability since you have the ability to scale individual microservices according to their unique requirements.


## System Design Diagram
![system-design-diagram](/images/posts/standalone-api-for-microservices/system-design-diagram.png)

API Gateway custom domain will be alias target for the A record in Route53 service.   
API Gateway custom domain will act as reverse proxy and forward the request to appropriate microservice API based on the accessed resource. For example, if a request is made to "/order/*" resource, the API Gateway custom domain will direct the request to Order Microservice API. Then, Order Microservice API can implement its own route handling to define the specific endpoints and actions associated with the "/order" resource.


## Infrastructure as Code (IaC)

```ts filename-cdk-starter
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
dotenv.config();

import AppStack from '../infrastructure/app-stack';
import OrderMicroserviceStack from '../infrastructure/order-microservice-stack';

const { AWS_ACCOUNT, AWS_REGION } = process.env;

const app = new cdk.App();
const BRANCH = app.node.tryGetContext('BRANCH');
const { APP_NAME } = app.node.tryGetContext(BRANCH);

const appStack = new AppStack(app, APP_NAME, {
  env: { account: AWS_ACCOUNT, region: AWS_REGION },
});

const microserviceStack = new OrderMicroserviceStack(app, 'order-micro', {
  env: { account: AWS_ACCOUNT, region: AWS_REGION },
});

microserviceStack.addDependency(appStack);
```
- For convenience, both stacks are deployed from the same repository. However, in a real use case, they would be separate repositories with separate deployments. Additionally, to reflect a real use case, we don't directly share dependency resources between the stacks by passing them as props to the stacks.
- The `microserviceStack` is marked as dependent on the `appStack`. This ensures that the appStack deployment finishes before the microserviceStack tries to reference the appStack resources, allowing for successful resource retrieval.

<br />

```ts filename-app-stack
import * as cdk from 'aws-cdk-lib';
import {
  aws_apigateway,
  aws_certificatemanager,
  aws_route53,
  aws_route53_targets,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export default class AppStack extends cdk.Stack {
  public apiCustomDomain: aws_apigateway.DomainName;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { DOMAIN, API_SUB_DOMAIN, API_CERTIFICATE_ARN } = process.env;
    if (!DOMAIN || !API_SUB_DOMAIN || !API_CERTIFICATE_ARN)
      throw new Error('There is at least one undefined environment variable!');

    // create API Gateway custom domain which will be used as reverse proxy for all microservice APIs
    this.apiCustomDomain = new aws_apigateway.DomainName(this, 'domain-name', {
      domainName: API_SUB_DOMAIN,
      // API Gateway certificate must be issued on same region as the stack
      certificate: aws_certificatemanager.Certificate.fromCertificateArn(
        this,
        'cert',
        API_CERTIFICATE_ARN
      ),
      endpointType: aws_apigateway.EndpointType.REGIONAL,
      securityPolicy: aws_apigateway.SecurityPolicy.TLS_1_2,
    });

    // add API Gateway custom domain as A record target
    new aws_route53.ARecord(this, 'apiRecord', {
      zone: aws_route53.HostedZone.fromLookup(this, 'hostedZone', {
        domainName: DOMAIN,
      }),
      recordName: API_SUB_DOMAIN,
      target: aws_route53.RecordTarget.fromAlias(
        new aws_route53_targets.ApiGatewayDomain(this.apiCustomDomain)
      ),
    });

    // Export the `apiCustomDomain` props as a CloudFormation output so it can be referenced from microservices stack
    new cdk.CfnOutput(this, 'domainName', {
      value: this.apiCustomDomain.domainName,
      exportName: 'domainName',
    });
    new cdk.CfnOutput(this, 'domainNameAliasDomainName', {
      value: this.apiCustomDomain.domainNameAliasDomainName,
      exportName: 'domainNameAliasDomainName',
    });
    new cdk.CfnOutput(this, 'domainNameAliasHostedZoneId', {
      value: this.apiCustomDomain.domainNameAliasHostedZoneId,
      exportName: 'domainNameAliasHostedZoneId',
    });
  }
}
```
- API Gateway custom domain is created and added as alias target on API_SUB_DOMAIN record, e.g "api.example.com".
- The certificate should be issued prior to deploying the app stack and ARN must be provided as environment variable.
- CloudFormation outputs are created to export the apiCustomDomain properties. These outputs will be used in microservice stacks to create `IDomain` interface. 

It's important to note that when designing the AJAX process flow, avoid introducing new subdomains unnecessarily. This is because each subdomain requires a new TLS handshake, which introduces additional latency to the system.

<br />

```ts filename-order-microservice-stack
import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { aws_lambda, aws_apigateway } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export default class OrderMicroserviceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const exampleLambda = new NodejsFunction(this, 'exampleLambda', {
      memorySize: 128,
      timeout: cdk.Duration.seconds(15),
      runtime: aws_lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, `/../lambdas/example.ts`),
      bundling: {
        minify: false,
        forceDockerBundling: true,
      },
    });

    // create Order API
    const orderApi = new aws_apigateway.RestApi(this, 'orderApi', {
      defaultCorsPreflightOptions: {
        allowOrigins: aws_apigateway.Cors.ALL_ORIGINS,
        allowMethods: aws_apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });
    orderApi.root.addProxy({
      anyMethod: true,
      defaultIntegration: new aws_apigateway.LambdaIntegration(exampleLambda),
    });

    // Create base path mapping for the Order API
    new aws_apigateway.BasePathMapping(this, 'orderApiMapping', {
      domainName: aws_apigateway.DomainName.fromDomainNameAttributes(
        this,
        'CustomDomain',
        {
          domainName: cdk.Fn.importValue('domainName'),
          domainNameAliasHostedZoneId: cdk.Fn.importValue(
            'domainNameAliasHostedZoneId'
          ),
          domainNameAliasTarget: cdk.Fn.importValue(
            'domainNameAliasDomainName'
          ),
        }
      ),
      restApi: orderApi,
      basePath: 'order',
    });
  }
}
```
- A REST API is created and added as target on `/order/*` path to the API Gateway Custom domain.
- The `domainName` prop accepts `IDomain` interface as value so we've used aws_apigateway.DomainName.fromDomainNameAttributes() function to create it.

## Testing the mapping configuration

```bash
curl -X GET https://api.example.com/order/1
{"message":"Successful lambda invocation"}
```


## References
- https://repost.aws/questions/QU6sXRXAzXQze9wWNJz1TUAw/reference-resources-between-cdk-stacks