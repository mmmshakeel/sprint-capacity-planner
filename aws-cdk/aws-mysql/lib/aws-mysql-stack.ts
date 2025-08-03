import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class AwsMysqlStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC (or use existing one)
    const vpc = new ec2.Vpc(this, 'AuroraVPC', {
      maxAzs: 2,
      natGateways: 0,
    });

    // Create DB subnet group explicitly
    const subnetGroup = new rds.SubnetGroup(this, 'MySQLSubnetGroup', {
      vpc,
      description: 'Subnet group for MySQL database',
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create security group for controlled access
    const dbSecurityGroup = new ec2.SecurityGroup(this, 'MySQLSecurityGroup', {
      vpc,
      description: 'Security group for MySQL database',
      allowAllOutbound: false,
    });

    // Allow MySQL access from specific sources (replace with your IP ranges)
    // For Vercel - you may need to allow broader ranges or use VPC peering
    dbSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(), // TODO: Restrict to specific IP ranges for production
      ec2.Port.tcp(3306),
      'MySQL access'
    );

    // Create RDS MySQL instance (compatible with t3.small)
    const instance = new rds.DatabaseInstance(this, 'MySQLInstance', {
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_8_0_39
      }),
      instanceIdentifier: 'sprint-capacity-planner-mysql-db',
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO), // Free tier eligible
      vpc,
      subnetGroup,
      securityGroups: [dbSecurityGroup], // Apply custom security group
      publiclyAccessible: true, // Make instance publicly accessible
      databaseName: 'sprintCapacityPlannerDB',
      credentials: rds.Credentials.fromGeneratedSecret('admin', {
        secretName: 'mysql-credentials'
      }),
      backupRetention: cdk.Duration.days(1), // Minimum for free tier
      deletionProtection: false, // Set to true for production
      allocatedStorage: 20, // Minimum for free tier
      storageType: rds.StorageType.GP2,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
