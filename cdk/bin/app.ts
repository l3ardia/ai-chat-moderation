#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { StaticWebsiteStack } from "../lib/static-website-stack";
import { ApiStack } from "../lib/api-stack";
import * as dotenv from "dotenv";
import path = require('path');

dotenv.config({ path: path.resolve(`.env.${process.env.ENV}`) });

const envName = process.env.ENV as string;
const APP_NAME = `ai-chat-moderation-${envName}`;

const app = new cdk.App();

const env = {
  region: process.env.CDK_DEFAULT_REGION,
  account: process.env.CDK_DEFAULT_ACCOUNT,
};

console.log(process.env.HOSTNAME);

new StaticWebsiteStack(app, `${APP_NAME}-StaticWebsiteStack`, {
  env,
  appName: `${APP_NAME}-moderation`,
  domain: process.env.HOSTNAME || 'localhost',
  src: '../frontend/out',
});

new ApiStack(app, `${APP_NAME}-ApiStack`, {
  env,
  appName: `${APP_NAME}-moderation-api`,
  distDir: '../services/moderation-api/dist',
  hostName: process.env.MODERATION_API_HOSTNAME || "",
  timeout: cdk.Duration.seconds(20),
  getEnvironment: (config) => ({
    OPENAI_API_KEY: config.OPENAI_API_KEY,
  }),
});
