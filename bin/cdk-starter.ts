#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { AppStack } from "../infrastructure/app-stack";
import * as dotenv from "dotenv";
dotenv.config();

// To avoid recurring costs from Secret Manager service, we will utilize .env files. However, this approach has the disadvantage of not being able to use CI/CD pipelines.
const { APP_NAME, REPO_BRANCH, AWS_ACCOUNT, AWS_REGION } = process.env;

if (!APP_NAME || !REPO_BRANCH || !AWS_ACCOUNT || !AWS_REGION) {
  throw new Error("missing env variable.");
}

const app = new cdk.App();

new AppStack(app, `${REPO_BRANCH}-${APP_NAME}`, {
  env: {
    region: AWS_REGION,
    account: AWS_ACCOUNT,
  },
});

app.synth();
