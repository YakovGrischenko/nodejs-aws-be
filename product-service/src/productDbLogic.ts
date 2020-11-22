import "source-map-support/register";
import { Client } from "pg";

import { dbOptions } from "./dbOptions";

export const addProduct = async (product) => {
  let result = false;

  const { title, description = "", price = 0, count = 0 } = product;

  const client = new Client(dbOptions);
  try {
    await client.connect();

    await client.query("BEGIN");

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

    await client.query("COMMIT");

    result = product;
  } catch (err) {
    // you can process error here. In this example just log it to console.
    console.error("Error during database request executing:", err);
    await client.query("ROLLBACK");
  } finally {
    // in case if error was occurred, connection will not close automatically
    client.end(); // manual closing of connection
  }
  return result;
};
