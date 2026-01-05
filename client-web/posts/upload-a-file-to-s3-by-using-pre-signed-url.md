---
title: "Upload a file to S3 by using pre-signed URL"
summary: "Pre-signed URL can be used by clients to upload a file to an S3 bucket, without requiring the client to have AWS credentials."
createdAt: "2023-08-16"
tags: ['cdk', 's3']
image: '/images/posts/upload-a-file-to-s3-by-using-signed-url/upload.png'
---

The completed project can be found [here](https://github.com/hahuaz/cdk-examples/tree/dev/s3-pre-signed-url-file-upload).

## Introduction

Pre-signed URL can be used by clients to upload a file to an S3 bucket, without requiring the client to have AWS credentials or permission.   
This is made possible by the fact that the pre-signed URL includes a signature that is generated using the AWS credentials in the backend. This signature acts as a form of authentication allowing the client to upload the file to the specified S3 bucket without needing to provide their own AWS credentials.   
This is particularly useful in situations where it is not practical or secure to provide clients with direct access to an S3 bucket. 
For example, if a website allows users to upload images, it would not be secure to provide each user with their own AWS credentials.
Using a pre-signed URL also enables the developer to set the expiration time, which means that the URL will only be valid for a certain period of time.
This ensures that the client can only upload the file within the specified time frame, and prevents the URL from being used after the expiration time.

## What will we be doing?

We will create a CDK app that provision an S3 bucket and lambda that generates pre-signed URL. The CDK app will use [Lambda URLs](https://docs.aws.amazon.com/lambda/latest/dg/lambda-urls.html) instead of API Gateway to keep the infrastructure as simple as possible.
Then we will create simple client that uploads a media file (mp4) to our S3 bucket. 


Flow will be as following: First, the client will hit Lambda for pre-signed URL. Once the client has this URL, it will directly talk to the S3 API to upload the file exactly where it needs to be without needing any middleman. This makes things faster and simpler, as the client and S3 can interact directly. No need for extra servers in between!

## Prerequisites

- Having [AWS CLI](https://aws.amazon.com/cli/) and [AWS CDK CLI](https://docs.aws.amazon.com/cdk/v2/guide/cli.html) installed on your machine and being familiar with them.

## Infrastructure as Code

First we need to create a CDK app. Open up your terminal in empty directory and execute:

```bash
cdk init app --language typescript
```
Head over your CDK starter file that is in the "bin" directory and populate it with your environment variables.

```ts filename-cdk-starter
new DeploySpaToAwsStack(app, 'DeploySpaToAwsStack', {
  env: { account: process.env.AWS_ACCOUNT, region: process.env.AWS_REGION },
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
```
<p>
Deploy empty CDK stack to your account but first you need to configure
your AWS CLI to work with profiles. Learn more about named profiles
in [here](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html).
</p>

```bash
cdk deploy --profile <yours>
```

<p>
After a successful deployment, you should see output similar to the
following in the terminal:
</p>
![deploy-success](/images/posts/deploy-spa-to-aws/deploy-success.png)


### S3 bucket to store files
S3 bucket will be used to store the user uploaded assets.
  
```ts filename-storage
this.myBucket = new aws_s3.Bucket(this, "my-bucket", {
  publicReadAccess: true,
  blockPublicAccess: new aws_s3.BlockPublicAccess({
    blockPublicPolicy: false,
    restrictPublicBuckets: false,
    blockPublicAcls: true,
    ignorePublicAcls: true,
  }),
  cors: [
    {
      allowedOrigins: ["*"],
      allowedMethods: [
        aws_s3.HttpMethods.GET,
        aws_s3.HttpMethods.HEAD,
        aws_s3.HttpMethods.POST,
      ],
      allowedHeaders: ["*"],
    },
  ],
  removalPolicy: cdk.RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
});

```

- We mark the bucket as public.
- We also enable CORS to see the response of upload request in browser. 

### Lambda to produce pre-signed URL
Lambda will produce pre-signed URL which will be used as endpoint by the client to upload file.
  
```ts filename-lambda
this.signedUrlCreator = new NodejsFunction(this, "signed-url-creator", {
  memorySize: 128,
  timeout: cdk.Duration.seconds(5),
  runtime: aws_lambda.Runtime.NODEJS_18_X,
  handler: "handler",
  entry: path.join(__dirname, `/../../lambdas/signed-url-creator/index.ts`),
  environment: {
    MY_BUCKET_NAME: MY_BUCKET.bucketName,
  },
});

MY_BUCKET.grantWrite(this.signedUrlCreator);

const signedUrlCreatorUrl = this.signedUrlCreator.addFunctionUrl({
  authType: aws_lambda.FunctionUrlAuthType.NONE,
});

// CFN OUTPUTS
new CfnOutput(this, "signedUrlCreatorUrl.url", {
  value: signedUrlCreatorUrl.url,
});

```
- The lambda needs write permission to the bucket to be able to create pre-signed URL. We are utilizing `grantWrite()` on the created bucket for this.
- We're creating Lambda URL that is accessible via public Internet.
- I want to emphasize the importance of keeping the lambda timeout low here. Once lambda is called, its process can't be stopped manually by an outside force. It can run up to 15 minutes until it's forced to time out. If your code includes a loop make sure it's not infinite, especially if it creates a resource in the cloud.

## Lambda handler

```ts filename-signed-url-creator
import { randomUUID } from "crypto";

import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { S3 } from "aws-sdk";

const { APP_REGION, MY_BUCKET_NAME } = process.env;

const s3 = new S3({
  region: APP_REGION,
});

export const handler = async function (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log("INCOMING_EVENT\n", event);

  const directory = "client01";
  const fileExtension = ".mp4";
  const unixTime = Date.now();
  const s3Key = `${directory}/${unixTime}-${randomUUID()}${fileExtension}`;
  const URL_EXPIRATION_SECONDS = 300;

  const presignedPostParams: S3.PresignedPost.Params = {
    Bucket: MY_BUCKET_NAME,
    Expires: URL_EXPIRATION_SECONDS,
    Conditions: [
      ["content-length-range", 0, 104857600],
      ["starts-with", "$key", directory],
    ],
    Fields: {
      key: s3Key,
    },
  };

  const presignedPost = s3.createPresignedPost(presignedPostParams);

  return {
    statusCode: 200,
    headers: {
      "access-control-allow-origin": "*",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify({ presignedPost }),
  };
};

```
- We are using [createPresignedPost()](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#createPresignedPost-property) method to create pre-signed URL. It's a synchronous call. The `Fields` parameter is an essential part of this process, and it contains specific information that the client must provide when making a request to upload a file to the S3 bucket. The `key: s3Key` field specifies the path of the file within the S3 bucket where the client must upload the file. So, when the client uses the generated pre-signed URL to upload a file, it needs to include these Fields in its request so that S3 can understand where to save the uploaded file.
- Every key (file name) in the bucket needs to be unique. We can use core "crypto" module for that. We can also mock directory structure in AWS Console by using forward slash (/) in our key but keep in mind it is just for convenience on the console. There is no directory concept on S3.
- We're also limiting the content length of the file that client can upload. Content length and expiration time are important params for security.

Deploy the stack again to provision defined resources:

```bash
cdk deploy --profile <yours>
```
<p>Terminal will print the Lambda URL:</p>
![cfn output](/images/posts/upload-a-file-to-s3-by-using-signed-url/cfn-output.png)

<p>The pre-signed post object that lambda returns will be a json similar to following:</p>

```json
{
  "url": "https://s3.us-west-2.amazonaws.com/hahuaz-cdk-examples-storagemybucket896a2e28-3k88jwzetxk0",
  "fields": {
    "key": "client01/1674368848514-865ed21b-572a-4df4-9ee4-c1513f3cb68f.mp4",
    "bucket": "hahuaz-cdk-examples-storagemybucket896a2e28-3k88jwzetxk0",
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": "ASIA2RUPWZA266XF5E6Y/20230122/us-west-2/s3/aws4_request",
    "X-Amz-Date": "20230122T062728Z",
    "X-Amz-Security-Token": "IQoJb3JpZ2luX2VjEE8aCXVzLXdlc3QtMiJHMEUCIEx9+BX6XTx64o9JAD+gZMu8wRgy7ysvuGIKOoWsxgFuAiEAqep0Zom2U5aMJW/ACEX1W2WPExHPBbyEQV7rMbynGyYq3AMIuP//////////ARAAGgw3MjUwNzcxMTY5ODEiDG35huifQWo/OnHqLSqwA2x4sg3qJeVVF4Hxve0WIyv+QG6uYuH0uwrLCCTxDS68jg9SDswQG9cMAP+AYLf8ORjpNkGMuwnnq/Y/x9gHhsK4O+UsRwmGkq0czseCfNQpcJ+b/fWVTDvvqkFV7HFhSYi5kG7G72owAhNh/U4+HDOfxNsUv5EYYzT+cns4fvBmlNBxCiF4YFe5scvLIG+zpjIYmMswVkGnH/LTYXQqX0HoypQGFd5O03uXoqHDgReAhiswMpBbE0vM562AQWp34zhQiYzhAXiVOhzCYtoNKZzELXfrC+6S/Pvcs4Zb2nwKs78lh9Q00GYQTerlhpKtc2tEd2LDmYylwIw10U9mVXEgAvFeCzUGvA68nfrshacRvOS2MTzyOrhmcNZnRUuIqWyfQDGd9ImW8VnlHA0THGeHW2un5aB5bjDsoVp45Fl793RCotKtmeVp/54gkajEfQqkZbTd+yNul6TKerxOBI8t1FJDGcWj1pZJQzLqUvG59+VYy6BbLH43wfb0m+eHqY81+ydSc8nre67wGLgdYiMoutZdA2bAi2XOlIHWuCrbdFC6WdmYWNRwX5sxETNOlDDPrrOeBjqeASYcBpCVGA1+oSrr1svi1FLmHZFS5s/nIH6tkHrgKeFvsv8ClEkHsDbYH+jJEt9BlFThFc14oIJWrAgYUu11FetdNh5HE7xooKlZipAvgtlRtosC15BOZb7r0i8C5UjPMXG9fcVMNMAgdUQDjaENSBW8qSGNoN+MygsyaKje3TyCIsHEaISbKKBN+WFoK/rW84EyIcdEGqPwx1IcnRbA",
    "Policy": "eyJleHBpcmF0aW9uIjoiMjAyMy0wMS0yMlQwNjozMjoyOFoiLCJjb25kaXRpb25zIjpbWyJjb250ZW50LWxlbmd0aC1yYW5nZSIsMCwxMDQ4NTc2MDBdLFsic3RhcnRzLXdpdGgiLCIka2V5IiwiYXNzZXRzMjAyMyJdLHsia2V5IjoiYXNzZXRzMjAyMy8xNjc0MzY4ODQ4NTE0LTg2NWVkMjFiLTU3MmEtNGRmNC05ZWU0LWMxNTEzZjNjYjY4Zi5tcDQifSx7ImJ1Y2tldCI6ImhhaHVhei1jZGstZXhhbXBsZXMtc3RvcmFnZW15YnVja2V0ODk2YTJlMjgtM2s4OGp3emV0eGswIn0seyJYLUFtei1BbGdvcml0aG0iOiJBV1M0LUhNQUMtU0hBMjU2In0seyJYLUFtei1DcmVkZW50aWFsIjoiQVNJQTJSVVBXWkEyNjZYRjVFNlkvMjAyMzAxMjIvdXMtd2VzdC0yL3MzL2F3czRfcmVxdWVzdCJ9LHsiWC1BbXotRGF0ZSI6IjIwMjMwMTIyVDA2MjcyOFoifSx7IlgtQW16LVNlY3VyaXR5LVRva2VuIjoiSVFvSmIzSnBaMmx1WDJWakVFOGFDWFZ6TFhkbGMzUXRNaUpITUVVQ0lFeDkrQlg2WFR4NjRvOUpBRCtnWk11OHdSZ3k3eXN2dUdJS09vV3N4Z0Z1QWlFQXFlcDBab20yVTVhTUpXL0FDRVgxVzJXUEV4SFBCYnlFUVY3ck1ieW5HeVlxM0FNSXVQLy8vLy8vLy8vL0FSQUFHZ3czTWpVd056Y3hNVFk1T0RFaURHMzVodWlmUVdvL09uSHFMU3F3QTJ4NHNnM3FKZVZWRjRIeHZlMFdJeXYrUUc2dVl1SDB1d3JMQ0NUeERTNjhqZzlTRHN3UUc5Y01BUCtBWUxmOE9SanBOa0dNdXdubnEvWS94OWdIaHNLNE8rVXNSd21Ha3EwY3pzZUNmTlFwY0orYi9mV1ZURHZ2cWtGVjdIRmhTWWk1a0c3Rzcyb3dBaE5oL1U0K0hET2Z4TnNVdjVFWVl6VCtjbnM0ZnZCbWxOQnhDaUY0WUZlNXNjdkxJRyt6cGpJWW1Nc3dWa0duSC9MVFlYUXFYMEhveXBRR0ZkNU8wM3VYb3FIRGdSZUFoaXN3TXBCYkUwdk01NjJBUVdwMzR6aFFpWXpoQVhpVk9oekNZdG9OS1p6RUxYZnJDKzZTL1B2Y3M0WmIybndLczc4bGg5UTAwR1lRVGVybGhwS3RjMnRFZDJMRG1ZeWx3SXcxMFU5bVZYRWdBdkZlQ3pVR3ZBNjhuZnJzaGFjUnZPUzJNVHp5T3JobWNOWm5SVXVJcVd5ZlFER2Q5SW1XOFZubEhBMFRIR2VIVzJ1bjVhQjViakRzb1ZwNDVGbDc5M1JDb3RLdG1lVnAvNTRna2FqRWZRcWtaYlRkK3lOdWw2VEtlcnhPQkk4dDFGSkRHY1dqMXBaSlF6THFVdkc1OStWWXk2QmJMSDQzd2ZiMG0rZUhxWTgxK3lkU2M4bnJlNjd3R0xnZFlpTW91dFpkQTJiQWkyWE9sSUhXdUNyYmRGQzZXZG1ZV05Sd1g1c3hFVE5PbEREUHJyT2VCanFlQVNZY0JwQ1ZHQTErb1NycjFzdmkxRkxtSFpGUzVzL25JSDZ0a0hyZ0tlRnZzdjhDbEVrSHNEYllIK2pKRXQ5QmxGVGhGYzE0b0lKV3JBZ1lVdTExRmV0ZE5oNUhFN3hvb0tsWmlwQXZndGxSdG9zQzE1Qk9aYjdyMGk4QzVValBNWEc5ZmNWTU5NQWdkVVFEamFFTlNCVzhxU0dOb04rTXlnc3lhS2plM1R5Q0lzSEVhSVNiS0tCTitXRm9LL3JXODRFeUljZEVHcVB3eDFJY25SYkEifV19",
    "X-Amz-Signature": "36eb0a8b8b07b3d807a142c234444ad9ca61d9ac32b339f48a3865624a0e0f94"
  }
}
```

1. Value of "url" will be our POST request URL while sending the file to S3.
2. The "fields" object holds all the values that needs to be appended to the form.

<p>
That's all for backend operations. Let's create our humble client.
</p>

## The humble client

The Client will receive the file by simple HTML tag. In our case, file type is media but same process applies to every type.

```html  filename-index
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <form>
      <h1>File Upload</h1>
      <input type="file" accept="video/*" id="upload-input" />
      <button id="upload-button">Upload</button>
    </form>
    <script src="./upload-s3.js"></script>
  </body>
</html>
```
- You can enforce the media type by changing value of accept attribute on the input tag.


```js filename-upload-s3
const lambdaUrl =
  'https://s4kb7k5iws4reilkmx4g6nqwfe0ahnmk.lambda-url.us-west-2.on.aws/';

const uploadFile = async (e) => {
  e.preventDefault();

  const presignedPostResponse = await fetch(lambdaUrl);
  const { presignedPost } = await presignedPostResponse.json();
  console.log(presignedPost);

  let form = new FormData();

  Object.keys(presignedPost.fields).forEach((key) => {
    form.append(key, presignedPost.fields[key]);
  });

  // File must be last field in the form
  form.append('file', document.querySelector('#upload-input').files[0]);

  const uploadResponse = await fetch(presignedPost.url, {
    method: 'POST',
    body: form,
  });

  if (uploadResponse.status === 204) {
    console.log(uploadResponse);
  } else {
    console.log('upload failed!');
  }
};

document.querySelector('#upload-button').addEventListener('click', uploadFile);
```

- Change the value of the `lambdaUrl` variable with your own.
- We append all the pre-signed post fields to the form and then the file that we want to upload. We make a POST request to the S3 API, and if the response code is 204 (created), then you can view the file on your bucket.
- It's important to mention that the S3 API doesn't care what's your payload in the form. You can only force the payload on the client side.

Clean up your AWS account by destroying the stack:
  
```bash
cdk destroy --profile <yours>
```
