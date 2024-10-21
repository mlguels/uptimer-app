import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

// import { IEmailLocals } from "@app/interfaces/notification.interface";

import { IMonitorDocument } from "@app/interfaces/monitor.interface";
import { getMonitorById, updateMonitorStatus } from "@app/services/monitor.service";
import { encodeBase64 } from "@app/utils/utils";
import { IHeartbeat } from "@app/interfaces/heartbeat.interface";
import dayjs from "dayjs";
import { createHttpHeartBeat } from "@app/services/http.service";
import logger from "@app/server/logger";

class HttpMonitor {
  errorCount: number;
  noSuccessAlert: boolean;
  // emailsLocals: IEmailLocals;

  constructor() {
    this.errorCount = 0;
    this.noSuccessAlert = true;
    // this.emailsLocals
  }

  async start(data: IMonitorDocument): Promise<void> {
    const {
      monitorId,
      httpAuthMethod,
      basicAuthUser,
      basicAuthPass,
      url,
      method,
      headers,
      body,
      timeout,
      redirects,
      bearerToken,
    } = data;

    let reqTimeout = timeout! * 1000;
    const startTime: number = Date.now();
    try {
      const monitorData: IMonitorDocument = await getMonitorById(monitorId!);
      let basicAuthHeader = {};
      if (httpAuthMethod === "basic") {
        basicAuthHeader = {
          Authorization: `Basic ${encodeBase64(basicAuthUser!, basicAuthPass!)}`,
        };
      }
      if (httpAuthMethod === "token") {
        basicAuthHeader = {
          Authorization: `Bearer ${bearerToken}`,
        };
      }

      let bodyValue = null;
      let reqContentType = null;
      if (body!.length > 0) {
        try {
          bodyValue = JSON.parse(body!);
          reqContentType = "application/json";
        } catch (error) {
          throw new Error("Your JSON body is invaild");
        }
      }

      const options: AxiosRequestConfig = {
        url,
        method: (method || "get").toLowerCase(),
        timeout: reqTimeout,
        headers: {
          Accept: "text/html,application/json",
          ...(reqContentType ? { "Content-Type": reqContentType } : {}),
          ...basicAuthHeader,
          ...(headers ? JSON.parse(headers) : {}),
        },
        maxRedirects: redirects,
        ...(bodyValue && {
          data: bodyValue,
        }),
      };

      const response: AxiosResponse = await axios.request(options);
      const responseTime = Date.now() - startTime;
      const heartbeatdata: IHeartbeat = {
        monitorId: monitorId!,
        status: 0,
        code: response.status ?? 0,
        message:
          response?.status && response?.statusText
            ? `${response.status} - ${response.statusText}`
            : "Http monitor check successful.",
        timestamp: dayjs.utc().valueOf(),
        reqHeaders: JSON.stringify(response.headers) ?? "",
        resHeaders: JSON.stringify(response.request.res.rawHeaders) ?? "",
        reqBody: body,
        resBody: JSON.stringify(response.data) ?? "",
        responseTime,
      };
      const statusList = JSON.parse(monitorData.statusCode!);
      const responseDurationTime = JSON.parse(monitorData.responseTime!);
      const contentTypeList = monitorData.contentType!.length > 0 ? JSON.parse(monitorData.contentType!) : [];
      if (
        !statusList.includes(response.status) ||
        responseDurationTime > responseTime ||
        (contentTypeList.length > 0 && !contentTypeList.includes(response.headers["content-type"]))
      ) {
        this.errorAssertionCheck(monitorData, heartbeatdata);
      } else {
        this.successAssertionCheck(monitorData, heartbeatdata);
      }
    } catch (error) {
      const monitorData: IMonitorDocument = await getMonitorById(monitorId!);
      this.httpError(monitorId!, startTime, monitorData, error);
    }
  }

  async errorAssertionCheck(monitorData: IMonitorDocument, heartbeatData: IHeartbeat): Promise<void> {
    this.errorCount += 1;
    const timestamp = dayjs.utc().valueOf();
    await Promise.all([updateMonitorStatus(monitorData, timestamp, "failure"), createHttpHeartBeat(heartbeatData)]);
    if (monitorData.alertThreshold > 0 && this.errorCount > monitorData.alertThreshold) {
      this.errorCount = 0;
      this.noSuccessAlert = false;
      // TODO: send error to email
    }
    logger.info(`HTTP heartbeat failed assertions: Monitor ID ${monitorData.id}`);
  }
  async successAssertionCheck(monitorData: IMonitorDocument, heartbeatdata: IHeartbeat): Promise<void> {
    await Promise.all([
      updateMonitorStatus(monitorData, heartbeatdata.timestamp, "success"),
      createHttpHeartBeat(heartbeatdata),
    ]);
    if (!this.noSuccessAlert) {
      this.errorCount = 0;
      this.noSuccessAlert = true;
      // TODO: send success to email
    }
    logger.info(`HTTP heartbeat success Monitor ID ${monitorData.id}`);
  }
  async httpError(monitorId: number, startTime: number, monitorData: IMonitorDocument, error: any): Promise<void> {
    logger.info(`HTTP heart beatfailed ${monitorId}`);
    this.errorCount += 1;
    const timestamp = dayjs.utc().valueOf();
    let heartbeatData: IHeartbeat = {
      monitorId: monitorId!,
      status: 0,
      code: error.response.status ?? 500,
      message:
        error.response?.status && error.response?.statusText
          ? `${error.response.status} - ${error.response.statusText}`
          : "Http monitor check successful.",
      timestamp,
      reqHeaders: JSON.stringify(error.response.headers) ?? "",
      resHeaders: JSON.stringify(error.response.request.res.rawHeaders) ?? "",
      reqBody: "",
      resBody: JSON.stringify(error.response.data) ?? "",
      responseTime: Date.now() - startTime,
    };
    await Promise.all([updateMonitorStatus(monitorData, timestamp, "failure"), createHttpHeartBeat(heartbeatData)]);
    if (monitorData.alertThreshold > 0 && this.errorCount > monitorData.alertThreshold) {
      this.errorCount = 0;
      this.noSuccessAlert = false;
      // TODO: send error to email
    }
  }
}

export const httpMonitor: HttpMonitor = new HttpMonitor();
