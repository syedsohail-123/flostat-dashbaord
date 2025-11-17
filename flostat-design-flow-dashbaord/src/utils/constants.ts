// constants.ts

// ---------- Roles ----------
export const roles = {
  SUPER_ADMIN: "root",
  ADMIN: "admin",
  CONTROLLER: "controller",
  GUEST: "guest",
} as const;

export type Role = typeof roles[keyof typeof roles];

export const giveRoles = ["admin", "controller", "guest"] as const;
export type GiveRole = typeof giveRoles[number];

// ---------- Role Status ----------
export const roleStatus = {
  PENDING: "pending",
  ACTIVE: "active",
  DEACTIVE: "deactive",
} as const;

export type RoleStatus = typeof roleStatus[keyof typeof roleStatus];

// ---------- Device Types ----------
export const deviceType = ["pump", "sump", "tank", "valve"] as const;
export type DeviceType = typeof deviceType[number];

export const DEVICE_TYPE = {
  PUMP: "pump",
  SUMP: "sump",
  VALVE: "valve",
  TANK: "tank",
} as const;

export type DeviceTypeObj = typeof DEVICE_TYPE[keyof typeof DEVICE_TYPE];

// ---------- Hardware Status ----------
export const HARDWARE_STATUS = {
  CONNECTED: "connected",
  DISCONNECTED: "disconnected",
} as const;

export type HardwareStatus = typeof HARDWARE_STATUS[keyof typeof HARDWARE_STATUS];

// ---------- Pump & Valve Status ----------
export const PUMP_STATUS = {
  ON: "ON",
  OFF: "OFF",
} as const;

export type PumpStatus = typeof PUMP_STATUS[keyof typeof PUMP_STATUS];

export const VALVE_STATUS = {
  OPEN: "OPEN",
  CLOSE: "CLOSE",
} as const;

export type ValveStatus = typeof VALVE_STATUS[keyof typeof VALVE_STATUS];

// ---------- WebSocket Config ----------
export const AWS_REGION = import.meta.env.VITE_APP_AWS_REGION!;
export const IDENTITY_POOL = import.meta.env.VITE_APP_COGNITO_IDENTITY_POOL_ID!;
export const IOT_ENDPOINT = import.meta.env.VITE_APP_IOT_ENDPOINT!;
// export const BASE_URL_LAMBDA = process.env.VITE_APP_BASE_URL_LAMBDA!;

export const DEFAULT_TOPICS = ["pump/status"] as const;

// ---------- Backoff / Retry ----------
export const BASE_RECONNECT_MS = 1000;
export const MAX_RECONNECT_MS = 30000;
export const KEEPALIVE_SEC = 60;

export const REFRESH_COOLDOWN_MS = 60_000;

// ---------- Modes ----------
export const MODE = {
  MANUAL: "manual",
  AUTO: "auto",
} as const;

export type Mode = typeof MODE[keyof typeof MODE];

// ---------- Schedule Status ----------
export const SCHEDULE_PENDING_STATUS = {
  CREATING: "CREATING",
  UPDATING: "UPDATING",
  DELETING: "DELETING",
} as const;

export type SchedulePendingStatus =
  typeof SCHEDULE_PENDING_STATUS[keyof typeof SCHEDULE_PENDING_STATUS];

export const SCHEDULE_COMPLETED_STATUS = {
  CREATED: "CREATED",
  UPDATED: "UPDATED",
  DELETED: "DELETED",
} as const;

export type ScheduleCompletedStatus =
  typeof SCHEDULE_COMPLETED_STATUS[keyof typeof SCHEDULE_COMPLETED_STATUS];

export const SCHEDULE_STATUS_MAP: Record<
  SchedulePendingStatus | ScheduleCompletedStatus,
  ScheduleCompletedStatus
> = {
  [SCHEDULE_PENDING_STATUS.CREATING]: SCHEDULE_COMPLETED_STATUS.CREATED,
  [SCHEDULE_COMPLETED_STATUS.CREATED]: SCHEDULE_COMPLETED_STATUS.CREATED,

  [SCHEDULE_PENDING_STATUS.UPDATING]: SCHEDULE_COMPLETED_STATUS.UPDATED,
  [SCHEDULE_COMPLETED_STATUS.UPDATED]: SCHEDULE_COMPLETED_STATUS.UPDATED,

  [SCHEDULE_PENDING_STATUS.DELETING]: SCHEDULE_COMPLETED_STATUS.DELETED,
  [SCHEDULE_COMPLETED_STATUS.DELETED]: SCHEDULE_COMPLETED_STATUS.DELETED,
};

// ---------- User Device ----------
export const USER_DEVICE = {
  MOBILE: "mobile",
  LAPTOP: "laptop",
  DESKTOP: "desktop",
} as const;

export type UserDevice = typeof USER_DEVICE[keyof typeof USER_DEVICE];
