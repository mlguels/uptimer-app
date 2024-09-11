import http from "http";
import cors from "cors";
import cookieSession from "cookie-session";

import { Express, json, NextFunction, Request, Response, urlencoded } from "express";

import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { ApolloServerPluginLandingPageDisabled } from "@apollo/server/plugin/disabled";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { expressMiddleware } from "@apollo/server/express4";
import { makeExecutableSchema } from "@graphql-tools/schema";

import { CLIENT_URL, NODE_ENV, PORT, SECRET_KEY_ONE, SECRET_KEY_TWO } from "./config";
import logger from "./logger";
import { mergedGQLSchema } from "@app/graphql/schema";
import { GraphQLSchema } from "graphql";
import { BaseContext } from "@apollo/server";
import { resolvers } from "@app/graphql/resolvers";

export interface AppContext {
  req: Request;
  res: Response;
}

export default class MonitorServer {
  private app: Express;
  private httpServer: http.Server;
  private server: ApolloServer;

  constructor(app: Express) {
    // this stores tje express application instance
    this.app = app;
    // this stores the HTTP server instance created using the express app
    this.httpServer = new http.Server(app);
    // this creates the GraphQL schema
    const schema: GraphQLSchema = makeExecutableSchema({
      typeDefs: mergedGQLSchema,
      resolvers,
    });
    // this stores the apollo server instance, which is responsible for handling GraphQL operations
    this.server = new ApolloServer<AppContext | BaseContext>({
      schema, // Assigns the created schema to the apollo server
      introspection: NODE_ENV !== "production", // Allows introspection in non-production environments
      // sets up plugins for the apollo server
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer: this.httpServer }),
        NODE_ENV === "production"
          ? ApolloServerPluginLandingPageDisabled()
          : ApolloServerPluginLandingPageLocalDefault({ embed: true }),
      ],
    });
  }

  /*
    This asynchronous method is the entry point of starting the server
    It firsts starts the Apollo server and then applies the standard middleware and routes before starting the HTTP server
  */
  async start(): Promise<void> {
    // You must call the strat() method on the Apollo Server instance before passing the instance to expressMiddleware
    await this.server.start(); // Starts he apollo server
    this.standardMiddleware(this.app); // Applies standard middleware
    this.startServer(); // Starts the HTTP server
  }

  /*
    This private method sets up common middleware for the Express app, such as proxy settings, cache control headers,
    and session management using cookies. It also configures the GraphQL and health check routes
  */
  private standardMiddleware(app: Express): void {
    app.set("trust proxy", 1); // Configures the app to trust the first proxy in front of it
    app.use((_req: Request, res: Response, next: NextFunction) => {
      res.header("Cache-Control", "no-cache, no store, must-revalidate");
      next(); // Adds a cache-control header to the response
    });
    app.use(
      cookieSession({
        name: "session",
        keys: [SECRET_KEY_ONE, SECRET_KEY_TWO], // Sets up session cookies
        maxAge: 24 * 7 * 3600000,
        secure: NODE_ENV !== "development",
        ...(NODE_ENV !== "development" && {
          sameSite: "none",
        }),
      })
    );
    this.graphqlRoute(app); // Configures the /graphql route
    this.healthRoute(app); // Configures the /health route
  }

  /*
    This method configures the 'graphql' route to handle GraphQL requests. It applies CORS, JSON parsing,
    and URL encoded middleware before delegating the request handling to the Apollo Server
  */
  private graphqlRoute(app: Express): void {
    app.use(
      "/graphql",
      cors({
        origin: CLIENT_URL,
        credentials: true, // Enables CORS for the CLIENT_URL
      }),
      json({ limit: "200mb" }), // Parses incoming JSON requests
      urlencoded({ extended: true, limit: "200mb" }), // Parses URL-encoded data
      expressMiddleware(this.server, {
        context: async ({ req, res }: { req: Request; res: Response }) => {
          return { req, res }; // Provides the request and response to the context
        },
      })
    );
  }

  /*
    This method sets up a simple health check route at '/health' that returns a 200 status with a message
    indicating that the service is healthy
  */
  private healthRoute(app: Express): void {
    app.get("/health", (_req: Request, res: Response) => {
      res.status(200).send("Uptimer monitor service is healthy and OK."); // Sends a simple health check response
    });
  }

  /*
    This method is responsible for starting the HTTP server. It listens on a specified port and logs
    messages to indicate that the sever has started 
  */
  private async startServer(): Promise<void> {
    try {
      const SERVER_PORT: number = parseInt(PORT!, 10) || 5001; // Determines the port to listen on
      logger.info(`Server has started with process id ${process.pid}`);
      this.httpServer.listen(SERVER_PORT, () => {
        logger.info(`Server running on port ${SERVER_PORT}`); // Logs that the server is running
      });
    } catch (error) {
      logger.error("error", "startServer() error method:", error); // Logs any errors that occur
    }
  }
}
