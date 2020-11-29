import { Client } from "pg";
import * as AWSMock from "aws-sdk-mock";
import { catalogBatchProcess } from "./catalogBatchProcess";

jest.mock("pg", () => {
  const mClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Client: jest.fn(() => mClient) };
});

describe("catalogBatchProcess tests", () => {
  let client;
  beforeEach(() => {
    client = new Client();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("simplest test case", async () => {
    let mockedEmailPublish = jest.fn();
    AWSMock.mock(
      "SNS",
      "publish",

      (params: any, callback: Function) => {
        mockedEmailPublish();
        console.log("SNS", "publish", "mock called");
        callback(null, "dump");
      }
    );

    const event = {
      Records: [{ body: JSON.stringify({}) }],
    };

    client.query.mockResolvedValue({
      rows: [{ id: "newId" }],
      rowCount: 0,
    });

    await catalogBatchProcess(event, null, () => {});
    expect(client.connect).toBeCalledTimes(1);
    expect(client.query).toBeCalledTimes(5);
    expect(client.query).toBeCalledWith("BEGIN");
    expect(client.end).toBeCalledTimes(1);
    expect(mockedEmailPublish).toBeCalledTimes(1);

    AWSMock.restore("S3");
  });
});
