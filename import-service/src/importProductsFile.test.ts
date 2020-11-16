import { importProductsFile } from './importProductsFile'

const headers = {
  'Access-Control-Allow-Origin': '*'
}

describe('importProductsFile tests', () => {
  test('Request signed url', async () => {
    const request = {
      queryStringParameters: {
        name: 'import.csv'
      }
    }

    const signedUrl =
      'https://rss-aws-task5-yg.s3.eu-west-1.amazonaws.com/uploaded/Qwe?AWSAccessKeyId=AKIA24SKNYDDU6LLVKMV&Content-Type=text%2Fcsv&Expires=1605506389&Signature=CQ1BDy5HzGhWqEtA%2Bqa77zgm6us%3D'

    const response = {
      statusCode: 203,
      body: signedUrl,
      headers
    }
    await expect(importProductsFile(request)).resolves.toEqual(response)
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
