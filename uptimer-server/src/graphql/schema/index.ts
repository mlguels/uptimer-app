import { mergeTypeDefs } from "@graphql-tools/merge";
import { userSchema } from "./user";
import { notificationSchema } from "./notification";

export const mergedGQLSchema = mergeTypeDefs([userSchema, notificationSchema]);
