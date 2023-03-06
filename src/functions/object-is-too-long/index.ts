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

/* A dataset without Scandinavian letters and special characters.
 This object is too long to be asserted successfully.
 Results an error: "Response object is too long." */
const data = {
  stringProperty1: "value1",
  stringProperty2: "value2",
  stringProperty3: "value3",
  stringProperty4: "value4",
  stringProperty5: "value5",
  stringProperty6: "value6",
  stringProperty7: "value7",
  stringProperty8: "value8",
  stringProperty9: "value9",
  stringProperty10: "value10",
  numberProperty10: 10,
  numberProperty11: 11,
  numberProperty12: 12,
  numberProperty13: 13,
  numberProperty14: 14,
  numberProperty15: 15,
  numberProperty16: 16,
  numberProperty17: 17,
  numberProperty18: 18,
  numberProperty19: 19,
  nullProperty20: null,
  nullProperty21: null,
  nullProperty22: null,
  nullProperty23: null,
  nullProperty24: null,
  nullProperty25: null,
  nullProperty26: null,
  nullProperty27: null,
  nullProperty28: null,
  nullProperty29: null,
  mapProperty30: { sub30: "value30" },
  mapProperty31: { sub31: "value31" },
  mapProperty32: { sub32: "value32" },
  mapProperty33: { sub33: "value33" },
  mapProperty34: { sub34: "value34" },
  mapProperty35: { sub35: "value35" },
  mapProperty36: { sub36: "value36" },
  mapProperty37: { sub37: "value37" },
  mapProperty38: { sub38: "value38" },
  mapProperty39: { sub39: "value39" },
  mapProperty40: { sub39: "value40" },
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
