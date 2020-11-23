import { SQSHandler, SQSEvent } from "aws-lambda";
import AWS from "aws-sdk";
import "source-map-support/register";
import { addProduct } from "./productDbLogic";

export const catalogBatchProcess: SQSHandler = async (event: SQSEvent) => {
  console.log("Lambda function: catalogBatchProcess.  Event:", event);
  const sns = new AWS.SNS({ region: "eu-west-1" });

  for (const record of event.Records) {
    console.log("sqs.record.body: ", record.body);

    let dataParsed = {};
    let newProduct = false;
    try {
      dataParsed = JSON.parse(record.body);
      //TODO add validation
      newProduct = await addProduct(dataParsed);
    } catch (error) {
      console.error(`unable to parse message: ${record.body} error: ${error} `);
    }
    if (newProduct) {
      console.log("new product added: ", newProduct);

      await new Promise((resolve, reject) => {
        sns.publish(
          {
            Subject: `new product added: ${newProduct.title}`,
            Message: `new product added: ${newProduct.title}`,
            TopicArn: process.env.SNS_ARN,
            MessageAttributes: {
              priority: {
                StringValue: newProduct.description,
                DataType: "String",
              },
            },
          },
          () => {
            console.log("message sent to email");
            resolve();
          }
        );
      });
    }

    console.log("sqs.record.body parsed: ", dataParsed);
  }
};
