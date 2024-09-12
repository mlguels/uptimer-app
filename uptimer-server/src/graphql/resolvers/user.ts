import { Request } from "express";
import { GraphQLError } from "graphql";
import { toLower, upperFirst } from "lodash";
import { sign } from "jsonwebtoken";

import { AppContext } from "@app/server/server";
import { INotificationDocument } from "@app/interfaces/notification.interface";
import { IUserDocument, IUserResponse } from "@app/interfaces/user.interface";
import {
  createNotificationGroup,
  getAllNotificationGroups,
} from "@app/services/notification.service";
import { createNewUser, getUserByUsernameOrEmail } from "@app/services/user.service";
import { JWT_TOKEN } from "@app/server/config";

export const UserResolver = {
  Mutation: {
    async registerUser(_: undefined, args: { user: IUserDocument }, contextValue: AppContext) {
      const { req } = contextValue;
      const { user } = args;
      // TODO: Add data validation
      const { username, email, password } = user;
      const checkIfUserExist: IUserDocument | undefined = await getUserByUsernameOrEmail(
        username!,
        email!
      );

      // if (checkIfUserExist) {
      //   throw new GraphQLError("Invalid credentials. Email or username.");
      // }
      if (checkIfUserExist) {
        const existingUserMessage = `User with username ${username} or email ${email} already exists.`;
        throw new GraphQLError(existingUserMessage);
      }
      const authData: IUserDocument = {
        username: upperFirst(username),
        email: toLower(email),
        password,
      } as IUserDocument;
      const result: IUserDocument | undefined = await createNewUser(authData);
      const response: IUserResponse = await userReturnValue(req, result, "register");
      return response;
    },
  },
  User: {
    createdAt: (user: IUserDocument) => new Date(user.createdAt!).toISOString(),
  },
};

async function userReturnValue(
  req: Request,
  result: IUserDocument,
  type: string
): Promise<IUserResponse> {
  let notifications: INotificationDocument[] = [];
  if (type === "register" && result && result.id && result.email) {
    const notification = await createNotificationGroup({
      userId: result.id,
      groupName: "Default Contact Group",
      emails: JSON.stringify([result.email]),
    });
    notifications.push(notification);
  } else if (type === "login" && result && result.id && result.email) {
    notifications = await getAllNotificationGroups(result.id);
  }

  if (!JWT_TOKEN) {
    throw new Error("JWT_TOKEN is not defined");
  }

  const userJwt: string = sign(
    {
      id: result.id,
      email: result.email,
      username: result.username,
    },
    JWT_TOKEN
  );

  req.session = { jwt: userJwt, enableAutomaticRefresh: false };

  const user: IUserDocument = {
    id: result.id,
    email: result.email,
    username: result.username,
    createdAt: result.createdAt,
  } as IUserDocument;

  return {
    user,
    notifications,
  };
}
