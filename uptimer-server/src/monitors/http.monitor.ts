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

    const reqTimeout = timeout! * 1000;
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
      if (body && body!.length > 0) {
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
      let heartbeatData: IHeartbeat = {
        monitorId: monitorId!,
        status: 0,
        code: response.status ?? 0,
        message: response?.status ? `${response.status} - ${response.statusText}` : "Http monitor check successful.",
        timestamp: dayjs.utc().valueOf(),
        reqHeaders: JSON.stringify(response.headers) ?? "",
        resHeaders: JSON.stringify(response.request.res.rawHeaders) ?? "",
        reqBody: body,
        resBody: JSON.stringify(response.data) ?? "",
        responseTime,
      };
      const statusList = JSON.parse(monitorData.statusCode!);
      const responseDurationTime = JSON.parse(monitorData.responseTime!);
      const contentTypeList =
        monitorData.contentType!.length > 0 ? JSON.parse(JSON.stringify(monitorData.contentType!)) : [];
      if (
        !statusList.includes(response.status) ||
        responseDurationTime < responseTime ||
        (contentTypeList.length > 0 && !contentTypeList.includes(response.headers["content-type"]))
      ) {
        heartbeatData = {
          ...heartbeatData,
          status: 1,
          message: "Failed http assertion",
        };
        this.errorAssertionCheck(monitorData, heartbeatData);
      } else {
        this.successAssertionCheck(monitorData, heartbeatData);
      }
    } catch (error) {
      console.log(error);
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
  async successAssertionCheck(monitorData: IMonitorDocument, heartbeatData: IHeartbeat): Promise<void> {
    await Promise.all([
      updateMonitorStatus(monitorData, heartbeatData.timestamp, "success"),
      createHttpHeartBeat(heartbeatData),
    ]);
    if (!this.noSuccessAlert) {
      this.errorCount = 0;
      this.noSuccessAlert = true;
      // TODO: send success to email
    }
    logger.info(`HTTP heartbeat success Monitor ID ${monitorData.id}`);
  }
  async httpError(monitorId: number, startTime: number, monitorData: IMonitorDocument, error: any): Promise<void> {
    logger.info(`HTTP heart beatfailed: Monitor ID${monitorId}`);
    this.errorCount += 1;
    const timestamp = dayjs.utc().valueOf();
    let heartbeatData: IHeartbeat = {
      monitorId: monitorId!,
      status: 1,
      code: error.response ? error.response.status : 500,
      message: error.response ? `${error.response.status} - ${error.response.statusText}` : "Http monitor error.",
      timestamp,
      reqHeaders: error.response ? JSON.stringify(error.response.headers) : "",
      resHeaders: error.response ? JSON.stringify(error.response.request.res.rawHeaders) : "",
      reqBody: "",
      resBody: error.response ? JSON.stringify(error.response.data) : "",
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
