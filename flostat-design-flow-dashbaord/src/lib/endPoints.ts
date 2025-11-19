// src/httpClient/endpoints.ts
const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const BASE_URL = BASE+"/api/v1";

export const authEndpoints = {
  SEND_OTP_API: `${BASE_URL}/auth/sendOtp`,
  VERIFY_OTP_API: `${BASE_URL}/auth/verifyOtp`,
  LOGIN_API: `${BASE_URL}/auth/login`,
  SIGN_UP_API: `${BASE_URL}/auth/signUp`,
  GOOGLE_OUTH_API: `${BASE_URL}/auth/googleOuth`,
};

export const orgEndpoints = {
  CREATE_ORG: `${BASE_URL}/org`,
  UPDATE_ORG: `${BASE_URL}/org/:org_id`,
  DELETE_ORG: `${BASE_URL}/org/:org_id`,
  GET_SINGLE_ORG: `${BASE_URL}/org/:org_id`,
  GET_ALL_USERS_FOR_ORG: `${BASE_URL}/org/:org_id/users`,
  GET_ORG_TOPICS: `${BASE_URL}/org/:org_id/getOrgTopics`,
  LOGS_ORG_TOPICS: `${BASE_URL}/org/logs`,
  CREATE_SCHEDULES: `${BASE_URL}/org/createSchedule`,
  UPDATE_SCHEDULES: `${BASE_URL}/org/updateSchedule`,
  DELETE_SCHEDULES: `${BASE_URL}/org/deleteSchedule`,
  GET_SCHEDULES_BY_ORG_ID: `${BASE_URL}/org/getScheduleByOrgId`,
  GET_SCHEDULES_BY_ID: `${BASE_URL}/org/getScheduleById`,
  UPDATE_ORG_THRESHOLD: `${BASE_URL}/org/updateOrgThreshold`,
};

export const userEndpoints = {
  GET_ALL_ORG_OF_USER: `${BASE_URL}/user/getOrgsUser`,
  INVITE_USER_API: `${BASE_URL}/user/inviteUser`,
  ACCEPT_INVITE_API: `${BASE_URL}/user/acceptInvite`,
  UPDATE_ACCESS_API: `${BASE_URL}/user/updateAccess`,
  REMORE_USER_API: `${BASE_URL}/user/removeUser`,
  REGISTER_FCM_API: `${BASE_URL}/user/register-fcm`,
};

export const reportEndpoints = {
  TANK_RELATED_REPORT: `${BASE_URL}/report/tankRelatedReport`,
};

export const deviceEndpoints = {
  DEVICE_CREATE: `${BASE_URL}/device/create`,
  DEVICE_UPDATE: `${BASE_URL}/device/updateDevice`,
  DEVICE_DELETE: `${BASE_URL}/device/deleteDevice`,
  DEVICE_REGISTER: `${BASE_URL}/device/register`,
  GET_ORG_ALL_DEVICE: `${BASE_URL}/device/getOrgDevices`,
  GET_DEVICE_PARENTS_API: `${BASE_URL}/device/getDeviceParents`,
  UPDATE_BLOCK_API: `${BASE_URL}/device/block/updateBlock`,
  CREATE_BLOCK_API: `${BASE_URL}/device/block/createBlock`,
  DELETE_BLOCK_API: `${BASE_URL}/device/block/deleteBlock`,
  GET_BLOCK_BY_ID: `${BASE_URL}/device/block/getBlockById`,
  GET_BLOCKS_OF_ORGID: `${BASE_URL}/device/block/getBlocksOfOrgId`,
  GET_DEVICE_WITH_STATUS: `${BASE_URL}/device/getDeviceWithStatus/:org_id`,
  UPDATE_DEVICE_STATUS: `${BASE_URL}/device/updateDeviceStatus`,
  UPDATE_THRESHOLD: `${BASE_URL}/device/updateThreshold`,
  UPDATE_BLOCK_THRESHOLD: `${BASE_URL}/device/block/updateBlockThreshold`,
  GET_BLOCK_MODE: `${BASE_URL}/device/block/getBlockMode`,
  CHANGE_BLOCK_MODE: `${BASE_URL}/device/block/changeMode`,
  GET_BLOCK_VALVE: `${BASE_URL}/device/getBlockValve`,
  GET_TANK_OF_ORG: `${BASE_URL}/device/getTanksOfOrg`,
};

export const querySupportEndpoints = {
  CREATE_QUERY_API: `${BASE_URL}/user/createQuery`,
  UPDATE_QUERY_API: `${BASE_URL}/user/updateQuery`,
  DELETE_QUERY_API: `${BASE_URL}/user/deleteQuery`,
  GET_QUERY_API: `${BASE_URL}/user/getQuery`,
  GET_ALL_ORG_QUERY_API: `${BASE_URL}/user/getAllOrgQuery`,
  CUSTOMER_SUPPORT_CHAT_API: `${BASE_URL}/user/customerSupportChat`,
};
