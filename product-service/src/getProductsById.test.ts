import { getProductsById } from '../src/getProductsById'

const headers = {
    "Access-Control-Allow-Headers" : "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,GET"
}

describe('getProductsById tests', () => {

    const productId = '7567ec4b-b10c-48c5-9345-fc73c48a81a2'
    const testProduct = {
        "count": 7,
        "description": "Short Product Description2",
        "id": "7567ec4b-b10c-48c5-9345-fc73c48a81a2",
        "price": 42,
        "title": "Product with fixed key"
    };

    test('should get product with specific ID', async () => {
        const request = { 
            pathParameters: { 
                productId
            } 
        }
        const response = {
            statusCode: 200,
            body: JSON.stringify(testProduct, null, 2),
            headers
        }
        await expect(getProductsById(request)).resolves.toEqual(response);
    });

    test('should get 404 code if pass wrong product ID', async () => {
        const request = { 
            pathParameters: { 
                productId: 'missed_priduct_id'
            } 
        }

        const responseProductNotFound = {
            message: 'Product not found'
        }

        const response = {
            statusCode: 404,
            body: JSON.stringify(responseProductNotFound, null, 2),
            headers
        }
        await expect(getProductsById(request)).resolves.toEqual(response);
    });


  }); 