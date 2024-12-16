import { Socket } from "net";

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

export const tcpPing = async (hostname: string, port: number, timeout: number): Promise<IMonitorResponse> => {
  return new Promise((resolve, reject) => {
    const socket: Socket = new Socket();
    const startTime: number = Date.now();

    const options = {
      address: hostname || "127.0.0.1",
      port: port || 80,
      timeout: timeout * 1000 || 1000,
    };

    socket.setTimeout(options.timeout, () => {
      socket.destroy();
      reject({
        status: "refused",
        responseTime: Date.now() - startTime,
        message: "TCP socket timeout",
        code: 500,
      });
    });

    socket.connect(options.port, options.address, () => {
      socket.end();
      resolve({
        status: "established",
        responseTime: Date.now() - startTime,
        message: "TCP socket connection established",
        code: 200,
      });
    });

    socket.on("error", (error) => {
      socket.destroy();
      reject({
        status: "refused",
        responseTime: Date.now() - startTime,
        message: error && error.message.length > 0 ? error.message : "TCP socket connection refused",
        code: 500,
      });
    });
  });
};
