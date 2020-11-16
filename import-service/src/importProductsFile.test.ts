import * as AWSMock from 'aws-sdk-mock'
import { importProductsFile } from './importProductsFile'

const headers = {
  'Access-Control-Allow-Origin': '*'
}

describe('importProductsFile tests', () => {
  test('Request signed url', async () => {
    AWSMock.mock(
      'S3',
      'getSignedUrl',

      (operation: string, params: any, callback: Function) => {
        console.log('S3', 'getSignedUrl', 'mock called')
        callback(null, 'moched_signed_url')
      }
    )

    const request = {
      queryStringParameters: {
        name: 'import.csv'
      }
    }

    const signedUrl = 'moched_signed_url'

    const response = {
      statusCode: 203,
      body: signedUrl,
      headers
    }
    await expect(importProductsFile(request)).resolves.toEqual(response)

    AWSMock.restore('S3')
  })

  test('400 response on missing name parametr', async () => {
    const request = {}

    const responseProductNotFound = {
      message: 'name parametr is missing'
    }

    const response = {
      statusCode: 400,
      body: JSON.stringify(responseProductNotFound, null, 2),
      headers
    }
    await expect(importProductsFile(request)).resolves.toEqual(response)
  })
})
