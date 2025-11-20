// slice/deviceSlice.ts
import { Device } from "@/components/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface DeviceState {
  devices: Device[];
  devicesObject: Record<string, string>;
}

const initialState: DeviceState = {
  devices: [],
  devicesObject: {},
};

const deviceSlice = createSlice({
  name: "device",
  initialState,
  reducers: {
    setDevicesObject: (state, action: PayloadAction<Device[]>) => {
      state.devicesObject = {};
      action.payload.forEach((device) => {
        state.devicesObject[device.device_id] = device.device_name ?? "";
      });
    },

    setDevices: (state, action: PayloadAction<Device[]>) => {
      state.devices = action.payload;
    },

    updateDevice: (state, action: PayloadAction<Device>) => {
      const updated = action.payload;
      state.devices = state.devices.map((d) =>
        d.device_id === updated.device_id ? { ...d, ...updated } : d
      );
    },

    updateDeviceStatus: (
      state,
      action: PayloadAction<{
        device_id: string;
        current_level?: number;
        device_type?: string;
        [key: string]: any;
      }>
    ) => {
      const { device_id, current_level, device_type, ...rest } = action.payload;

      state.devices = state.devices.map((d) => {
        if (d.device_id !== device_id) return d;

        return {
          ...d,
          ...rest,
          ...(current_level !== undefined &&
            (device_type === "tank" || device_type === "sump") && {
              status: current_level,
            }),
        };
      });
    },

    updateDevicethreshold: (
      state,
      action: PayloadAction<{
        updatedDevices: {
          device_id: string;
          min_threshold?: number | null;
          max_threshold?: number | null;
        }[];
      }>
    ) => {
      action.payload.updatedDevices.forEach((update) => {
        const device = state.devices.find((d) => d.device_id === update.device_id);
        if (device) {
          if (update.min_threshold !== undefined && update.min_threshold !== null) {
            device.min_threshold = update.min_threshold;
          }
          if (update.max_threshold !== undefined && update.max_threshold !== null) {
            device.max_threshold = update.max_threshold;
          }
        }
      });
    },
  },
});

export const {
  setDevices,
  setDevicesObject,
  updateDevice,
  updateDeviceStatus,
  updateDevicethreshold,
} = deviceSlice.actions;

export default deviceSlice.reducer;
