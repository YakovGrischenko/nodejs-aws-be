import { S3Event, S3Handler } from "aws-lambda";
import * as AWS from "aws-sdk";
import { BUCKET } from "./bucketOptions";
import "source-map-support/register";

export const importFileParser: S3Handler = async (event: S3Event) => {
  console.log("lambda : importFileParser, event: ", event);

  const s3 = new AWS.S3({ region: "eu-west-1" });

  for (const record of event.Records) {
    console.log("record.s3: ", record.s3);

    await s3
      .copyObject({
        Bucket: BUCKET,
        CopySource: BUCKET + "/" + record.s3.object.key,
        Key: record.s3.object.key.replace("uploaded", "parsed"),
      })
      .promise();
  }

  return {
    statusCode: 200,
  };
};
