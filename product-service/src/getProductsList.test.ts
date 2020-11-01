import { getProductsList } from '../src/getProductsList'
import productList  from '../productList.json'

const headers = {
    "Access-Control-Allow-Headers" : "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,GET"
}

describe('getProductsList tests', () => {
    test('should get all products', async () => {
        const response = {
            statusCode: 200,
            body: JSON.stringify(productList, null, 2),
            headers
        }
        await expect(getProductsList()).resolves.toEqual(response);
    });
  }); 