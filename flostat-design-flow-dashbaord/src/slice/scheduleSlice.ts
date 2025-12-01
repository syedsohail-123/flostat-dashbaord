// slice/scheduleSlice.ts
import { Schedule } from "@/components/types/types";
import { SCHEDULE_STATUS_MAP } from "@/utils/constants";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface ScheduleState {
  schedules: Schedule[];
}

const initialState: ScheduleState = {
  schedules: [],
};

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    setSchedules: (state, action: PayloadAction<Schedule[]>) => {
      state.schedules = action.payload;
    },

    addSchedule: (state, action: PayloadAction<Schedule>) => {
      state.schedules.push(action.payload);
    },

    ackScheduleCreate: (
      state,
      action: PayloadAction<{
        schedule_id: string;
        device_type: string;
        ack: boolean;
        schedule_status?: string;
        [key: string]: any;
      }>
    ) => {
      const { schedule_id, device_type, ack, schedule_status, ...rest } =
        action.payload;

      let schedule = state.schedules.find(
        (s) => s.schedule_id === schedule_id
      );

      if (!schedule) {
        schedule = {
          schedule_id,
          schedule_status,
          ...rest,
          pump_ack: rest.pump_ack ?? false,
          valve_ack: rest.valve_ack ?? false,
        };
        state.schedules.push(schedule);
      }

      if (ack) {
        if (device_type === "valve") schedule.valve_ack = true;
        if (device_type === "pump") schedule.pump_ack = true;
        schedule.schedule_status = schedule_status;
        if(schedule.valve_ack && schedule.pump_ack){
          schedule.schedule_status= SCHEDULE_STATUS_MAP[schedule_status];
        }
      }
    },

    ackScheduleDelete: (
      state,
      action: PayloadAction<{
        schedule_id: string;
        device_type: string;
        ack: boolean;
        schedule_status?: string;
      }>
    ) => {
      const { schedule_id, device_type, ack, schedule_status } = action.payload;

      const index = state.schedules.findIndex(
        (s) => s.schedule_id === schedule_id
      );
      if (index === -1) return;

      const schedule = state.schedules[index];

      if (ack) {
        if (device_type === "valve") schedule.valve_ack = true;
        if (device_type === "pump") schedule.pump_ack = true;
        
        schedule.schedule_status = schedule_status;

        if (schedule.pump_ack && schedule.valve_ack) {
          state.schedules.splice(index, 1);
        }
      }
    },

    ackScheduleUpdate: (
      state,
      action: PayloadAction<{
        schedule_id: string;
        device_type: string;
        ack: boolean;
        start_time: string;
        end_time: string;
        schedule_status?: string;
      }>
    ) => {
      const {
        schedule_id,
        device_type,
        ack,
        start_time,
        end_time,
        schedule_status,
      } = action.payload;

      const schedule = state.schedules.find(
        (s) => s.schedule_id === schedule_id
      );

      if (schedule && ack) {
        if (device_type === "valve") schedule.valve_ack = true;
        if (device_type === "pump") schedule.pump_ack = true;

        schedule.start_time = start_time;
        schedule.end_time = end_time;
        schedule.schedule_status = schedule_status;
        if(schedule.valve_ack && schedule.pump_ack){
          schedule.schedule_status= SCHEDULE_STATUS_MAP[schedule_status];
        }
      }
    },

    scheduleUpdate: (state, action: PayloadAction<Schedule>) => {
      const index = state.schedules.findIndex(
        (s) => s.schedule_id === action.payload.schedule_id
      );
      if (index >= 0) state.schedules[index] = action.payload;
    },

    scheduleDelete: (state, action: PayloadAction<string>) => {
      state.schedules = state.schedules.filter(
        (s) => s.schedule_id !== action.payload
      );
    },
  },
});

export const {
  setSchedules,
  ackScheduleCreate,
  ackScheduleDelete,
  ackScheduleUpdate,
  addSchedule,
  scheduleDelete,
  scheduleUpdate,
} = scheduleSlice.actions;

export default scheduleSlice.reducer;
