import http from "http";

import { Express, NextFunction, Request, Response } from "express";
import { NODE_ENV, PORT } from "./config";
import { ApolloServer } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { ApolloServerPluginLandingPageDisabled } from "@apollo/server/plugin/disabled";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";

const typeDefs = `#graphql
  type User {
    username: String
  }

  type Query {
    user: User
  }
`;

const resolvers = {
  Query: {
    user() {
      return {
        username: "Danny",
      };
    },
  },
};

export default class MonitorServer {
  private app: Express;
  private httpServer: http.Server;
  private server: ApolloServer;

  constructor(app: Express) {
    this.app = app;
    this.httpServer = new http.Server(app);
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    this.server = new ApolloServer({
      schema,
      introspection: NODE_ENV !== "production",
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer: this.httpServer }),
        NODE_ENV === "production"
          ? ApolloServerPluginLandingPageDisabled()
          : ApolloServerPluginLandingPageLocalDefault({ embed: true }),
      ],
    });
  }

  async start(): Promise<void> {
    // You must call the strat() method on the Apollo Server instance before passing the instance to expressMiddleware
    //
    await this.server.start();
    this.standardMiddleware(this.app);
    this.startServer();
  }

  private standardMiddleware(app: Express): void {
    app.set("trust proxy", 1);
    app.use((_req: Request, res: Response, next: NextFunction) => {
      res.header("Cache-Control", "no-cache, no store, must-revalidate");
      next();
    });
  }

  private async startServer(): Promise<void> {
    try {
      const SERVER_PORT: number = parseInt(PORT!, 10) || 5001;
      console.info(`Server has started with process id ${process.pid}`);
      this.httpServer.listen(SERVER_PORT, () => {
        console.info(`Server running on port ${SERVER_PORT}`);
      });
    } catch (error) {
      console.error("error", "startServer() error method:", error);
    }
  }
}
