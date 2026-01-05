---
title: "WebSocket API Starter"
summary: "Quick look at system design architecture for WebSocket API on AWS."
createdAt: "2023-07-13"
tags: ['aws', "api",]
image: '/images/posts/websocket-api-starter/websocket.png'
---

WebSocket is a communication protocol that provides bidirectional communication over a single TCP connection. It enables real-time, two-way communication between a client and a server, allowing them to send data back and forth. 

The completed project can be found [here](https://github.com/hahuaz/cdk-examples/tree/dev/websocket-api).

## System Design Architecture 
![design-diagram](/images/posts/websocket-api-starter/design-diagram.png)

1. The client initiates a connection request to the API Gateway, indicating its intention to establish a WebSocket connection.
2. The API Gateway receives the client's connection request and invokes the connectionHandler Lambda.
3. The connectionHandler Lambda to either saves or removes the connection ID from the connectionTable, based on the request type.
4. After successful connection is established, the client sends desired message to API Gateway, which then invokes the messageHandler Lambda.
5. The messageHandler Lambda retrieves the connected IDs from connectionTable and broadcasts the received message to all connected clients.

## Difference between Websocket API and REST API
1. Communication model: 
With WebSocket API, once the WebSocket connection is established, both parties can send data to each other without the need for the client to initiate a request.   
REST API follows a request-response model where the client initiates a request, and the server responds to it and vice-verca can't be accomplie
2. Use Cases Scenarios:
WebSocket is well-suited for applications that require real-time updates, such as chat applications, collaborative tools, live dashboards.   
REST API is widely used for building APIs that serve resources and enable CRUD (Create, Read, Update, Delete) operations.
3. Caching and State:
WebSocket does not inherently support caching mechanisms as it relies on real-time data exchange.   
REST APIs can leverage caching mechanisms at various levels, such as caching responses at the server, implementing client-side caching, or utilizing cache-control headers. This can improve performance and reduce the server load, especially for requests that fetch static or infrequently changing data. REST also follows a stateless communication model. Each request from the client to the server is independent and does not maintain any state on the server. The server treats each request as a standalone interaction, without any knowledge of previous requests made by the client. 

## Infrastructure as Code (IaC)

```ts filename-app-stack
import * as cdk from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

import { LambdaConstruct } from './constructs/lambda';
import { ApiConstruct } from './constructs/api';
import { StorageConstruct } from './constructs/storage';

export type LambdaConstructProps = {
  connectionsTable: cdk.aws_dynamodb.Table;
};
export type StorageConstructProps = any;

export type ApiConstructProps = {
  messageHandler: NodejsFunction;
  connectionHandler: NodejsFunction;
};

export default class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { connectionsTable } = new StorageConstruct(
      this,
      'storage',
      {} as StorageConstructProps
    );

    const { messageHandler, connectionHandler } = new LambdaConstruct(
      this,
      'lambda',
      {
        connectionsTable,
      } as LambdaConstructProps
    );
    const { webSocketApi } = new ApiConstruct(this, 'api', {
      messageHandler,
      connectionHandler,
    } as ApiConstructProps);
  }
}
```
- We initiate our construct classes and initialization order is important.   
  The `ApiConstruct` depens on the `LambdaConstruct` and the `LambdaConstruct` depens on `StorageConstruct`.
  I always keep this initialization order on my CDK apps. This is the most comfortable way for me to reference my resources with each other.

```ts filename-storage
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_dynamodb } from 'aws-cdk-lib';

import { StorageConstructProps } from '../app-stack';

export class StorageConstruct extends Construct {
  public readonly connectionsTable: aws_dynamodb.Table;

  constructor(scope: Construct, id: string, props: StorageConstructProps) {
    super(scope, id);

    // const {  } = props;

    this.connectionsTable = new aws_dynamodb.Table(this, 'connectionsTable', {
      partitionKey: {
        name: 'connectionId',
        type: aws_dynamodb.AttributeType.STRING,
      },
      billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // keep the table on removal from CDK
    });
  }
}
```
- Storage construct is straightforward and only creates the connectionTable.

```ts filename-lambda
import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { aws_lambda, aws_iam } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import { LambdaConstructProps } from '../app-stack';

export class LambdaConstruct extends Construct {
  public readonly messageHandler: NodejsFunction;
  public readonly connectionHandler: NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    const { connectionsTable } = props;
    
    this.connectionHandler = new NodejsFunction(this, 'connectionHandler', {
      memorySize: 128,
      timeout: cdk.Duration.seconds(15),
      runtime: aws_lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, `/../../lambdas/connection-handler.ts`),
      bundling: {
        minify: false,
        forceDockerBundling: true,
      },
      environment: {
        CONNECTIONS_TABLE_NAME: connectionsTable.tableName,
      },
    });
    connectionsTable.grantReadWriteData(this.connectionHandler);

    this.messageHandler = new NodejsFunction(this, 'messageHandler', {
      memorySize: 128,
      timeout: cdk.Duration.seconds(15),
      runtime: aws_lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, `/../../lambdas/message-handler.ts`),
      bundling: {
        minify: false,
        forceDockerBundling: true,
      },
      environment: {
        CONNECTIONS_TABLE_NAME: connectionsTable.tableName,
      },
    });
    connectionsTable.grantReadWriteData(this.messageHandler);
    this.messageHandler.role?.addManagedPolicy(
      aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
        'AmazonAPIGatewayInvokeFullAccess'
      )
    );
  }
}
```
- Lambda construct provision two Lambda resource. Both of them have read and write permission on the connectionTable
- We also grant `AmazonAPIGatewayInvokeFullAccess` on messageHandler lambda since it will broad cast the message to all clients by utilizing API Gateway SDK. 

```ts filename-api
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { ApiConstructProps } from '../app-stack';

import * as apigwv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import { WebSocketLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';

export class ApiConstruct extends Construct {
  public readonly webSocketApi: apigwv2.WebSocketApi;

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);

    const { messageHandler, connectionHandler } = props;

    this.webSocketApi = new apigwv2.WebSocketApi(this, 'mywsapi', {
      connectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          'connectionIntegration',
          connectionHandler
        ),
      },
      disconnectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          'disconnectIntegration',
          connectionHandler
        ),
      },
      defaultRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          'defaultIntegration',
          messageHandler
        ),
      },
    });

    const webSocketProdStage = new apigwv2.WebSocketStage(this, 'mystage', {
      webSocketApi: this.webSocketApi,
      stageName: 'prod',
      autoDeploy: true,
    });

    messageHandler.addEnvironment(
      'WS_CALLBACK_URL',
      webSocketProdStage.callbackUrl
    );

    // write below log in cfn output
    new cdk.CfnOutput(this, 'wsUrl', {
      value: webSocketProdStage.url,
      description: 'wsUrl is used to send messages from client to server.',
    });
    new cdk.CfnOutput(this, 'wsCallbackUrl', {
      value: webSocketProdStage.callbackUrl,
      description:
        'wsCallbackUrl is used to send messages from server to client.',
    });
  }
}
```
- The WebSocket API is initialized with Lambda integrations and the API stage is defined. You must always define stage while working with API Gateway whether it's REST or WebSocket API.
- The `webSocketProdStage.callbackUrl` is added as environment variable to the messageHandler Lambda.
- The `wsUrl` and `wsCallbackUrl` is outputted as CloudFormation Output for easy reference.   
  The `wsUrl` structure will be similar to following "wss://a5ummhiif2.execute-api.us-west-2.amazonaws.com/prod".   
  The `wsCallbackUrl` structure will be similar to following "https:\/\/a5ummhiif2.execute-api.us-west-2.amazonaws.com/prod/@connections".

## Lambda Handlers

```ts filename-connection-handler
import * as AWS from 'aws-sdk';
import {
  APIGatewayProxyWebsocketEventV2WithRequestContext,
  APIGatewayEventWebsocketRequestContextV2,
  APIGatewayProxyResult,
} from 'aws-lambda';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const { CONNECTIONS_TABLE_NAME } = process.env;
if (!CONNECTIONS_TABLE_NAME) {
  throw new Error('There is at least one undefined environment variable!');
}

export const handler = async (
  event: APIGatewayProxyWebsocketEventV2WithRequestContext<APIGatewayEventWebsocketRequestContextV2>
): Promise<APIGatewayProxyResult> => {
  console.log('Incoming Event:\n', JSON.stringify(event, null, 2));

  const { connectionId, routeKey } = event.requestContext;

  if (routeKey === '$connect') {
    await saveConnectionId(connectionId);
  } else if (routeKey === '$disconnect') {
    await deleteConnectionId(connectionId);
  }

  return { statusCode: 200, body: '' };
};

const saveConnectionId = async (connectionId: string): Promise<void> => {
  const params = {
    TableName: CONNECTIONS_TABLE_NAME,
    Item: {
      connectionId,
    },
  };

  try {
    await dynamoDB.put(params).promise();
  } catch (error) {
    console.error(`Error saving connection ID: ${connectionId}`, error);
  }
};

const deleteConnectionId = async (connectionId: string): Promise<void> => {
  const params = {
    TableName: CONNECTIONS_TABLE_NAME,
    Key: {
      connectionId,
    },
  };

  try {
    await dynamoDB.delete(params).promise();
  } catch (error) {
    console.error(`Error deleting connection ID: ${connectionId}`, error);
  }
};
```
- The connectionHandler has straightforward job, save the connection ID and return 200 status code.
- Returning status code 200 is important because it instructs API Gateway that the app successfully handled the incomming connection request and connection should be establised with the client.

```ts filename-message-handler
import * as AWS from 'aws-sdk';
import {
  APIGatewayProxyWebsocketEventV2WithRequestContext,
  APIGatewayEventWebsocketRequestContextV2,
  APIGatewayProxyResult,
} from 'aws-lambda';

const { WS_CALLBACK_URL, CONNECTIONS_TABLE_NAME } = process.env;
if (!CONNECTIONS_TABLE_NAME || !WS_CALLBACK_URL) {
  throw new Error('There is at least one undefined environment variable!');
}

const apiGatewayManagementApi = new AWS.ApiGatewayManagementApi({
  endpoint: WS_CALLBACK_URL,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const handler = async (
  event: APIGatewayProxyWebsocketEventV2WithRequestContext<APIGatewayEventWebsocketRequestContextV2>
): Promise<APIGatewayProxyResult> => {
  console.log('Incoming Event:\n', JSON.stringify(event, null, 2));

  const { body } = event;
  if (!body) return { statusCode: 404, body: 'No message body.' };

  try {
    await sendMessageToAllClients(body);
    return { statusCode: 200, body: 'Message sent successfully.' };
  } catch (error) {
    console.error('Error sending message:', error);
    return { statusCode: 500, body: 'Failed to send message.' };
  }
};

const sendMessageToAllClients = async (message: string): Promise<void> => {
  const connections = await getActiveConnections();

  const sendMessagePromises = connections.map(async (connection) => {
    await sendWebSocketMessage(connection.connectionId, message);
  });

  await Promise.all(sendMessagePromises);
};

const getActiveConnections = async (): Promise<any[]> => {
  const params = {
    TableName: CONNECTIONS_TABLE_NAME, 
  };

  try {
    const result = await dynamoDB.scan(params).promise();
    return result.Items!;
  } catch (error) {
    console.error('Error retrieving connections from DynamoDB:', error);
    return [];
  }
};

const sendWebSocketMessage = async (
  connectionId: string,
  message: string
): Promise<void> => {
  const params = {
    ConnectionId: connectionId,
    Data: JSON.stringify({ message: `${connectionId} says: ${message}` }),
  };

  try {
    await apiGatewayManagementApi.postToConnection(params).promise();
    console.log(`Message sent to connection: ${connectionId}`);
  } catch (error) {
    console.error(
      `Error sending message to connection: ${connectionId}`,
      error
    );
  }
};

```
- The ApiGatewayManagementApi is initialized with `WS_CALLBACK_URL`. Via this URL, API Gateway will be called from server to broad cast the message, and then API Gateway will forward the message to all clients.
- When a client sends a message using the `wsUrl`, the messageHandler Lambda is triggered. This Lambda function broadcasts the message to all connected clients, including the sender. However, if you want to exclude the sender from receiving the broadcasted message, you can implement filtering logic by excluding the sender's connection ID from the list of connection IDs scanned from the DynamoDB table.

## Testing the WebSocket API

We are gonna use https://piesocket.com and two Chrome browser in cognito mode since we are too lazy to implement a client.

<video src="/images/posts/websocket-api-starter/testing-websocket-api.mp4" controls title="Title"></video>

## References
- https://docs.aws.amazon.com/cdk/api/v2/docs/@aws-cdk_aws-apigatewayv2-alpha.WebSocketApi.html