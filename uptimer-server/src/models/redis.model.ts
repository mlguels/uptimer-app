import { IHeartbeat } from "@app/interfaces/heartbeat.interface";
import { sequelize } from "@app/server/database";
import { DataTypes, ModelDefined, Optional } from "sequelize";

type RedisAttributes = Optional<IHeartbeat, "id">;

const RedisModel: ModelDefined<IHeartbeat, RedisAttributes> = sequelize.define(
  "redis_heartbeats",
  {
    monitorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    code: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    message: {
      type: DataTypes.STRING,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    responseTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    connection: {
      type: DataTypes.STRING,
    },
  },
  {
    indexes: [
      {
        unique: false,
        fields: ["monitorId"],
      },
    ],
  }
) as ModelDefined<IHeartbeat, RedisAttributes>;

export { RedisModel };