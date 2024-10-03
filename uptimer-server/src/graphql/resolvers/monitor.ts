import { AppContext, IMonitorArgs, IMonitorDocument } from "@app/interfaces/monitor.interface";
import logger from "@app/server/logger";
import { createMonitor } from "@app/services/monitor.service";
import { authenticateGraphQLRoute } from "@app/utils/utils";

export const MonitorResolver = {
  Mutation: {
    async createMonitor(_: undefined, args: IMonitorArgs, contextValue: AppContext) {
      const { req } = contextValue;
      authenticateGraphQLRoute(req);

      const body: IMonitorDocument = args.monitor!;
      const monitor: IMonitorDocument = await createMonitor(body);

      if (body.active && monitor?.active) {
        // TODO: start created monitor
        logger.info("Start new monitor");
      }

      return {
        monitors: [monitor],
      };
    },
  },
};
