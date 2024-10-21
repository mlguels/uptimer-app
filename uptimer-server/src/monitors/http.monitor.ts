import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

// import { IEmailLocals } from "@app/interfaces/notification.interface";

import { IMonitorDocument } from "@app/interfaces/monitor.interface";
import { getMonitorById } from "@app/services/monitor.service";
import { encodeBase64 } from "@app/utils/utils";
import { IHeartbeat } from "@app/interfaces/heartbeat.interface";
import dayjs from "dayjs";

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
      };
      const response: AxiosResponse = await axios.request(options);
      const responseTime = Date.now() - startTime;
      const heartbeatdata: IHeartbeat = {
        monitorId: monitorId!,
        status: 0,
        code: response.status ?? 0,
        message: `${response.status} - ${response.statusText}` ?? "Http monitor check successful.",
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
        // throw an error
      } else {
        // success assertion
      }
    } catch (error) {}
  }
}

export const httpMonitor: HttpMonitor = new HttpMonitor();
