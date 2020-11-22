import { S3Event, S3Handler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import * as csv from 'csv-parser'
import { BUCKET } from './bucketOptions'
import 'source-map-support/register'

export const importFileParser: S3Handler = async (event: S3Event) => {
  console.log('lambda : importFileParser, event: ', event)

  try {
    const sqs = new AWS.SQS()
    const s3 = new AWS.S3({ region: 'eu-west-1' })

    for (const record of event.Records) {
      console.log('record.s3: ', record.s3)

      const s3Stream = s3
        .getObject({
          Bucket: BUCKET,
          Key: record.s3.object.key
        })
        .createReadStream()

      await new Promise((resolve, reject) => {
        s3Stream
          .pipe(csv())
          .on('data', (data) => {
            console.log(data)

            sqs.sendMessage(
              {
                QueueUrl: process.env.SQS_URL,
                MessageBody: JSON.stringify(data)
              },
              () => {
                console.log(
                  `Send message to ${process.env.SQS_URL} data:`,
                  data
                )
              }
            )
          })
          .on('error', (error) => {
            console.log('parsing error', error)
            reject(error)
          })
          .on('end', async () => {
            console.log(
              'moving file  ',
              BUCKET + '/' + record.s3.object.key,
              'to /parsed folder'
            )

            await s3
              .copyObject({
                Bucket: BUCKET,
                CopySource: BUCKET + '/' + record.s3.object.key,
                Key: record.s3.object.key.replace('uploaded', 'parsed')
              })
              .promise()

            console.log(
              'removing file  ',
              BUCKET + '/' + record.s3.object.key,
              'to /parsed folder'
            )

            await s3
              .deleteObject({
                Bucket: BUCKET,
                Key: record.s3.object.key
              })
              .promise()
            resolve()
          })
      })
    }
  } catch (error) {
    console.error('lambds : importFileParser, error: ', error)
    //i'm not sure about return code for s3 event. It could be return;
    return {
      statusCode: 500
    }
  }

  return {
    statusCode: 200
  }
}
