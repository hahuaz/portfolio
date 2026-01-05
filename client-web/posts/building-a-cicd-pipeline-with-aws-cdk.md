---
title: "Building a CI/CD Pipeline with AWS CDK"
summary: "Learn how to use AWS CDK to automate your application's deployment and create a reliable and scalable pipeline."
createdAt: "2023-07-11"
tags: ['cdk', 'devops']
image: '/images/posts/general/aws-codepipeline.jpg'
---

## Introduction
If you're looking to automate your application deployment process,
then building a CI/CD pipeline is a must. In this blog post, we'll
walk you through the process of creating a pipeline using AWS CDK
that will streamline your deployment and ensure a consistent and
reliable release process.

The completed project can be found [here](https://github.com/hahuaz/cdk-examples/tree/dev/cicd-pipeline).

## What is the flow?

The deployment of our application involves the creation of two CloudFormation stacks: pipeline-stack and app-stack.

The pipeline-stack is the first stack that needs to be deployed, and we can do this by running a command from the terminal. The pipeline-stack is responsible for creating the CodePipeline resource that will be used to deploy our app-stack.

The app-stack contains all the resources required for our application, and it will be created and managed by the CodePipeline. This includes creating all the necessary AWS resources, such as Lambda functions, API Gateway, and other resources required for our application to function correctly.

This approach allows us to automate the entire deployment process of our application and also makes it easier to maintain the infrastructure. Any changes that we make to the application code will be automatically deployed to the cloud using the CodePipeline, and the app-stack will be updated accordingly.

## Infrastructure as Code (IaC)

### CDK Entry Point
The `cdk-starter.ts` file is the main entry point for defining any CDK App.

```ts filename-cdk-starter
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import { PipelineStack } from '../infrastructure/pipeline-stack';

const app = new cdk.App();
const BRANCH = app.node.tryGetContext('BRANCH');
const { APP_NAME, AWS_ACCOUNT, AWS_REGION } = app.node.tryGetContext(BRANCH);

// A cloudformation template will be deployed for your pipeline-stack
new PipelineStack(app, `${BRANCH}-${APP_NAME}-pipelineStack`, {
  env: { account: AWS_ACCOUNT, region: AWS_REGION },
  deployPreStage: false,
});
```

- We retrieve context variables from `cdk.json` to configure the app.
- It initiliaze the PipelineStack class with taking `new cdk.App()` as first argument. The second argument is ID for the resource and the third argument is an object defines AWS account and region that resources will be deployed to.

### Pipeline Stack

The `pipeline-stack` is responsible for deploying the `app-stack` after it has been initialized. It also automatically deploys the stack every time there is a code check-in. This ensures that the latest version of the application is always deployed and available.

```ts filename-pipeline-stack
import * as cdk from 'aws-cdk-lib';
import {
  pipelines,
  aws_codecommit,
  aws_sns,
  aws_sns_subscriptions,
  aws_events,
  aws_events_targets,
  aws_iam,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { AppStack } from './app-stack';

export interface PipelineStackProps extends cdk.StackProps {
  deployPreStage: boolean;
}

export class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: PipelineStackProps) {
    super(scope, id, props);

    const BRANCH = this.node.tryGetContext('BRANCH');
    const { REPO_NAME, PAGER_EMAIL, APP_NAME } =
      this.node.tryGetContext(BRANCH);
    const PIPELINE_NAME = `${BRANCH}-${APP_NAME}-pipeline`;

    const codeCommitRepo = aws_codecommit.Repository.fromRepositoryName(
      this,
      'codeCommitRepo',
      REPO_NAME
    );

    const codePipeline = new pipelines.CodePipeline(this, 'pipeline', {
      pipelineName: PIPELINE_NAME,
      selfMutation: true,
      crossAccountKeys: false,
      synth: new pipelines.CodeBuildStep('Synth', {
        input: pipelines.CodePipelineSource.codeCommit(codeCommitRepo, BRANCH),
        commands: ['npm ci', 'npm run build', 'npm run test', 'npx cdk synth'],
        role: new aws_iam.Role(this, 'codeBuildRole', {
          assumedBy: new aws_iam.ServicePrincipal('codebuild.amazonaws.com'),
          managedPolicies: [
            aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
              'AWSCodeCommitReadOnly'
            ),
          ],
        }),
      }),
    });

    // Naming pattern of the deployed resources will be: AppStage.id+AppStack.id+Resource.id
    props?.deployPreStage ||
      codePipeline.addStage(new AppStage(this, `pre${BRANCH}`));

    codePipeline.addStage(new AppStage(this, `${BRANCH}`));
  }
}

/**
 * Stages are used in case your application may consist multiple stacks.
 * But using one stack with multiple constructs, such as api, storage, lambda, is recommended.
 */
class AppStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    const BRANCH = this.node.tryGetContext('BRANCH');
    const { APP_NAME } = this.node.tryGetContext(BRANCH);

    // A cloudformation template will be deployed for your app-stack
    new AppStack(this, APP_NAME);
  }
}

```

- In the constructor method, reference repository object, `codeCommitRepo`, is created for the pipeline using the repository name that is passed from the `cdk.json` file.

- Then CodePipeline construct is initialized with custom configuration:
  - `crossAccountKeys` is set to false since the deployment does not involve cross-account deployment scenarios or the use of third-party version control providers like GitHub.
  - The `commands` section is a part of the synth step, and it specifies the commands that are executed when the pipeline starts its deployment process.
    - The `npm ci` command installs the exact dependencies required by the application, ensuring that the same versions of packages are installed every time.
    - The `npm run build` command builds the application by compiling and packaging the source code into a deployable format.
    - the `npm run test` will run the tests that resides in test directory using Jest library.
    - The `npx cdk synth` command synthesizes the AWS CloudFormation template for the application by using the AWS CDK toolkit.
  - The `role` prop defines new IAM Role for CodeBuild to use in build process. Since our tests using CodeCommit SDK, we need to provide permission for it.
- The `application-stack` is added to the pipeline by calling `addStage()` with instances of `AppStage`. If multiple stacks needs to be deployed for the app, `AppStage` can be modified to include those stacks. In our example, we've used only one stack.


#### Be Notified If Pipeline Fails

Pipeline can fail and you can miss it since you don't check the AWS Console after every code check-in. 
We will utilize SNS and EventBridge to be paged if something goes wrong.

```ts filename-pipeline-stack
// Notify if pipeline fails
const failTopic = new aws_sns.Topic(this, 'PipelineFailTopic');

failTopic.addSubscription(
  new aws_sns_subscriptions.EmailSubscription(PAGER_EMAIL)
);

const failEvent = new aws_events.Rule(this, 'PipelineFailedEvent', {
  eventPattern: {
    source: ['aws.codepipeline'],
    detailType: ['CodePipeline Pipeline Execution State Change'],
    detail: {
      state: ['FAILED'],
      pipeline: [PIPELINE_NAME],
    },
  },
});

failEvent.addTarget(
  new aws_events_targets.SnsTopic(failTopic, {
    message: aws_events.RuleTargetInput.fromText(
      `The Pipeline '${aws_events.EventField.fromPath(
        '$.detail.pipeline'
      )}' has ${aws_events.EventField.fromPath('$.detail.state')}`
    ),
  })
);
```
- Do not forget to confirm the subscription email AWS sends you.

### App Stack

The `app-stack` is responsible for provisining the resources our app requires.


```ts filename-app-stack
import * as path from 'path';

