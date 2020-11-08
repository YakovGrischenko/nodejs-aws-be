import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { Client } from "pg";

const { PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD } = process.env;
const dbOptions = {
  host: PG_HOST,
  port: PG_PORT,
  database: PG_DATABASE,
  user: PG_USERNAME,
  password: PG_PASSWORD,
  ssl: {
    rejectUnauthorized: false, // to avoid warring in this example
  },
  connectionTimeoutMillis: 5000, // time in millisecond for termination of the database query
};

export const getProductsById: APIGatewayProxyHandler = async (
  event,
  _context
) => {
  let statusCode = 404;
  let result = {};
  const client = new Client(dbOptions);

  try {
    await client.connect();

    const {
      pathParameters: { productId },
    } = event;

    try {
      const text =
        "select p.*, s.count from products as p inner join stocks as s on p.id = s.product_id where p.id = $1";

      const {
        rows: [product],
      } = await client.query(text, [productId]);

      if (product) {
        statusCode = 200;
        result = product;
      } else {
        statusCode = 404;
        result = {
          message: "Product not found",
        };
      }
    } catch (error) {
      statusCode = 400;
      result = {
        message: "Product UUID format is invalid.",
      };
    }
  } catch (error) {
    statusCode = 500;
    result = {
      message: "internal server error",
    };
  } finally {
    client.end();
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
