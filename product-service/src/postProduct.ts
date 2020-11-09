import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { Client } from "pg";

import { dbOptions } from './dbOptions'


export const postProduct: APIGatewayProxyHandler = async (event, _context) => {
  console.log('Lambda function: postProduct.  Event:', event);
  const { title, description = "", price = 0, count = 0 } = JSON.parse(
    event.body
  );

  let statusCode = 404;
  let result = {};

  if (!title) {
    statusCode = 400;
    result = {
      message: "product data is invalid: title missing",
    };
  } else if (price < 0) {
    statusCode = 400;
    result = {
      message: "product data is invalid: price is negative",
    };
  } else if (count < 0) {
    statusCode = 400;
    result = {
      message: "product data is invalid: count is negative",
    };
  } else {
    const client = new Client(dbOptions);
    try {
      await client.connect();

      await client.query('BEGIN')

      const dmlResult = await client.query(
        `insert into products (title, description, price) values ($1, $2, $3) returning *`,
        [title, description, price]
      );

      const { id: newUUID } = dmlResult.rows[0];

      const stockResult = await client.query(
        `insert into stocks (product_id, count) values 
        ($1, $2) returning *`,
        [newUUID, count]
      );
      

      const {
        rows: [product],
      } = await client.query(
        "select p.*, s.count from products as p inner join stocks as s on p.id = s.product_id where p.id = $1",
        [newUUID]
      );
      
      await client.query('COMMIT')

      statusCode = 201;
      result = product;
    } catch (err) {
      // you can process error here. In this example just log it to console.
      console.error("Error during database request executing:", err);
      await client.query('ROLLBACK')
      statusCode = 500;
      result = {
        message: "internal server error",
      };
    } finally {
      // in case if error was occurred, connection will not close automatically
      client.end(); // manual closing of connection
    }
  }

  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST",
    },

    body: JSON.stringify(result, null, 2),
  };
};