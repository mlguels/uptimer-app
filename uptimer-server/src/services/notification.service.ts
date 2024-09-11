import { Model } from "sequelize";
import { INotificationDocument } from "@app/interfaces/notification.interface";
import { NotificationModel } from "@app/models/notification.model";

export async function createNotificationGroup(
  data: INotificationDocument
): Promise<INotificationDocument> {
  try {
    const result: Model = await NotificationModel.create(data);
    return result.dataValues;
  } catch (error) {
    throw new Error(error);
  }
}

export async function getSingleNotificationGroup(
  notificationId: string
): Promise<INotificationDocument> {
  try {
    const notification: INotificationDocument = (await NotificationModel.findOne({
      raw: true,
      where: {
        id: notificationId,
      },
      order: ["createAt", "DESC"],
    })) as unknown as INotificationDocument;
    return notification;
  } catch (error) {
    throw new Error(error);
  }
}

export async function getAllNotificationGroups(userId: number): Promise<INotificationDocument[]> {
  try {
    const notification: INotificationDocument[] = (await NotificationModel.findAll({
      raw: true,
      where: {
        userId,
      },
      order: ["createAt", "DESC"],
    })) as unknown as INotificationDocument[];
    return notification;
  } catch (error) {
    throw new Error(error);
  }
}

export async function updateNotificationGroup(
  notificationId: string,
  data: INotificationDocument
): Promise<void> {
  try {
    await NotificationModel.update(data, {
      where: { id: notificationId },
    });
  } catch (error) {
    throw new Error(error);
  }
}

export async function deleteNotificationGroup(notificationId: string): Promise<void> {
  try {
    await NotificationModel.destroy({
      where: { id: notificationId },
    });
  } catch (error) {
    throw new Error(error);
  }
}
