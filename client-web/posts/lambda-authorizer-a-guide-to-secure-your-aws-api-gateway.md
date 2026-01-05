---
title: "Lambda Authorizer: A Guide to Secure Your AWS API Gateway"
summary: "Lambda Authorizer, a serverless function-based authorization method, can secure your API endpoints and control access to your APIs."
createdAt: "2023-07-20"
tags: ['cdk', 'lambda']
image: '/images/posts/general/lambda.png'
---
The completed project can be found [here](https://github.com/hahuaz/cdk-examples/tree/dev/lambda-authorizer).

![lambda authorizer](/images/posts/lambda-authorizer-a-guide-to-secure-your-aws-api-gateway/lambda-authorizer.png)

A Lambda Authorizer is a custom authorizer that uses an AWS Lambda function to control access to an API. The Lambda function acts as a middleware, taking the incoming request and returning either an allow or deny policy.


## Why Use a Lambda Authorizer?

With a Lambda function, you have full control over the authorization logic, enabling you to use custom authentication mechanisms like OAuth, JWT, or custom tokens.

- Flexibility: A Lambda Authorizer gives you complete control over the authorization logic, allowing you to use custom authentication mechanisms.
- Scalability: Lambda functions automatically scale to handle any number of requests, making it easy to handle high levels of traffic without any manual intervention.
- Easy Integration with other AWS Services
- Serverless Architecture: You don't have to worry about managing servers or infrastructure. This allows you to focus on writing and deploying your authorization logic, without worrying about server management and maintenance.
- Pay per use: If an incoming request doesn't have the required authorization header, it will be dropped by the API Gateway without reaching the Lambda Authroizer. This means you won't pay for Lambda call but only for API request.
- Maintainability: By separating the authorization code from the application code, you improve the maintainability of your codebase. This helps to manage and update your authorization logic in the future. Additionally, separating the authorization code helps to reduce the risk of security vulnerabilities, as it makes it easier to identify and fix security issues in your authorization logic.


## Infrastructure as Code (IaC) by using CDK
This blog post assumes you know the basics of creating and deploying CDK apps. We will first create infrastructure and then Authorizer Lambda handler.

### Lambda Construct

```ts
export class LambdaConstruct extends Construct {
  public readonly lambdaAuthorizer: aws_lambda_nodejs.NodejsFunction;
  public readonly helloWorldLambda: aws_lambda_nodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    this.lambdaAuthorizer = new aws_lambda_nodejs.NodejsFunction(
      this,
      'lambdaAuthorizer',
      {
        memorySize: 128,
        timeout: cdk.Duration.seconds(5),
        runtime: aws_lambda.Runtime.NODEJS_18_X,
        handler: 'handler',
        entry: path.join(__dirname, `/../../lambdas/lambda-authorizer.ts`),
      }
    );
    this.helloWorldLambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      'helloWorldLambda',
      {
        memorySize: 128,
        timeout: cdk.Duration.seconds(5),
        runtime: aws_lambda.Runtime.NODEJS_18_X,
        handler: 'handler',
        entry: path.join(__dirname, `/../../lambdas/hello-world.ts`),
      }
    );
  }
}
```
- The lambda construct will output two straightforward lambda functions.
- Authorizer lambda will include the handler code to authorize incoming requests.
- Hello world lambda will return a simple JSON output.
<br />

### Api Construct

Whole Api construct code is shown below but we also try to explain what every resource does.

```ts filename-api
export class ApiConstruct extends Construct {
  public readonly restApi: aws_apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);

    const { lambdaAuthorizer, helloWorldLambda } = props;

    this.restApi = new aws_apigateway.RestApi(this, 'rest', {
      defaultCorsPreflightOptions: {
        allowOrigins: aws_apigateway.Cors.ALL_ORIGINS,
        allowMethods: aws_apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    this.restApi.addGatewayResponse('403', {
      type: aws_apigateway.ResponseType.UNAUTHORIZED,
      statusCode: '403',
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
      },
    });

    const tokenAuthorizer = new aws_apigateway.TokenAuthorizer(
      this,
      'tokenAuthorizer',
      {
        handler: lambdaAuthorizer,
        resultsCacheTtl: cdk.Duration.seconds(0),
      }
    );

    // catches /{+proxy}
    this.restApi.root.addProxy({
      anyMethod: true,
      defaultIntegration: new aws_apigateway.LambdaIntegration(
        helloWorldLambda
      ),
      defaultMethodOptions: {
        authorizationType: aws_apigateway.AuthorizationType.CUSTOM,
        authorizer: tokenAuthorizer,
      },
    });
  }
}
```

#### Initiate REST API
As of 2023-07-15, [aws-apigatewayv2-alpha](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigatewayv2-readme.html) L2 construct is in the alpha stage. We will use v1, but if you're going for your app's next release, check the difference between REST API and HTTP API. AWS takes action to phase out REST API.

```ts
this.restApi = new aws_apigateway.RestApi(this, 'rest', {
  defaultCorsPreflightOptions: {
    allowOrigins: aws_apigateway.Cors.ALL_ORIGINS,
    allowMethods: aws_apigateway.Cors.ALL_METHODS,
    allowHeaders: ['Content-Type', 'Authorization'],
  },
});
```
- We allow CORS for all origins and methods but you can easily pass an array to restrict some domain or method. Defining the CORS option in the root will affect every route for your API, which removes the burden to define CORS on every route. If you want to fine-tune some routes individually after, you definitely can.
- Be sure to include "Authorization" header as allowed headers.

#### Modify the default response

```ts
this.restApi.addGatewayResponse('403', {
  type: aws_apigateway.ResponseType.UNAUTHORIZED,
  statusCode: '403',
  responseHeaders: {
    'Access-Control-Allow-Origin': "'*'",
  },
});
```
- API Gateway has default responses that it returns to the client if the request doesn't apply to defined criteria.
- There are a bunch of default responses that API Gateway returns to the client. Some of them are UNAUTHORIZED, THROTTLED, BAD_REQUEST_BODY, ACCESS_DENIED. When the Lambda authorizer returns a deny policy, API Gateway will send the UNAUTHORIZED response type to the client. By default, it won't allow any CORS header, so we won't be able to see the error message if request is not send from same-origin. We change this behavior with the above code snippet.


#### Define authorizer type

```ts
const tokenAuthorizer = new aws_apigateway.TokenAuthorizer(
  this,
  'tokenAuthorizer',
  {
    handler: lambdaAuthorizer,
    resultsCacheTtl: cdk.Duration.seconds(0),
  }
);
```
- Authorizer type can be one of the following, `TokenAuthorizer` and `RequestAuthorizer` and we're gonna use TokenAuthorizer.
- TokenAuthorizer is used to verify the Authorization header value on the request which can be a JSON Web Token (JWT) or an OAuth token.
- RequestAuthorizer, on the other hand, is used to verify request parameters like headers, paths, and query strings.

#### Add root proxy to API
To maintain a manageable API Gateway resource definition, I
frequently use proxy in API Gateway because I don't want to endup
having 1000 line API Gateway resource definition. <br /> Then as
requirements arise, I will define route logic in lambda handler.
It's all about personel choice and trade-offs.

```ts
// catches /{+proxy}
this.restApi.root.addProxy({
  anyMethod: true,
  defaultIntegration: new aws_apigateway.LambdaIntegration(
    helloWorldLambda
  ),
  defaultMethodOptions: {
    authorizationType: aws_apigateway.AuthorizationType.CUSTOM,
    authorizer: tokenAuthorizer,
  },
});
```
- We enable every CRUD operation on proxy.
- As default integration, we pass the "helloWorldLambda", which we will define in Lambda construct.
- We use the custom authorizer for the `authorizationType`. It can also accept IAM and cognito types.



### Lambda handlers

```ts filename-hello-world
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

export const handler = async function (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log('INCOMING_EVENT\n', event);

  return {
    statusCode: 200,
    headers: {
      'access-control-allow-origin': '*',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify({ message: 'hello world!' }),
  };
};
```
- The helloWorldLambda represents a downstream process that occurs after the authorization flow, but it doesn't have much functionality in our example."

<hr />

```ts filename-lambda-authorizer
import {
  APIGatewayTokenAuthorizerEvent,
  APIGatewayAuthorizerResult,
} from 'aws-lambda';

const generateAllowPolicy = (arn: string) => ({
  principalId: 'user',
  policyDocument: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: 'Allow',
        Resource: arn,
      },
    ],
  },
});

const generateDenyPolicy = () => ({
  principalId: 'user',
  policyDocument: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: 'Deny',
        Resource: '*',
      },
    ],
  },
});

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  console.log('INCOMING_EVENT\n', event);

  const { authorizationToken, methodArn } = event;

  const token = authorizationToken.replace('Bearer ', '');

  // Your token verify logic goes here
  if (token === 'myawesometoken') {
    return {
      ...generateAllowPolicy(methodArn),
      // Context object will be available in downstream handler via event.requestContext.authorizer
      context: {
        callerIdentity: 'placeholder',
      },
    };
  } else {
    return generateDenyPolicy();
  }
};
```

- The blog post only aims to demonstrate how to utilize Lambda Authorizer in CDK App and doesn't dictate any logic on the authorization flow. In general, you would verify a JWT token here by using well-known libraries. But to keep things simple, I directly check the bearer token whether it's equal to my value.
- You need to return IAM policies to tell API Gateway whether the incoming request passes the authorization or not.
- Downstream will have access to the context via `event.requestContext.authorizer`. You can use this context to pass variables such as callerIdentity.
- You can check the CloudWatch console to see the INCOMING_EVENT, but here is an example of the JSON structure:

```json
{
  "type": "TOKEN",
  "methodArn": "arn:aws:execute-api:us-west-2:{ACCOUNT_ID}:a5imcmrll0/prod/POST/mysource",
  "authorizationToken": "Bearer myawesometoken1"
}
``` 

The arn is the resource client tries to acesss, which is an API Gateway resource, and you should include it in your allow IAM statement.

That is it for the CDK side. Let's move on to the client and check the functionality.

## The client, index.html

The client will send an AJAX request to our backend URL. First, we will test the reject state by sending a wrong token, then the accept state by sending the right token.

You need to change the `api_url` value that is inside of `index.html` with yours. CDK will print the API URL of your app at the end of app deployment.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
  </head>
  <body>
    <p>check the console!</p>

    <script>
      const api_url =
        'https://a5imcmrll0.execute-api.us-west-2.amazonaws.com/prod/';

      async function getData() {
        const data = await fetch(`${api_url}mysource`, {
          method: 'POST',
          headers: {
            Authorization: 'Bearer wrongtoken',
          },
          body: JSON.stringify({
            message: 'Can I get what I want?',
          }),
        });
        const json = await data.json();
        console.log(json);
      }
      getData();
    </script>
  </body>
</html>
```
- When you send the request with the wrong token, API Gateway will respond with a 403 status code, and the message will say "User is not authorized to access this resource with an explicit deny".
- If you change the bearer token to "myawesometoken" and send the request again, the Lambda authorizer will allow the request to pass to the HelloWorld lambda, and you will get a nice hello world message.

As always, do not forget the cleanup your AWS account by destroying the stack.