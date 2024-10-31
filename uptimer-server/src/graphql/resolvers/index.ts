import { HeartbeatResolver } from "./heartbeats";
import { MonitorResolver } from "./monitor";
import { NotificationResolver } from "./notification";
import { UserResolver } from "./user";

export const resolvers = [UserResolver, NotificationResolver, MonitorResolver, HeartbeatResolver];
