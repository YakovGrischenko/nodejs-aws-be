import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { Client } from "pg";
import * as Joi from "joi";

//TODO replace to product model after cross check
const productSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string(),
  price: Joi.number().required(),
  count: Joi.number().integer().required(),
});


import { dbOptions } from './dbOptions'

const headers = {
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,POST",
}

export const postProduct: APIGatewayProxyHandler = async (event, _context) => {
  console.log('Lambda function: postProduct.  Event:', event);
  let parsedBody;
  try{
    parsedBody = JSON.parse(
      event.body
    );
  } catch (err){
    return {
      statusCode:400,
      headers,
      body: JSON.stringify({
        message: "body is invalid or missing",
      }, null, 2),
    };
  }

  const validation = productSchema.validate(parsedBody, { abortEarly: false });
  if (validation.error) {
    const errorsList = validation.error.details.map(({ message }) => message);
    return {
      statusCode: 400,
      body: JSON.stringify(errorsList, null, 2),
    }
  }


  const { title, description = "", price = 0, count = 0 } = parsedBody;

  let statusCode = 404;
  let result = {};

  try {
    const client = new Client(dbOptions);
    try {
      await client.connect();

      await client.query('BEGIN')

      const dmlResult = await client.query(
        `insert into products (title, description, price) values ($1, $2, $3) returning *`,
        [title, description, price]
      );

      const { id: newUUID } = dmlResult.rows[0];

      await client.query(
        `insert into stocks (product_id, count) values 
        ($1, $2)`,
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
  } catch (err) {
    statusCode = 500;
    result = {
      message: "internal server error",
    };
  } 
  return {
    statusCode,
    headers,
    body: JSON.stringify(result, null, 2),
  };
};
