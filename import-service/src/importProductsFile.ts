import { APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import { BUCKET } from './bucketOptions'
import 'source-map-support/register'

export const importProductsFile: APIGatewayProxyHandler = async (
  event,
  _context
) => {
  console.log('lambda : importProductsFile, event: ', event)
  const err = {
    statusCode: 500,
    body: JSON.stringify(
      {
        message: 'internal server error'
      },
      null,
      2
    )
  }
  const fileName = event.queryStringParameters.name
  const filePath = `uploaded/${fileName}`

  const s3 = new AWS.S3({ region: 'eu-west-1' })

  const params = {
    Bucket: BUCKET,
    Key: filePath,
    Expires: 60,
    ContentType: 'text/csv'
  }

  const operation = new Promise((resolve, reject) => {
    s3.getSignedUrl('putObject', params, (error, url) => {
      if (error) {
        return reject(err)
      }
      resolve({
        statusCode: 203,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: url
      })
    })
  })

  return await operation
}
