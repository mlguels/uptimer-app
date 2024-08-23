import express, { Express } from "express";
import MonitorServer from "./server/server";

const initializeApp = (): void => {
  const app: Express = express();
  const monitorServer = new MonitorServer(app);
  monitorServer.start();
};

initializeApp();
