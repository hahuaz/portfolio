---
title: "Starter for S3 Object Lambda"
summary: "Learn how to leverage S3 Object Lambda in AWS to transform and manipulate data on-the-fly as it's retrieved from S3."
createdAt: "2023-07-07"
tags: ['aws', 's3', 'object-lambda']
image: '/images/posts/general/s3.webp'
---

## Introduction

AWS S3 Object Lambda is a powerful feature that allows you to transform and manipulate data in real-time as it's being retrieved from an S3 bucket.   
In this blog post, we'll explore the basics of S3 Object Lambda and walk through an example of how to use it to resize images on-the-fly. 

The completed project can be found [here](https://github.com/hahuaz/cdk-examples/tree/dev/s3-object-lambda).

## Example Use Case: Image Resizing

Resizing images on-the-fly based on your needs enables you avoid storing multiple versions of the same image. We will only produce thumbnail without any conditional check but you can always look up the request and produce more dynamic results.

## Infrastructure

The provided [repository](https://github.com/hahuaz/cdk-examples/tree/dev/s3-object-lambda) defines two basic components in the constructs directory: a Lambda function named `thumbnailCreator` and an S3 bucket named `mybucket`.

Give necessary permissions to the Lambda:

```ts filename-app-stack
// Allow lambda to read and write to access point
thumbnailCreator.addToRolePolicy(
  new aws_iam.PolicyStatement({
    effect: aws_iam.Effect.ALLOW,
    actions: ['s3:GetObject', 's3-object-lambda:WriteGetObjectResponse'],
    resources: ['*'],
  })
);
```
- s3:GetObject is necessary since lambda will retrieve the requested object for processing
- s3-object-lambda:WriteGetObjectResponse is necessary for lambda to pass processed object to GetObject operation.
- Asterisk is used for the resources value but feel free to define more specific resource ARN. 

Create S3 Access Point and associate it with the Lambda:

```ts filename-app-stack
// Create S3 access point
const s3AccessPoint = new aws_s3.CfnAccessPoint(this, 's3AccessPoint', {
  bucket: mybucket.bucketName,
});

// Associate s3 access point with lambda
const objectLambdaAccessPoint = new aws_s3objectlambda.CfnAccessPoint(
  this,
  'objectLambdaAccessPoint',
  {
    objectLambdaConfiguration: {
      supportingAccessPoint: s3AccessPoint.attrArn,
      transformationConfigurations: [
        {
          actions: ['GetObject'],
          contentTransformation: {
            AwsLambda: {
              FunctionArn: `${thumbnailCreator.functionArn}`,
            },
          },
        },
      ],
    },
  }
);
```
- We use the s3AccessPoint.attrArn value to learn Access Point ARN instead of defining the ARN by hand which can be error prone.
- Challenging part for me was not being able to see contentTransformation type. It doesn't expect complicated value but not seeing the type was suprising. After all we love TS documentation on AWS CDK.
- The aws_s3.CfnAccessPoint configuration also accepts `policy` prop to define IAM policy on the Access Point but I found defining the permission policies on the Lambda more intuitive.

## Lambda handlers
```ts filename-thumbnail-creator
import * as AWS from 'aws-sdk';
import axios from 'axios';
import sharp from 'sharp';


const s3 = new AWS.S3();

export const handler = async (event: any): Promise<any> => {
  console.log('Incoming Event:\n', JSON.stringify(event, null, 2));

  const { getObjectContext } = event;
  const { outputRoute, outputToken, inputS3Url } = getObjectContext;

  // inputS3Url is presigned URL
  const { data } = await axios.get(inputS3Url, { responseType: 'arraybuffer' });

  const resized = await sharp(data).resize({ width: 50 }).withMetadata();

  // Send the resized image back to S3 Object Lambda
  const params = {
    RequestRoute: outputRoute,
    RequestToken: outputToken,
    Body: resized,
  };
  await s3.writeGetObjectResponse(params).promise();

  return { statusCode: 200 };
};
```
    
- Example event payload can be found here [here](https://aws.amazon.com/blogs/aws/introducing-amazon-s3-object-lambda-use-your-code-to-process-data-as-it-is-being-retrieved-from-s3/#:~:text=%7B%0A%20%20%20%20%22-,xAmzRequestId,-%22%3A%20%221a5ed718%2D5f53%2D471d).
- The inputS3Url is nothing more than S3 Signed URL. It allows us to access S3 object without providing authentication method.
- To create thumbnail images, we utilize the "sharp" dependency. However, "sharp" is written in CommonJS and does not support ECMAScript Modules. Thus I had to add `"esModuleInterop": true` key-value pair into my tsconfig.json.
- writeGetObjectResponse() function passes the proccessed object to S3 GetObject operation from our lambda. It will be returned the client at the end.

## Testing the S3 Object Lambda Access Point
For testing we will use AWS CLI but you can use also use SDK on your chose of language.

```bash
aws s3api get-object --bucket '{objectLambdaAccessPointArn}' --key forest.jpg './thumbnail.jpg' --profile "{yourProfile}"
```

- Make sure to replace {objectLambdaAccessPointArn} with the value displayed in the terminal when you deploy the stack. Following code snippet provides value that will be printed.

```ts
new cdk.CfnOutput(this, 'objectLambdaAccessPointArn', {
  value: objectLambdaAccessPoint.attrArn,
  description: 'This arn can be used to access the object lambda.',
});
```

- Make sure to replace {yourProfile} with your named AWS profile, which provides credential for the request.


## Tip: Using CloudFront Caching with S3 Object Lambda

When using S3 Object Lambda, it's important to consider caching mechanisms to optimize performance and reduce unnecessary calls to the Object Lambda function. This is where CloudFront, the AWS content delivery network (CDN), comes into play.

By placing CloudFront in front of your S3 Object Lambda setup, you can take advantage of CloudFront's caching capabilities. CloudFront caches the transformed responses from the Object Lambda function, reducing the number of calls to S3 Object Lambda and improving response times for subsequent requests.

## References
- https://serverlessland.com/patterns/s3-object-lambda
- https://aws.amazon.com/blogs/aws/introducing-amazon-s3-object-lambda-use-your-code-to-process-data-as-it-is-being-retrieved-from-s3/
- https://github.com/pulumi/pulumi-cdk/blob/1168da5062d701a23febf7624a8b83370891e693/examples/s3-object-lambda/lib/s3-object-lambda-stack.ts#L80