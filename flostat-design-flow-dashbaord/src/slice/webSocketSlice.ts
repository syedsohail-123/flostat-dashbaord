// slice/webSocketSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DisconnectEvent {
  disconnectTime: string;
  duration: number;
}

interface WebSocketState {
  status: string;
  pumpMessage: string;
  disconnectEvents: DisconnectEvent[];
  devices: any[];
  deviceStatus: Record<string, any>;
  topics: string[];
  error: string | null;
}

const initialState: WebSocketState = {
  status: "connecting",
  pumpMessage: "",
  disconnectEvents: [],
  devices: [],
  deviceStatus: {},
  topics: [],
  error: null,
};

const webSocketSlice = createSlice({
  name: "websocket",
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<string>) => {
      state.status = action.payload;
    },

    setPumpMessage: (state, action: PayloadAction<string>) => {
      state.pumpMessage = action.payload;
    },

    addDisconnectEvent: (state, action: PayloadAction<DisconnectEvent>) => {
      state.disconnectEvents.unshift(action.payload);
    },

    setTopics: (state, action: PayloadAction<string[]>) => {
      state.topics = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    setDevices: (state, action: PayloadAction<any[]>) => {
      state.devices = action.payload;
    },

    setDevicesStatus: (
      state,
      action: PayloadAction<{ device: string; status: any }>
    ) => {
      state.deviceStatus[action.payload.device] = action.payload.status;
    },

    resetWebSocket: (state) => {
      state.pumpMessage = "";
      state.disconnectEvents = [];
      state.devices = [];
      state.deviceStatus = {};
      state.topics = [];
      state.error = null;
    },
  },
});

export const {
  setStatus,
  setPumpMessage,
  addDisconnectEvent,
  setError,
  resetWebSocket,
  setDevices,
  setDevicesStatus,
  setTopics,
} = webSocketSlice.actions;

export default webSocketSlice.reducer;
