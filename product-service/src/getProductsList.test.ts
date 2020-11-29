import { getProductsList } from "../src/getProductsList";
import { Client } from "pg";
import productList from "../productList.json";

const headers = {
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,GET",
};

jest.mock("pg", () => {
  const mClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Client: jest.fn(() => mClient) };
});

describe("getProductsList tests", () => {
  let client;
  beforeEach(() => {
    client = new Client();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  test("should get all products", async () => {
    client.query.mockResolvedValueOnce({
      rows: productList,
      rowCount: productList.length,
    });

    const response = {
      statusCode: 200,
      body: JSON.stringify(productList, null, 2),
      headers,
    };
    await expect(getProductsList()).resolves.toEqual(response);
  });
});
