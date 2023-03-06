import "source-map-support/register";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import middy from "@middy/core";
import eventNormalizer from "@middy/event-normalizer";
import { DynamoDBStreamEvent } from "aws-lambda";

const region = process.env.AWS_REGION;
const tableName = process.env.TABLE_NAME;

const client = new DynamoDBClient({ region: region });

const translateConfig = {
  marshallOptions: {
    convertEmptyValues: false,
    removeUndefinedValues: false,
    convertClassInstanceToMap: false,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
};

const write = async (input: TransactWriteCommandInput) => {
  return DynamoDBDocumentClient.from(client, translateConfig).send(
    new TransactWriteCommand(input)
  );
};

/* A dataset with all kind of characters.
 This will cause the assertion to fail.
 Results an error: "Response is not valid JSON"

 Q: Is it so that CloudFormation does not support UTF-8 characters?

 Q: Is it really necessary to send the entire response object back to CloudFormation?
 */
const data = {
  numbers: "1234567890",
  smallLetters: "abcdefghijklmnopqrstuvwxyzåäö",
  capitalLetters: "ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ",
  specialCharcters: '!"#¤%&/()=?`´^*+~_-.,:;<>|',
};

const generateUpdateQuery = (obj: Record<string, unknown>) => {
  let exp = {
    UpdateExpression: "SET",
    ExpressionAttributeValues: {} as Record<string, unknown>,
  };
  Object.entries(obj).forEach(([key, item]) => {
    exp.UpdateExpression += ` ${key} = :${key},`;
    exp.ExpressionAttributeValues[`:${key}`] = item;
  });
  exp.UpdateExpression = exp.UpdateExpression.slice(0, -1);
  return exp;
};

const main = async (event: DynamoDBStreamEvent): Promise<void> => {
  console.log({ event: event, tableName: tableName });

  await Promise.all(
    event.Records.map(async (record) => {
      console.log({ record: record });
      try {
        await write({
          TransactItems: [
            {
              Update: {
                TableName: tableName,
                Key: {
                  PK: "PROTO#1234567890",
                  SK: "C#0987654321",
                },
                ...generateUpdateQuery(data),
              },
            },
          ],
        });
        console.log({ write: "success" });
      } catch (e) {
        console.log({ write: "failure" });
        console.error(e);
      }
    })
  );
};

export const handler = middy(main).use(eventNormalizer());
