import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as path from 'path';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
  Distribution,
  Function,
  FunctionCode,
  FunctionEventType, SecurityPolicyProtocol,
  ViewerProtocolPolicy
} from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { PublicHostedZone } from 'aws-cdk-lib/aws-route53';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { getConfig } from '../../shared/config';

interface StaticWebsiteStackProps extends StackProps {
  appName: string;
  domain: string;
  src: string;
}

/**
 * A reusable stack for static frontend websites
 *
 * Underlying infrastructure is S3 + Cloudfront with a custom domain
 */
export class StaticWebsiteStack extends Stack {
  constructor(scope: Construct, id: string, props: StaticWebsiteStackProps) {
    super(scope, id, props);

    const config = getConfig(this);

    const certificate = Certificate.fromCertificateArn(
      this,
      `${props.appName}-certificate`,
      config.GLOBAL_SYSTEM_CERTIFICATE_ARN,
    );

    const hostedZone = PublicHostedZone.fromHostedZoneAttributes(this, `${props.appName}-hosted-zone`, {
      hostedZoneId: config.HOSTED_ZONE_ID,
      zoneName: config.HOSTED_ZONE_NAME,
    });

    const bucket = new Bucket(this, `${props.appName}-bucket`, {
      publicReadAccess: true,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      removalPolicy: RemovalPolicy.DESTROY,
      websiteIndexDocument: 'index.html',
    });

    const urlRewriteFunction = new Function(this, `${props.appName}-url-rewrite-function`, {
      code: FunctionCode.fromFile({
        filePath: path.join(__dirname, 'lambdas/url-rewrite.js'),
      }),
    });

    const distribution = new Distribution(this, `${props.appName}-distribution`, {
      defaultBehavior: {
        origin: new S3Origin(bucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        functionAssociations: [
          {
            function: urlRewriteFunction,
            eventType: FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },

      defaultRootObject: 'index.html',
      errorResponses: [
        {
          ttl: Duration.minutes(5),
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
      domainNames: [props.domain],
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2018,
      certificate,
    });

    const deployment = new BucketDeployment(this, `${props.appName}-deployment`, {
      sources: [Source.asset(props.src)],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/index.html'],
    });

  }
}
