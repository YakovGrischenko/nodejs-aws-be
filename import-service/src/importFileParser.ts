import { S3Event, S3Handler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import * as csv from 'csv-parser'
import { BUCKET } from './bucketOptions'
import 'source-map-support/register'

export const importFileParser: S3Handler = async (event: S3Event) => {
  console.log('lambda : importFileParser, event: ', event)

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

  return {
    statusCode: 200
  }
}
