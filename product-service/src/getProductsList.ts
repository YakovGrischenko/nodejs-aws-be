import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { Client } from "pg";

import { dbOptions } from './dbOptions'

export const getProductsList: APIGatewayProxyHandler = async (
  event,
  _context
) => {
  console.log('Lambda function: getProductsList.  Event:', event);
  let statusCode = 404;
  let result = {};
  const client = new Client(dbOptions);
  try {
    await client.connect();

    // make select query

    const text =
      "select p.*, s.count from products as p inner join stocks as s on p.id = s.product_id ";

    const { rows: products } = await client.query(text);

    statusCode = 200;
    result = products;
  } catch (err) {
    // you can process error here. In this example just log it to console.
    console.error("Error during database request executing:", err);

    statusCode = 500;
    result = {
      message: "internal server error",
    };
  } finally {
    // in case if error was occurred, connection will not close automatically
    client.end(); // manual closing of connection
  }

  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,GET",
    },

    body: JSON.stringify(result, null, 2),
  };
};
