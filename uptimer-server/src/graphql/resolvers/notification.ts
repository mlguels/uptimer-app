import { INotificationDocument } from "@app/interfaces/notification.interface";
import { AppContext } from "@app/server/server";
import { authenticateGraphQLRoute } from "@app/utils/utils";
import {
  createNotificationGroup,
  getAllNotificationGroups,
  updateNotificationGroup,
} from "@app/services/notification.service";

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
    async updateNotificationGroup(
      _: undefined,
      args: { notificationId: string; group: INotificationDocument },
      contextValue: AppContext
    ) {
      const { req } = contextValue;
      authenticateGraphQLRoute(req);
      const { notificationId, group } = args;

      await updateNotificationGroup(parseInt(notificationId), group);
      const notification = { ...group, id: parseInt(notificationId) };
      return {
        notifications: [notification],
      };
    },
  },
};
