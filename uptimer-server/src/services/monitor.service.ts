import { Model } from "sequelize";
import { IMonitorDocument } from "@app/interfaces/monitor.interface";
import { MonitorModel } from "@app/models/monitor.model";

export const createMonitor = async (data: IMonitorDocument): Promise<IMonitorDocument> => {
  try {
    const result: Model = await MonitorModel.create(data);
    return result.dataValues;
  } catch (error) {
    throw new Error(error);
  }
};

export const getAllUserMonitors = async (userId: number): Promise<IMonitorDocument[]> => {
  try {
    const monitors: IMonitorDocument[] = (await MonitorModel.findAll({
      raw: true,
      where: {
        userId,
      },
      order: [["createdAt", "DESC"]],
    })) as unknown as IMonitorDocument[];
    return monitors;
  } catch (error) {
    throw new Error(error);
  }
};
