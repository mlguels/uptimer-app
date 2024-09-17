import { INotificationDocument } from "@app/interfaces/notification.interface";
import { AppContext } from "@app/server/server";
import { createNotificationGroup, getAllNotificationGroups } from "@app/services/notification.service";
import { authenticateGraphQLRoute } from "@app/utils/utils";

export const NotificationResolver = {
  Query: {
    async getUserNotificationGroups(_: undefined, { userId }: { userId: string }, contextValue: AppContext) {
      const { req } = contextValue;
      authenticateGraphQLRoute(req);
      const notifications: INotificationDocument[] = await getAllNotificationGroups(parseInt(userId));
      return {
        notifications,
      };
    },
  },
  Mutation: {
    async createNotificationGroup(_: undefined, args: { group: INotificationDocument }, contextValue: AppContext) {
      const { req } = contextValue;
      authenticateGraphQLRoute(req);
      const notification: INotificationDocument = await createNotificationGroup(args.group!);
      return {
        notifications: [notification],
      };
    },
  },
};