import * as cdk from 'aws-cdk-lib';
import { aws_lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const BRANCH = this.node.tryGetContext('BRANCH');
    const { APP_NAME } = this.node.tryGetContext(BRANCH);

    new NodejsFunction(this, 'exampleFunction', {
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      runtime: aws_lambda.Runtime.NODEJS_16_X,
      handler: 'handler',
      entry: path.join(__dirname, `/../src/lambdas/example/index.ts`),
      bundling: {
        minify: true,
      },
    });

    // CFN OUTPUTS
    new cdk.CfnOutput(this, 'APP_NAME', {
      value: APP_NAME,
    });
  }
}

```

## Manage Environment Variables

After months of strugles, most convenient way I have found to provide environment variables when working with a CI/CD pipeline is using the `cdk.json` file.

```json 
{
  "app": "npx ts-node --prefer-ts-exts bin/cdk-starter.ts",
  "context": {
    "BRANCH": "prod",
    "prod": {
      "AWS_ACCOUNT": "yours",
      "AWS_REGION": "us-west-2",
      "APP_NAME": "hahuaz-cdk-examples",
      "REPO_NAME": "cicd-pipeline",
      "PAGER_EMAIL": "work.hahuaz@gmail.com",
      "SOME_SECRETKEY": "secretManagerREF1"
    },
    "dev": {
      "AWS_ACCOUNT": "yours",
      "AWS_REGION": "us-west-2",
      "APP_NAME": "hahuaz-cdk-examples",
      "REPO_NAME": "cicd-pipeline",
      "PAGER_EMAIL": "work.hahuaz@gmail.com",
      "SOME_SECRETKEY": "secretManagerREF2"
    }
  }
}
```
- In the `cdk.json` file, we have the `context` property that is used to pass runtime context to the application.
- By specifying the `BRANCH` key in the context section, you can indicate which branch to use during deployment. In this case, the branch is set to `prod`.
- The value of the `BRANCH` key can be used within your CDK app to retrieve the environment variables specific to that stage. This setup allows you to easily group environment variables per stage and have references available when needed for all stages.
- You shouldn't put sensitive information directly in the file, as it is checked into source control. Instead, write Secret Manager references that can be used at runtime to retrieve the actual secrets.

## Unit Test Example
To ensure the existence of the CodeCommit repository and branch specified in the cdk.json file, you can use the AWS SDK and write a test case. Here's an example of how you can implement the test:

```ts filenme-repo-exists.test
import fs from 'fs';
import { CodeCommit } from 'aws-sdk';

