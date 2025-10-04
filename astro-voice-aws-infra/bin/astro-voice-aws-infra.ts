#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AstroVoiceStack } from '../lib/astro-voice-stack';

const app = new cdk.App();

new AstroVoiceStack(app, 'AstroVoiceStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || '677502935540',
    region: process.env.CDK_DEFAULT_REGION || 'ap-south-1',
  },
});

app.synth();