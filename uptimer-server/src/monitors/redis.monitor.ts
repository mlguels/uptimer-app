import dayjs from "dayjs";
import { redisPing } from "./monitors";

import logger from "@app/server/logger";
import { IMonitorDocument, IMonitorResponse } from "@app/interfaces/monitor.interface";
import { IHeartbeat } from "@app/interfaces/heartbeat.interface";
import { getMonitorById, updateMonitorStatus } from "@app/services/monitor.service";
import { createRedisHeartBeat } from "@app/services/redis.service";

class RedisMonitor {
  errorCount: number;
  noSuccessAlert: boolean;

  constructor() {
    this.errorCount = 0;
    this.noSuccessAlert = true;
  }

  async start(data: IMonitorDocument) {
    const { monitorId, url } = data;

    try {
      const monitorData: IMonitorDocument = await getMonitorById(monitorId!);
      const response: IMonitorResponse = await redisPing(url!);
    } catch (error) {}
  }

  async assertionCheck(response: IMonitorResponse, monitorData: IMonitorDocument) {
    const timestamp = dayjs.utc().valueOf();
    let heartbeatData: IHeartbeat = {
      monitorId: monitorData.id!,
      status: 0,
      code: response.code,
      message: response.message,
      timestamp,
      responseTime: response.responseTime,
      connection: response.status,
    };
    if (monitorData.connection !== response.status) {
      this.errorCount += 1;
      heartbeatData = {
        ...heartbeatData,
        status: 1,
        message: "Failed redis response assertion",
      };
      await Promise.all([updateMonitorStatus(monitorData, timestamp, "failure"), createRedisHeartBeat(heartbeatData)]);
      logger.info(`Redis heartbeat failed assertions: Monitor ID ${monitorData.id}`);
      if (monitorData.alertThreshold > 0 && this.errorCount > monitorData.alertThreshold) {
        this.errorCount = 0;
        this.noSuccessAlert = false;
      } else {
        await Promise.all([
          updateMonitorStatus(monitorData, timestamp, "success"),
          createRedisHeartBeat(heartbeatData),
        ]);
        logger.info(`Redis heartbeat success: Monitor ID ${monitorData.id}`);
        if (!this.noSuccessAlert) {
          this.errorCount = 0;
          this.noSuccessAlert = true;
          // Send email here
        }
      }
    }
  }
}

export const redisMonitor: RedisMonitor = new RedisMonitor();
