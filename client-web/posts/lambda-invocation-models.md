---
title: "Lambda Invocation Models"
summary: "The blog post covers three main invocation models: synchronous invocation, asynchronous invocation, poll-based invocation."
createdAt: "2023-07-12"
tags: ['lambda']
image: '/images/posts/general/lambda.png'
---
## Introduction

With Lambda, you can execute code in response to events or triggers, such as changes to data in an Amazon S3 bucket, updates to a DynamoDB table, or an API Gateway request. One of the key aspects of using Lambda is understanding the different invocation models available and how they can be leveraged to build scalable and efficient serverless applications.

## 1. Synchronous Invocation
Synchronous invocation is the default invocation model for Lambda functions. In this model, the client sends a request to the Lambda service and waits for a response. The Lambda function is executed immediately, and the response is returned to the client once the function completes its execution. This model is suitable for scenarios where client needs to wait for the function's result before proceeding.

![synchronous-invocation](/images/posts/lambda-invocation-models/synchronous-invocation.png)

Key characteristics:

- The client is blocked and waits for the response from the Lambda function.
- The client needs to handle retries and timeouts in case the Lambda function is unavailable or encounters an error.
- The maximum allowed timeout for synchronous invocations 15 minutes.

#### Services which use the Synchronous Invocation model:
1. API Gateway
2. Application Load Balancer 
3. Amazon CloudFront (Lambda@Edge)
4. AWS Management Console


## 2. Asynchronous Invocation
In this model, the client sends a request to the Lambda service but doesn't wait for a response. The Lambda function is executed asynchronously, and the processed response is not returned to the client. Instead, the Lambda service returns a response indicating that the function invocation has been enqueued for execution.

![asynchronous-invocation](/images/posts/lambda-invocation-models/asynchronous-invocation.png)


Key characteristics:

- The client is not blocked block and can continue with its execution without waiting for the function's processed response.
- It is well-suited for scenarios where the client doesn't require an immediate response or can handle the response asynchronously.
- Publisher and subscriber doesn't know each other and decoupled.
- Asynchronous invocations are retried automatically by the Lambda service in case of failures.
- If you need to process the result of asynchronous Lambda invocation, you can store the invocation result in an Amazon Simple Queue Service (SQS) queue for further processing.


#### Services which use the Asynchronous Invocation model:

1. Amazon SNS (Simple Notification Service)
2. AWS EventBridge (formerly Amazon CloudWatch Events)


## 3. Poll-based Invocation
In this model, Lambda functions are responsible for polling the event source, processing the events, and then providing feedback to the source regarding the success or failure of the invocation.

![poll-based-invocation](/images/posts/lambda-invocation-models/poll-based-invocation.png)


 Key characteristics:
- It is particularly useful for scenarios where the scale of Lambda functions, event consumer, may be throttled due to external factors such as third-party API rate limiting. So events can wait in the queue until Lambda functions are available to process them.
- Lambda functions actively poll the service for new events or records. The polling interval and rate can be configured to match the desired frequency of checking for new data.
- Lambda functions can retrieve and process the polled events or records in batches.
- Lambda functions are decoupled from the event publisher.


#### Services which use the Poll-based Invocation model:

1. Amazon SQS
2. Amazon Kinesis

## References
- https://aws.amazon.com/blogs/architecture/understanding-the-different-ways-to-invoke-lambda-functions/