import { Model, Op } from "sequelize";
import dayjs from "dayjs";

import { IHeartbeat } from "@app/interfaces/heartbeat.interface";
import { HttpModel } from "@app/models/http.model";

export const createHttpHeartBeat = async (data: IHeartbeat): Promise<IHeartbeat> => {
  try {
    const result: Model = await HttpModel.create(data);
    return result.dataValues;
  } catch (error) {
    throw new Error(error);
  }
};

export const getHttpHeartBeatsByDuration = async (monitorId: number, duration = 24): Promise<IHeartbeat[]> => {
  try {
    const dateTime: Date = dayjs.utc().toDate();
    dateTime.setHours(dateTime.getHours() - duration);
    const heartbeats: IHeartbeat[] = (await HttpModel.findAll({
      raw: true,
      where: {
        [Op.and]: [
          { monitorId },
          {
            timestamp: {
              [Op.gte]: dateTime,
            },
          },
        ],
      },
      order: [["timestamp", "DESC"]],
    })) as unknown as IHeartbeat[];
    return heartbeats;
  } catch (error) {
    throw new Error(error);
  }
};
