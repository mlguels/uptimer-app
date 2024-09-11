import { mergeTypeDefs } from "@graphql-tools/merge";
import { userSchema } from "./user";

export const mergedGQLSchema = mergeTypeDefs([userSchema]);
