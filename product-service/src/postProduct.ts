import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { addProduct } from "./productDbLogic";
import * as Joi from "joi";

//TODO replace to product model after cross check
const productSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string(),
  price: Joi.number().required(),
  count: Joi.number().integer().required(),
});

const headers = {
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,POST",
};

export const postProduct: APIGatewayProxyHandler = async (event, _context) => {
  console.log("Lambda function: postProduct.  Event:", event);
  let parsedBody;
  try {
    parsedBody = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify(
        {
          message: "body is invalid or missing",
        },
        null,
        2
      ),
    };
  }

  const validation = productSchema.validate(parsedBody, { abortEarly: false });
  if (validation.error) {
    const errorsList = validation.error.details.map(({ message }) => message);
    return {
      statusCode: 400,
      body: JSON.stringify(errorsList, null, 2),
    };
  }

  let statusCode = 404;
  let result = {};

  try {
    result = await addProduct(parsedBody);
    if (result) {
      statusCode = 201;
    } else {
      statusCode = 500;
      result = {
        message: "internal server error",
      };
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
