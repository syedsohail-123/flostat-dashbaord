// store.ts
import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";

import authReducer from "./slice/authSlice";
import orgReducer, { resetCurrentOrg, setTopics } from "./slice/orgSlice";
import userReducer from "./slice/userSlice";
import deviceReducer from "./slice/deviceSlice";
import scheduleReducer from "./slice/scheduleSlice";
import webSocketReducer from "./slice/webSocketSlice";
import { subscribe, unsubscribeAll } from "./utils/webSocketService";

const listenerMiddleware = createListenerMiddleware();

// Topic subscription listener
listenerMiddleware.startListening({
  actionCreator: setTopics,
  effect: async (action) => {
    console.log("SUB to topics:", action.payload);

    action.payload.forEach((topic: string) => {
      subscribe(topic);
    });
  },
});

listenerMiddleware.startListening({
  actionCreator: resetCurrentOrg,
  effect: async (action) => {
    console.log("All unsubscribe:", action.payload);
    unsubscribeAll(); 
  },
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    org: orgReducer,
    websocket: webSocketReducer,
    schedule: scheduleReducer,
    device: deviceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(listenerMiddleware.middleware),
});

// Types for Typed Hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
