import {
  APIGatewayAuthorizerEvent,
  APIGatewayAuthorizerResult,
  Callback,
} from "aws-lambda";

export const basicAuthorizer = async (
  event: APIGatewayAuthorizerEvent,
  _ctx,
  cb: Callback<APIGatewayAuthorizerResult>
) => {
  console.log("lambda basicAuthorizer Event:", JSON.stringify(event));
  console.log("Event type:", event["type"]);
  console.log("Event res arn :", event.methodArn);
  console.log("Event authorizationToken:", event.authorizationToken);

  if (event["type"] !== "TOKEN") {
    cb("Unauthorized");
  }

  try {

    const authorizationToken = event.authorizationToken;
    const encodedCreds = authorizationToken.split(" ")[1];
    const buff = Buffer.from(encodedCreds, "base64");
    const plainCreds = buff.toString("utf-8").split(":");
    const username = plainCreds[0].toLowerCase();
    const password = plainCreds[1];


    console.log(`username: ${username} and password: ${password}`);

    const storedUserPassword = process.env[username];
    const effect = !storedUserPassword || storedUserPassword !== password ? "Deny" : "Allow";
    
    console.log(`effect: ${effect} `);

       let result: APIGatewayAuthorizerResult;
    const resArn = event.methodArn;

    result = {
      principalId: encodedCreds,
      policyDocument: {
        Version: "2012-10-17",
        Statement: 
          {
            Action: "execute-api:Invoke",
            Effect: effect,
            Resource: resArn,
          },
        
      },
    };

    //const result = generatePolicy(encodedCreds, event.methodArn, effect);
    //return result;
    cb(null, result);
  } catch (error) {
    cb(`Unauthorized : ${error.message}`);
  }
};
