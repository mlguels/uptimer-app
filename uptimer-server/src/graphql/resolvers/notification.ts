import { INotificationDocument } from "@app/interfaces/notification.interface";
import { AppContext } from "@app/server/server";
import { getAllNotificationGroups } from "@app/services/notification.service";
import { authenticateGraphQLRoute } from "@app/utils/utils";

export const NotificationResolver = {
  Query: {
    async getUserNotificationGroups(
      _: undefined,
      { userId }: { userId: string },
      contextValue: AppContext
    ) {
      const { req } = contextValue;
      authenticateGraphQLRoute(req);
      const notifications: INotificationDocument[] = await getAllNotificationGroups(
        parseInt(userId)
      );
      return {
        notifications,
      };
    },
  },
};
