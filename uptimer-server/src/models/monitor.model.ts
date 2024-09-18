import { DataTypes, ModelDefined, Optional } from "sequelize";

import { IMonitorDocument } from "@app/interfaces/monitor.interface";
import { sequelize } from "@app/server/database";

type MonitorAttributes = Optional<IMonitorDocument, "id">;

const MonitorModel: ModelDefined<IMonitorDocument, MonitorAttributes> = sequelize.define("monitors", {
  notificationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  status: {
    type: DataTypes.SMALLINT,
    allowNull: false,
  },
  frequency: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30,
  },
  alertThreshold: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  url: {
    type: DataTypes.STRING,
  },
}) as ModelDefined<IMonitorDocument, MonitorAttributes>;

export { MonitorModel };
