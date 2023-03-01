import "source-map-support/register";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import middy from "@middy/core";
import eventNormalizer from "@middy/event-normalizer";
import { MSKEvent } from "aws-lambda";

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

const main = async (event: MSKEvent): Promise<void> => {
  console.log({ event: event, tableName: tableName });

  let items: any = [];
  Object.values(event.records)
    .flatMap((records) => records)
    .map((record) => {
      if (record.value) items.push(record.value);
    });

  await Promise.all(
    items.map(async (obj: any) => {
      console.log({ obj: obj });
      try {
        await write({
          TransactItems: [
            {
              Update: {
                TableName: tableName,
                Key: {
                  PK: `B#B`,
                  SK: `A#A`,
                },
                UpdateExpression: "SET something = :something",
                ExpressionAttributeValues: {
                  ":something": obj,
                },
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
