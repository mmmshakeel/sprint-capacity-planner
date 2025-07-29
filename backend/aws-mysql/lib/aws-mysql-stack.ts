import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class AwsMysqlStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC (or use existing one)
    const vpc = new ec2.Vpc(this, 'AuroraVPC', {
      maxAzs: 2, // Aurora requires at least 2 AZs
      natGateways: 0, // Free tier - no NAT gateways
    });

    // Create RDS MySQL instance (compatible with t3.small)
    const instance = new rds.DatabaseInstance(this, 'MySQLInstance', {
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_8_0_39
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO), // Free tier eligible
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      databaseName: 'sprintCapacityPlannerDB',
      credentials: rds.Credentials.fromGeneratedSecret('admin', {
        secretName: 'mysql-credentials'
      }),
      backupRetention: cdk.Duration.days(1), // Minimum for free tier
      deletionProtection: false, // Set to true for production
      allocatedStorage: 20, // Minimum for free tier
      storageType: rds.StorageType.GP2,
    });
  }
}
