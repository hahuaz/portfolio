---
title: "Resolve API S3 PutBucketPolicy Access Denied"
summary: "Address the common issue of 'API S3 PutBucketPolicy Access Denied' that arises when deploying S3 bucket with public access. The problem stems from changes implemented by Amazon S3 in April 2023, which altered the default settings for new buckets."
createdAt: "2023-07-08"
tags: ['aws', 'cdk']
image: '/images/posts/general/s3.webp'
---

## Produce the error

Init cdk app with latest version:

```bash
npx cdk init app --language typescript
```

Add following code snippet to your stack:

```ts filename-app-stack
const mybucket = new aws_s3.Bucket(this, 'mybucket2', {
  publicReadAccess: true,
  removalPolicy: cdk.RemovalPolicy.DESTROY,
});
```
Before April 2023, this code snippet would create public S3 bucket without any problem. But today you get following error while making deployment:
![s3 PutBucketPolicy Access Denied](/images/posts/resolve-api-s3-putbucketpolicy-access-denied/access-denied.png)


## What causes the problem?
As April 2023, Amazon S3 implemented changes to the default settings when creating a new bucket. These changes aim to improve security and include the following modifications:
- Enabling S3 Block Public Access
- Disabling S3 access control lists (ACLs)


You can read their blog post in [here](https://aws.amazon.com/about-aws/whats-new/2022/12/amazon-s3-automatically-enable-block-public-access-disable-access-control-lists-buckets-april-2023/) to learn more.

## Resolve the error

We configure the Block Public Access settings on bucket level by adding blockPublicAccess prop. 

```ts filename-app-stack
const mybucket = new aws_s3.Bucket(this, 'mybucket2', {
  publicReadAccess: true,
  blockPublicAccess: new aws_s3.BlockPublicAccess({
    blockPublicPolicy: false,
    restrictPublicBuckets: false,
    blockPublicAcls: true, 
    ignorePublicAcls: true,
  }),
  removalPolicy: cdk.RemovalPolicy.DESTROY,
});
```

- We prevent accessing the bucket through ACLs by assigning true to blockPublicAcls and ignorePublicAcls keys. You can read more about them [here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html#access-control-block-public-access-options:~:text=your%20S3%20buckets-,Block%20public%20access%20settings,-S3%20Block%20Public).
- By assigning false to `blockPublicPolicy`, we enable putting Bucket policy that allows public access on bucket.
- By assigning false to `restrictPublicBuckets`, we remove the restriction that only authorized users can access the bucket.
- Below image demonstrates the result on S3 console Block public access (bucket settings) after blockPublicAccess is configured:
![s3-block-public-access-settings](/images/posts/resolve-api-s3-putbucketpolicy-access-denied/s3-block-public-access-settings.png)
- In S3 console, we can also see the public bucket policy, which we were able to set after the configuration, which is defined by the `publicReadAccess: true` configuration:
![s3-get-object-policy](/images/posts/resolve-api-s3-putbucketpolicy-access-denied/s3-get-object-policy.png)

## References
- https://github.com/aws/aws-cdk/issues/25983
- https://www.reddit.com/r/aws/comments/12tqqpw/aws_cdk_api_s3_putbucketpolicy_access_denied_and/ 
