import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_s3 } from "aws-cdk-lib";

type StorageConstructProps = Record<string, never>;

export class StorageConstruct extends Construct {
  public readonly siteBucket: aws_s3.Bucket;

  constructor(scope: Construct, id: string, _props: StorageConstructProps) {
    super(scope, id);

    // BUCKETS
    this.siteBucket = new aws_s3.Bucket(this, "siteBucket", {
      websiteIndexDocument: "index.html",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: true,
      blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ACLS,
      accessControl: aws_s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
    });
  }
}
