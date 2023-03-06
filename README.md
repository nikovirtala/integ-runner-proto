# integ-runner proto with a failing tests

This is an example of a "failing" integration tests.

The test in `test/integ.not-valid-json.ts` fails with the following error:

```
 ❌  IntegTest/DefaultTest/DeployAssert failed: Error: The stack named IntegTestDefaultTestDeployAssertE3E7D2A4 failed to deploy: CREATE_FAILED (The following resource(s) failed to create: [AwsApiCallDynamoDBquery]. ): Response is not valid JSON
    at FullCloudFormationDeployment.monitorDeployment (/Users/nikovirtala/src/github.com/nikovirtala/integ-runner-proto/node_modules/aws-cdk/lib/index.js:344:10235)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async deployStack2 (/Users/nikovirtala/src/github.com/nikovirtala/integ-runner-proto/node_modules/aws-cdk/lib/index.js:347:144797)
    at async /Users/nikovirtala/src/github.com/nikovirtala/integ-runner-proto/node_modules/aws-cdk/lib/index.js:347:130251
    at async run (/Users/nikovirtala/src/github.com/nikovirtala/integ-runner-proto/node_modules/aws-cdk/lib/index.js:347:128257)
```

The test in `test/integ.object-is-too-long.ts` fails with the following error:

```
 ❌  IntegTest/DefaultTest/DeployAssert failed: Error: The stack named IntegTestDefaultTestDeployAssertE3E7D2A4 failed to deploy: CREATE_FAILED (The following resource(s) failed to create: [AwsApiCallDynamoDBquery]. ): Response object is too long.
    at FullCloudFormationDeployment.monitorDeployment (/Users/nikovirtala/src/github.com/nikovirtala/integ-runner-proto/node_modules/aws-cdk/lib/index.js:344:10235)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async deployStack2 (/Users/nikovirtala/src/github.com/nikovirtala/integ-runner-proto/node_modules/aws-cdk/lib/index.js:347:144797)
    at async /Users/nikovirtala/src/github.com/nikovirtala/integ-runner-proto/node_modules/aws-cdk/lib/index.js:347:130251
    at async run (/Users/nikovirtala/src/github.com/nikovirtala/integ-runner-proto/node_modules/aws-cdk/lib/index.js:347:128257)
```

Despite the response to CloudFormation in both cases is `SUCCESS`:

```
2023-03-01T11:07:01.606Z	1be4ffb8-7d44-4ec5-a25f-a57ac8a768cb	INFO	Responding to CloudFormation {
    "Status": "SUCCESS",
    "Reason": "OK",
    "PhysicalResourceId": "AwsApiCallDynamoDBquery",
    "StackId": "arn:aws:cloudformation:eu-west-1:145820153321:stack/IntegTestDefaultTestDeployAssertE3E7D2A4/fe1b0000-b820-11ed-a07e-0aed401b27e7",
    "RequestId": "7cba7c39-ebf5-4a38-a6f6-8741d9b85ed5",
    "LogicalResourceId": "AwsApiCallDynamoDBquery",
    "NoEcho": false,
    "Data": {
        "assertion": "{\"status\":\"success\"}",
        "apiCallResponse": {
            "Items": [
                {
                    "stringProperty1": {
                        "S": "1234567890"
                    },
                    "stringProperty2": {
                        "S": "qwertyuiopå"
                    },
                    "stringProperty3": {
                        "S": "ASDFGHJKLÖÄ"
                    },
                    "stringProperty4": {
                        "S": "!#€%&/()=?"
                    },
                    "stringProperty5": {
                        "S": "value5"
                    },
                    "stringProperty6": {
                        "S": "value6"
                    },
                    "mapProperty40": {
                        "M": {
                            "sub40": {
                                "S": "value40"
                            }
                        }
                    },
                    "nullProperty29": {
                        "NULL": true
                    },
                    "nullProperty27": {
                        "NULL": true
                    },
                    "nullProperty28": {
                        "NULL": true
                    },
                    "nullProperty25": {
                        "NULL": true
                    },
                    "nullProperty26": {
                        "NULL": true
                    },
                    "stringProperty7": {
                        "S": "value7"
                    },
                    "stringProperty8": {
                        "S": "value8"
                    },
                    "SK": {
                        "S": "C#0987654321"
                    },
                    "stringProperty9": {
                        "S": "value9"
                    },
                    "numberProperty11": {
                        "N": "11"
                    },
                    "numberProperty10": {
                        "N": "10"
                    },
                    "numberProperty15": {
                        "N": "15"
                    },
                    "numberProperty14": {
                        "N": "14"
                    },
                    "numberProperty13": {
                        "N": "13"
                    },
                    "numberProperty12": {
                        "N": "12"
                    },
                    "numberProperty19": {
                        "N": "19"
                    },
                    "numberProperty18": {
                        "N": "18"
                    },
                    "numberProperty17": {
                        "N": "17"
                    },
                    "numberProperty16": {
                        "N": "16"
                    },
                    "mapProperty30": {
                        "M": {
                            "sub30": {
                                "S": "value30"
                            }
                        }
                    },
                    "nullProperty23": {
                        "NULL": true
                    },
                    "nullProperty24": {
                        "NULL": true
                    },
                    "mapProperty32": {
                        "M": {
                            "sub32": {
                                "S": "value32"
                            }
                        }
                    },
                    "nullProperty21": {
                        "NULL": true
                    },
                    "mapProperty31": {
                        "M": {
                            "sub31": {
                                "S": "value31"
                            }
                        }
                    },
                    "nullProperty22": {
                        "NULL": true
                    },
                    "nullProperty20": {
                        "NULL": true
                    },
                    "mapProperty38": {
                        "M": {
                            "sub38": {
                                "S": "value38"
                            }
                        }
                    },
                    "mapProperty37": {
                        "M": {
                            "sub37": {
                                "S": "value37"
                            }
                        }
                    },
                    "mapProperty39": {
                        "M": {
                            "sub39": {
                                "S": "value39"
                            }
                        }
                    },
                    "mapProperty34": {
                        "M": {
                            "sub34": {
                                "S": "value34"
                            }
                        }
                    },
                    "mapProperty33": {
                        "M": {
                            "sub33": {
                                "S": "value33"
                            }
                        }
                    },
                    "mapProperty36": {
                        "M": {
                            "sub36": {
                                "S": "value36"
                            }
                        }
                    },
                    "mapProperty35": {
                        "M": {
                            "sub35": {
                                "S": "value35"
                            }
                        }
                    },
                    "PK": {
                        "S": "PROTO#1234567890"
                    }
                }
            ],
            "Count": 1,
            "ScannedCount": 1
        }
    }
}
```
