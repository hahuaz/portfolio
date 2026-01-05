---
title: "Deploy SPA to AWS"
summary: "Deploying a Single Page Application (SPA) to Amazon Web Services (AWS) is a popular and powerful way to host your web app."
createdAt: "2023-01-16"
tags: ['cdk', 'ts']
image: '/images/posts/deploy-spa-to-aws/aws-website-hosting.png'
---

## Introduction

Deploying a Single Page Application (SPA) to Amazon Web Services (AWS) is a flexible and scalable way to host your web application. AWS offers a variety of services that can be used to deploy and host SPAs, including Amazon S3 and Amazon CloudFront.

## What will we be doing?

To deploy our SPA to AWS, we need to create an S3 bucket and upload our SPA files to the bucket. Then we will use CloudFront (CDN) to distribute the content globally. The only thing that can be tricky is configuring CloudFront in such a way that it will serve index.html for every route we have in our application.

The completed project can be found [here](https://github.com/hahuaz/cdk-examples/tree/dev/deploy-spa-to-aws).

## Prerequisites

- Having [AWS CLI](https://aws.amazon.com/cli/) and [AWS CDK CLI](https://docs.aws.amazon.com/cdk/v2/guide/cli.html) installed on your machine and being familiar with them.
- The build files of your SPA. As long as your entry point is index.html, it doesn't matter which framework or frontend tooling you've used to create them.

## Start a new CDK project

Open up your terminal in an empty directory and execute:

```bash
cdk init app --language typescript
```

Head over your CDK starter file that is in the "bin" directory and populate it with your environment variables.

```ts
new DeploySpaToAwsStack(app, 'DeploySpaToAwsStack', {
  env: { account: process.env.AWS_ACCOUNT, region:  process.env.AWS_REGION },
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});

```

Deploy an empty stack to your AWS account, but first, you need to configure your AWS CLI to work with profiles. Learn more about named profiles in [here](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html).

```bash
cdk deploy --profile <yours>
```

After a successful deployment, you should see output similar to the following in the terminal:

![deploy-success](/images/posts/deploy-spa-to-aws/deploy-success.png)

## Create necessary resources

### S3 bucket for storing site files

```ts
const siteBucket = new aws_s3.Bucket(this, 'siteBucket', {
  websiteIndexDocument: 'index.html',
  publicReadAccess: true,
  removalPolicy: cdk.RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
});
```

- We mark the bucket as public. Thanks to CDK, it can be done by a single prop, but I encourage you to check this [document](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteAccessPermissionsReqd.html).

- We are also enabling static website hosting for the bucket by specifying the websiteIndexDocument prop.

### Cloudfront for site distribution

First, we need to define our CloudFront cache policy. While doing continuous integration, I always keep the numbers zero. It basically disables the cache, and you always get fresh content from your origin. You need to increase the numbers for the production environment.

```ts
const cachePolicy = new aws_cloudfront.CachePolicy(this, 'cachePolicy', {
  defaultTtl: cdk.Duration.days(0),
  minTtl: cdk.Duration.minutes(0),
  maxTtl: cdk.Duration.days(0),
});
```

 Secondly, we define our CloudFront response header policy. We enable
            CORS for HEAD, GET and OPTION methods. This will be helpful if you
            somehow need to use your website inside an iframe. <br /> You also
            can enable browser cache before going production by defining custom
            headers.

```ts
const responsePolicy = new aws_cloudfront.ResponseHeadersPolicy(
  this,
  'responsePolicy',
  {
    // TODO activate browser cache
    // customHeadersBehavior: {
    //   customHeaders: [
    //     {
    //       header: 'Cache-Control',
    //       value: 'max-age=2592000',
    //       override: true,
    //     },
    //   ],
    // },
    corsBehavior: {
      accessControlAllowOrigins: ['*'],
      accessControlAllowMethods: ['HEAD', 'GET', 'OPTIONS'],
      accessControlAllowHeaders: ['*'],
      originOverride: true,
      accessControlAllowCredentials: false,
    },
  }
);
```
Lastly, we create our CloudFront distribution whose origin is the
            siteBucket.

```ts
const siteBucketOrigin = new aws_cloudfront_origins.S3Origin(siteBucket);

const siteBucketDist = new aws_cloudfront.Distribution(
  this,
  'siteBucketDist',
  {
    defaultBehavior: {
      origin: siteBucketOrigin,
      viewerProtocolPolicy:
        aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      allowedMethods: aws_cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      cachePolicy: cachePolicy,
      responseHeadersPolicy: responsePolicy,
    },
    additionalBehaviors: {},
    errorResponses: [
      {
        httpStatus: 404,
        responseHttpStatus: 200,
        responsePagePath: '/index.html',
      },
    ],
  }
);

// CFN OUTPUTS
new cdk.CfnOutput(this, 'siteBucketDistDomain', {
  value: siteBucketDist.distributionDomainName,
  description: 'The domain name of siteBucketDist',
});
```

It will be wiser to explain the viewer and origin concepts for any given CDN at this point.

## Understanding Viewer Requests and Origin Requests in CloudFront
![CloudFront Request Life Span](/images/posts/deploy-spa-to-aws/cloudfront-request-life-span.png)

*Viewer request* refers to a request made by a user to access a specific resource or file that is stored on a CloudFront distribution. This request can be made through a web browser or any other application that is capable of making HTTP requests.

*Origin request* refers to a request made by CloudFront to the origin server (such as an S3 bucket or an EC2 instance) to retrieve the requested resource or file. The origin server will then return the requested resource to CloudFront, which will then pass it on to the viewer.

For our distribution, we're configuring the viewer response behavior on the errorResponses prop. This configuration is important for SPAs because when a requested page is different than the root (/), for example https:\/\/yours.com/about, CloudFront won't find it on the origin (siteBucket) because it doesn't exist. When this occurs, it will serve the index.html instead of returning a 404 error. On the client side, JavaScript will take over and show the requested page by looking up the URL.

## Deployment
### Deploy the stack
Deploy the stack again to create the newly defined resources.

```bash
cdk deploy --profile <yours>
```

Terminal will print the S3 URL for the site bucket and the domain for the distribution:

![Distribution Domain](/images/posts/deploy-spa-to-aws/distribution-domain.png)


### Deploy the build files to S3

Before using the distribution domain, we need to deploy the build files of the SPA to S3. Head over to your build directory and run:

```bash
aws s3 cp . <your-s3-url> --recursive --profile <yours>
```

Now, you can view your app in the browser by visiting distribution
            domain.

## Clean up 
Clean up your account by destroying the stack:
  
```bash
cdk destroy --profile <yours>
```