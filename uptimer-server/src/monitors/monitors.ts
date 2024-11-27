import { MongoClient } from "mongodb";
import { createClient } from "redis";
import { IMonitorResponse } from "@app/interfaces/monitor.interface";

export const mongodbPing = async (connectionString: string): Promise<IMonitorResponse> => {
  const startTime: number = Date.now();
  return new Promise((resolve, reject) => {
    MongoClient.connect(connectionString)
      .then(async (client: MongoClient) => {
        await client.db().command({ ping: 1 });
        await client.close();

        resolve({
          status: "established",
          responseTime: Date.now() - startTime,
          message: "MongoDB server running",
          code: 200,
        });
      })
      .catch((error) => {
        if (error?.errorResponse) {
          reject({
            status: "refused",
            responseTime: Date.now() - startTime,
            message: error?.errorResponse.errmsg ?? "MongoDB server connection issue",
            code: error?.errorResponse?.code ?? 500,
          });
        } else {
          reject({
            status: "refused",
            responseTime: Date.now() - startTime,
            message: "MongoDB server down",
            code: 500,
          });
        }
      });
  });
};

export const redisPing = async (connectionString: string): Promise<IMonitorResponse> => {
  const startTime: number = Date.now();
  return new Promise((resolve, reject) => {
    const client = createClient({
      url: connectionString,
    });
    client.on("error", (error) => {
      if (client.isOpen) {
        client.disconnect();
      }
      reject({
        status: "refused",
        responseTime: Date.now() - startTime,
        message: error.message ?? "Redis connection refused",
        code: 500,
      });
    });
    client.connect().then(() => {
      if (!client.isOpen) {
        reject({
          status: "refused",
          responseTime: Date.now() - startTime,
          message: "Connection isn't open",
          code: 500,
        });
        client
          .ping()
          .then(() => {
            if (client.isOpen) {
              client.disconnect();
            }
            resolve({
              status: "established",
              responseTime: Date.now() - startTime,
              message: "Redis server running",
              code: 200,
            });
          })
          .catch((err) => {
            reject({
              status: "refused",
              responseTime: Date.now() - startTime,
              message: err.message ?? "Redis server down",
              code: 500,
            });
          });
      }
    });
  });
};
