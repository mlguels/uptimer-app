import { Model, Op } from "sequelize";
import { IMonitorDocument } from "@app/interfaces/monitor.interface";
import { MonitorModel } from "@app/models/monitor.model";
import { getSingleNotificationGroup } from "./notification.service";

/**
 * Creates a new monitor
 * @param data
 * @returns {Promise<IMonitorDocument[]>}
 */
export const createMonitor = async (data: IMonitorDocument): Promise<IMonitorDocument> => {
  try {
    const result: Model = await MonitorModel.create(data);
    return result.dataValues;
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Gets either all monitors (active or inactive) or just active for a user
 * @param userId
 * @param active
 * @returns {Promise<IMonitorDocument[]>}
 */
export const getUserMonitors = async (userId: number, active?: boolean): Promise<IMonitorDocument[]> => {
  try {
    const monitors: IMonitorDocument[] = (await MonitorModel.findAll({
      raw: true,
      where: {
        [Op.and]: [
          {
            userId,
            ...(active && {
              active: true,
            }),
          },
        ],
      },
      order: [["createdAt", "DESC"]],
    })) as unknown as IMonitorDocument[];
    return monitors;
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Gets all active monitors for a user
 * @param userId
 * @returns {Promise<IMonitorDocument[]>}
 */
export const getUserActiveMonitors = async (userId: number): Promise<IMonitorDocument[]> => {
  try {
    const monitors: IMonitorDocument[] = await getUserMonitors(userId, true);
    for (const monitor of monitors) {
      console.log(monitor);
    }
    return monitors;
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Returns all active monitors for all users
 * @returns {Promise<IMonitorDocument[]>}
 */
export const getAllUserMonitors = async (): Promise<IMonitorDocument[]> => {
  try {
    const monitors: IMonitorDocument[] = (await MonitorModel.findAll({
      raw: true,
      where: { active: true },
      order: [["createdAt", "DESC"]],
    })) as unknown as IMonitorDocument[];

    return monitors;
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Get monitor by id
 * @param monitorId
 * @returns {Promise<IMonitorDocument[]>}
 */
export const getMonitorById = async (monitorId: number): Promise<IMonitorDocument> => {
  try {
    const monitor: IMonitorDocument = (await MonitorModel.findOne({
      raw: true,
      where: { id: monitorId },
    })) as unknown as IMonitorDocument;
    let updatedMonitor: IMonitorDocument = { ...monitor };
    const notifications = await getSingleNotificationGroup(updatedMonitor.notificationId!);
    updatedMonitor = { ...updatedMonitor, notifications };
    return updatedMonitor;
  } catch (error) {
    throw new Error(error);
  }
};
