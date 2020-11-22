import { SQSHandler, SQSEvent } from "aws-lambda";
import "source-map-support/register";

export const catalogBatchProcess: SQSHandler = async (event: SQSEvent) => {
  console.log("Lambda function: catalogBatchProcess.  Event:", event);

  for (const record of event.Records) {
    console.log("sqs.record.body: ", record.body);
    console.log("sqs.record.body parsed: ", JSON.parse(record.body));
  }
};
