import * as cdk from "aws-cdk-lib";
import {
  aws_cloudfront,
  aws_cloudfront_origins,
  aws_certificatemanager,
  aws_route53,
  aws_route53_targets,
} from "aws-cdk-lib";
import { Construct } from "constructs";

import { LambdaConstruct } from "./constructs/lambda";
import { StorageConstruct } from "./constructs/storage";

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { DOMAIN_NAME, DOMAIN_CERTIFICATE } = process.env;

    if (!DOMAIN_NAME || !DOMAIN_CERTIFICATE) {
      throw new Error("missing env variable.");
    }

    const { siteBucket } = new StorageConstruct(this, `storage`, {});

    const { postMapper } = new LambdaConstruct(this, `lambda`, {});

    const customCachePolicy = new aws_cloudfront.CachePolicy(
      this,
      "cachePolicy",
      {
        defaultTtl: cdk.Duration.days(0),
        minTtl: cdk.Duration.minutes(0),
        maxTtl: cdk.Duration.days(0),
      }
    );

    const customResponsePolicy = new aws_cloudfront.ResponseHeadersPolicy(
      this,
      "customResponsePolicy2",
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
          accessControlAllowOrigins: ["*"],
          accessControlAllowMethods: ["HEAD", "GET", "OPTIONS"],
          accessControlAllowHeaders: ["*"],
          originOverride: true,
          accessControlAllowCredentials: false,
        },
      }
    );

    const siteBucketOrigin = new aws_cloudfront_origins.S3Origin(siteBucket);

    const siteBucketDist = new aws_cloudfront.Distribution(
      this,
      "siteBucketDist",
      {
        defaultBehavior: {
          origin: siteBucketOrigin,
          viewerProtocolPolicy:
            aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: aws_cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachePolicy: customCachePolicy,
          responseHeadersPolicy: customResponsePolicy,
        },
        additionalBehaviors: {
          "posts/*": {
            origin: siteBucketOrigin,
            edgeLambdas: [
              {
                functionVersion: postMapper.currentVersion,
                eventType: aws_cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
              },
            ],
          },
        },
        errorResponses: [
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
          },
        ],
        domainNames: [DOMAIN_NAME],
        /**
         * CF distribution only accept certificates that is created on us-east-1. Certificate will be created manually on the console because it requires manuel DNS validation on registrar.
         */
        certificate: aws_certificatemanager.Certificate.fromCertificateArn(
          this,
          "DOMAIN_CERTIFICATE",
          DOMAIN_CERTIFICATE
        ),
      }
    );

    // TODO: after moving the domain registration to route53 start using paid hosted zone instead of cloudflare
    // const hostedZone = new aws_route53.PublicHostedZone(this, "HostedZone", {
    //   zoneName: DOMAIN_NAME,
    // });

    // const aliasRecord = new aws_route53.ARecord(this, "AliasRecord", {
    //   zone: hostedZone,
    //   recordName: DOMAIN_NAME,
    //   target: aws_route53.RecordTarget.fromAlias(
    //     new aws_route53_targets.CloudFrontTarget(siteBucketDist)
    //   ),
    // });

    // CFN OUTPUTS
    new cdk.CfnOutput(this, "siteBucketUrl", {
      value: siteBucket.s3UrlForObject(),
      description: "The siteBucket S3 URL",
    });
    new cdk.CfnOutput(this, "siteBucketDistDomain", {
      value: siteBucketDist.distributionDomainName,
      description: "The domain name of siteBucketDist",
    });
  }
}
