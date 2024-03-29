import path from "path";
import {
  ExpectedResult,
  IntegTest,
  InvocationType,
} from "@aws-cdk/integ-tests-alpha";
import {
  App,
  Duration,
  RemovalPolicy,
  Stack,
  aws_dynamodb,
  aws_lambda,
  aws_lambda_nodejs,
  aws_lambda_event_sources,
} from "aws-cdk-lib";
import { Construct } from "constructs";

// beginning of the test suite
const app = new App();

// define a stack with resources to be tested
class StackUnderTest extends Stack {
  public readonly triggerFunctionName: string;
  public readonly tableName: string;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const table = new aws_dynamodb.Table(this, "Table", {
      partitionKey: {
        name: "PK",
        type: aws_dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "SK",
        type: aws_dynamodb.AttributeType.STRING,
      },
      billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      stream: aws_dynamodb.StreamViewType.NEW_IMAGE,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const trigger = new aws_lambda_nodejs.NodejsFunction(this, "b", {
      entry: path.join(__dirname, "../src/functions/trigger/index.ts"),
      architecture: aws_lambda.Architecture.ARM_64,
      runtime: aws_lambda.Runtime.NODEJS_18_X,
      environment: {
        TABLE_NAME: table.tableName,
      },
      bundling: {
        format: aws_lambda_nodejs.OutputFormat.ESM,
        target: "esnext",
        mainFields: ["module", "main"],
        esbuildArgs: {
          "--conditions": "module",
        },
        sourceMap: true,
        sourceMapMode: aws_lambda_nodejs.SourceMapMode.INLINE,
        minify: true,
        banner:
          "import { createRequire as topLevelCreateRequire } from 'module';const require = topLevelCreateRequire(import.meta.url)",
      },
    });

    table.grantReadWriteData(trigger);

    const notValidJson = new aws_lambda_nodejs.NodejsFunction(
      this,
      "notValidJson",
      {
        entry: path.join(__dirname, "../src/functions/not-valid-json/index.ts"),
        architecture: aws_lambda.Architecture.ARM_64,
        runtime: aws_lambda.Runtime.NODEJS_18_X,
        environment: {
          TABLE_NAME: table.tableName,
        },
        bundling: {
          format: aws_lambda_nodejs.OutputFormat.ESM,
          target: "esnext",
          mainFields: ["module", "main"],
          esbuildArgs: {
            "--conditions": "module",
          },
          sourceMap: true,
          sourceMapMode: aws_lambda_nodejs.SourceMapMode.INLINE,
          minify: true,
          banner:
            "import { createRequire as topLevelCreateRequire } from 'module';const require = topLevelCreateRequire(import.meta.url)",
        },
      }
    );

    // trigger from items created by the function *trigger*
    notValidJson.addEventSource(
      new aws_lambda_event_sources.DynamoEventSource(table, {
        enabled: true,
        filters: [
          aws_lambda.FilterCriteria.filter({
            dynamodb: {
              Keys: {
                PK: { S: [{ prefix: "B" }] },
                SK: { S: [{ prefix: "A" }] },
              },
            },
          }),
        ],
        startingPosition: aws_lambda.StartingPosition.TRIM_HORIZON,
      })
    );

    table.grantReadWriteData(notValidJson);

    this.triggerFunctionName = trigger.functionName;
    this.tableName = table.tableName;
  }
}

const stack = new StackUnderTest(app, "StackUnderTest");

// define the test suite (stacks to be tested)
const integ = new IntegTest(app, "IntegTest", {
  testCases: [stack],
  diffAssets: true,
  stackUpdateWorkflow: true,
  cdkCommandOptions: {
    deploy: {
      args: {
        json: true,
      },
    },
    destroy: {
      args: {
        force: true,
      },
    },
  },
});

// event for the function *trigger*
const triggerEvent = {
  eventSource: "SelfManagedKafka",
  bootstrapServers: "self.managed.kafka.at.aws:9092",
  records: {
    "awesome-proto-topic-0": [
      {
        topic: "awesome-proto-topic",
        partition: 0,
        offset: 11111111,
        timestamp: 1677147150056,
        timestampType: "CREATE_TIME",
        key: "Ygo=",
        value: "eyJiIjoiYiJ9",
        headers: [
          {
            contentType: [
              97, 112, 112, 108, 105, 99, 97, 116, 105, 111, 110, 47, 106, 115,
              111, 110,
            ],
          },
        ],
      },
    ],
  },
};

// invoke the *trigger* function to start the process
integ.assertions.invokeFunction({
  functionName: stack.triggerFunctionName,
  invocationType: InvocationType.EVENT,
  payload: JSON.stringify(triggerEvent),
});

/* Assert the result from the dynamodb table
  the item in question is created by the Lambda Function *notValidJson*
  that is triggered by the DynamoDB stream
 */
const items = integ.assertions.awsApiCall("DynamoDB", "query", {
  TableName: stack.tableName,
  KeyConditionExpression: "PK = :pk AND SK = :sk",
  ExpressionAttributeValues: {
    ":pk": {
      S: "PROTO#1234567890",
    },
    ":sk": {
      S: "C#0987654321",
    },
  },
});

items
  .expect(
    ExpectedResult.objectLike({
      Items: [
        {
          PK: {
            S: "PROTO#1234567890",
          },
          SK: {
            S: "C#0987654321",
          },
          numbers: {
            S: "1234567890",
          },
          smallLetters: {
            S: "abcdefghijklmnopqrstuvwxyzåäö",
          },
          capitalLetters: {
            S: "ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ",
          },
          specialCharcters: {
            S: '!"#¤%&/()=?`´^*+~_-.,:;<>|',
          },
        },
      ],
    })
  )
  .waitForAssertions({
    totalTimeout: Duration.minutes(5),
    interval: Duration.seconds(5),
    backoffRate: 2,
  });
