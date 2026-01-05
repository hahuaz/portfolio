import * as path from "path";

import * as cdk from "aws-cdk-lib";
import { aws_lambda } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

type LambdaConstructProps = Record<string, never>;

export class LambdaConstruct extends Construct {
  public readonly postMapper: NodejsFunction;

  constructor(scope: Construct, id: string, _props: LambdaConstructProps) {
    super(scope, id);

    this.postMapper = new NodejsFunction(this, "postMapper", {
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
      runtime: aws_lambda.Runtime.NODEJS_16_X,
      handler: "postMapper",
      entry: path.join(__dirname, `/../../lambdas/site-dist-mapper/index.ts`),
    });

  }
}
