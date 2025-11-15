import { ddbDocClient } from "../config/db.js";
import { createRepository } from "./BaseModel.js";

export const UserRepository = createRepository(
  process.env.USER_TABLE, // "Users"
  ddbDocClient
);

export const OtpRepository = createRepository(
  process.env.OTP_TABLE, // "OTP_TABLE"
  ddbDocClient
);

export const OrgRepository = createRepository(
  process.env.ORG_TABLE, // "ORG_TABLE"
  ddbDocClient
);

export const UserOrgRepository = createRepository(
  process.env.USER_ORG_ROLE, // "USER_ORG_ROLE"
  ddbDocClient
);

export const DeviceRepository = createRepository(
  process.env.DEVICE_TABLE, // "DEVICE_TABLE"
  ddbDocClient
);

export const DeviceTokenRepository = createRepository(
  process.env.DEVICE_TOKEN_TABLE, // "DEVICE_TOKEN_TABLE"
  ddbDocClient
);

export const BlockRepository = createRepository(
  process.env.BLOCK_TABLE, // "BLOCK_TABLE"
  ddbDocClient
);

export const DeviceStatusRepository = createRepository(
  process.env.DEVICE_STATUS_TABLE, // "DEVICE_STATUS_TABLE"
  ddbDocClient
);

export const LogsTableRepository = createRepository(
  process.env.LOGS_TABLE, // "LOGS_TABLE"
  ddbDocClient
);

export const ScheduleRepository = createRepository(
  process.env.VALVE_SCHEDULES, // "VALVE_SCHEDULES"
  ddbDocClient
);

export const CustomerQueryRepository = createRepository(
  process.env.CUSTOMER_QUERY, // "CUSTOMER_QUERY"
  ddbDocClient
);
// export const ProductRepository = createRepository(
//   process.env.PRODUCT_TABLE, // "Products"
//   ddbDocClient
// );