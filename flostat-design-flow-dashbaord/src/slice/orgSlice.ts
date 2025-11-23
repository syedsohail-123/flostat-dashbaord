// slice/orgSlice.ts
import { Block } from "@/components/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OrgState {
  orgUsers: any[] | null;
  org_id: string | null;
  blockModes: Record<string, string>;
  blocksName: Record<string, string>;
  blocks: any[];

  currentBlock: any;
  logs: any[];
}

const initialState: OrgState = {
  orgUsers: null,
  org_id: null,
  blockModes: {},
  blocksName:{},
  blocks: [],
  currentBlock: null,
  logs: [],
};

const orgSlice = createSlice({
  name: "org",
  initialState,
  reducers: {
    setOrgUsers: (state, action: PayloadAction<any[]>) => {
      state.orgUsers = action.payload;
    },
    setLogs: (state, action: PayloadAction<any[]>) => {
      state.logs = action.payload;
    },
    addLog: (state, action: PayloadAction<any>) => {
      state.logs = [action.payload, ...state.logs];
    },
    setOrgId: (state, action: PayloadAction<string | null>) => {
      state.org_id = action.payload;
    },
    setBlockMode: (
      state,
      action: PayloadAction<{ block_id: string; mode: string }>
    ) => {
      state.blockModes[action.payload.block_id] = action.payload.mode;
    },
    setBlocksName:( state, action: PayloadAction<Block[]>) =>{
      state.blocksName = {};
      action.payload.forEach((block)=>{
        state.blocksName[block.block_id]=block.block_name ?? "";
      });
    },
    setCurrentBlock: (state, action: PayloadAction<any>) => {
      state.currentBlock = action.payload;
    },
    setBlocks: (state, action: PayloadAction<any[]>) => {
      state.blocks = action.payload;
    },
  },
});

export const {
  setOrgId,
  setLogs,
  addLog,
  setOrgUsers,
  setBlockMode,
  setBlocksName,
  setCurrentBlock,
  setBlocks,
} = orgSlice.actions;

export default orgSlice.reducer;