const codeCommitClient = new CodeCommit();

const cdkJson = fs.readFileSync('cdk.json', 'utf8');
const { context } = JSON.parse(cdkJson);
const { BRANCH } = context;
const { REPO_NAME } = context[BRANCH];

test('repo-exists', async () => {
  try {
    await codeCommitClient
      .getBranch({ repositoryName: REPO_NAME, branchName: BRANCH })
      .promise();
  } catch (error) {
    throw new Error(
      `Branch ${BRANCH} doesn't exist on CodeCommit repository '${REPO_NAME}'\n${error}`
    );
  }
});
```

## Deploy the Pipeline Stack and Observe the Flow on AWS Console

Before we can deploy the app, we need to put our repository to CodeCommit, since CodePipeline will look there to find the source code of the application.

```bash
aws codecommit create-repository --repository-name ci-cd-pipeline-ts --profile <your-profile>
git remote add origin ssh://git-codecommit.us-west-2.amazonaws.com/v1/repos/ci-cd-pipeline-ts
git push origin dev
```

If it's your first time deploying in the region, you need to bootstrap the region. More info can be found [here](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html).

```bash
npx cdk bootstrap aws://ACCOUNT-NUMBER/REGION --profile <your-profile> --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
npm install
npm run cdk-deploy
```

Review the deployed `pipeline-stack` template on CloudFormation service:

![aws pipeline stack](/images/posts/building-a-cicd-pipeline-with-aws-cdk/pipeline-stack.png)

Review how CodePipeline service is deploying the `app-stack`:

![aws codepipeline image](/images/posts/building-a-cicd-pipeline-with-aws-cdk/CodePipeline.png)

Finally, see the `app-stack` template on CloudFormation service:

![aws cloudformation dashboard](/images/posts/building-a-cicd-pipeline-with-aws-cdk/app-stack.png)

## Check-in the Code to Update Resources

When you need to make changes to the lambda or the infrastructure code, you can simply modify the code and then check it in. Once checked in, the pipeline will detect the changes and automatically run to update the necessary services.

## The Pipeline Itself is Self Mutating

The pipeline itself is designed to be self-mutating. This means that you can modify the pipeline configuration, and when you check in the updated code, the pipeline will update itself with the new configuration. This allows you to make changes to your deployment process and see the results immediately, without having to manually update the pipeline.


## References
- https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.pipelines-readme.html
- https://docs.aws.amazon.com/cdk/v2/guide/cdk_pipeline.html
- https://aws.amazon.com/blogs/developer/cdk-pipelines-continuous-delivery-for-aws-cdk-applications/