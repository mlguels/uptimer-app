import { ApolloClient, ApolloLink, createHttpLink, InMemoryCache, NormalizedCacheObject, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { Kind, OperationTypeNode } from "graphql";
import { createClient } from "graphql-ws";

const httpUrl: string = "http://localhost:5001/graphql";
const wsUrl: string = "ws://localhost:5001/graphql";

const httpLink: ApolloLink = createHttpLink({
  uri: httpUrl,
  credentials: "include",
});
const wsLink = new GraphQLWsLink(
  createClient({
    url: wsUrl,
    retryAttempts: 20,
    shouldRetry: () => true,
    on: {
      closed: () => console.log("closed"),
      connected: () => console.log("Client connected"),
    },
  })
);

const cache: InMemoryCache = new InMemoryCache();

const apolloClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  link: split(isSubscription, wsLink, httpLink),
  cache,
  connectToDevTools: true, // set to false for production
});

function isSubscription({ query }: { query: any }): boolean {
  const definition = query.definitions[0];
  return definition.kind === Kind.OPERATION_DEFINITION && definition.operation === OperationTypeNode.SUBSCRIPTION;
}

export { apolloClient };
