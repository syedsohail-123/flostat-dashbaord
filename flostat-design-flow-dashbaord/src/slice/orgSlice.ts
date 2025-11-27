// slice/orgSlice.ts
import { Block } from "@/components/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OrgState {
  orgUsers: any[] | null;
  org_id: string | null;
  blockModes: Record<string, string>;
  blocksName: Record<string, string>;
  blocks: any[];
  topics: string[];
  currentBlock: any;
  logs: any[];
}

const initialState: OrgState = {
  orgUsers: null,
  org_id: null,
  blockModes: {},
  blocksName:{},
  topics:[],
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
      setTopics: (state, action: PayloadAction<string[]>) => {
      state.topics = action.payload;
    },
    setBlocks: (state, action: PayloadAction<any[]>) => {
      state.blocks = action.payload;
    },
    resetCurrentOrg:(state) =>{
        state.orgUsers=null;
        state.org_id= null;
        state.blockModes= {};
        state.blocksName={};
        state.topics=[];
        state.blocks=[];
        state.currentBlock= null;
        state.logs= [];
        localStorage.removeItem('currentOrganization');
    }
  },
});

export const {
  setOrgId,
  setLogs,
  addLog,
  setTopics,
  setOrgUsers,
  setBlockMode,
  setBlocksName,
  setCurrentBlock,
  resetCurrentOrg,
  setBlocks,
} = orgSlice.actions;

export default orgSlice.reducer;
