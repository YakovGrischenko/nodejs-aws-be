import { SQSHandler, SQSEvent } from "aws-lambda";
import * as AWS from "aws-sdk";
import "source-map-support/register";

export const catalogBatchProcess: SQSHandler = async (event: SQSEvent) => {
  console.log("Lambda function: catalogBatchProcess.  Event:", event);
  const sns = new AWS.SNS({ region: "eu-west-1" });

  for (const record of event.Records) {
    console.log("sqs.record.body: ", record.body);

    let dataParsed = {};

    try {
      dataParsed = JSON.stringify(record.body);
    } catch (error) {
      console.error(`unable to parse message: ${record.body} error: ${error} `);
    }

    console.log("sqs.record.body parsed: ", dataParsed);
  }

  await new Promise((resolve, reject) => {
    sns.publish(
      {
        Subject: "notification subject",
        Message: "new goods added",
        TopicArn: process.env.SNS_ARN,
      },
      () => {
        console.log("message sent to email");
        resolve();
      }
    );
  });
};
