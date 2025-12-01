import { AppSidebarProps } from "@/components/types/types";
import React, { useEffect } from "react";
import Dashboard from "./Dashboard";
import Devices from "./Devices";
import Users from "./Users";
import Schedule from "./Schedule";
import ScheduleList from "./ScheduleList";
import Logs from "./Logs";
import Reports from "./Reports";
import Support from "./Support";
import OCR from "./OCR";
import SCADA from "./SCADA";
import { useDispatch, useSelector } from "react-redux";
import { getOrgTopics } from "@/lib/operations/orgApis";
import { RootState } from "@/store";

import { toast } from "sonner";
import CustomerService from "./CustomerSupport";
import Settings from "./Settings";
import { setTopics } from "@/slice/orgSlice";


const FlostatDashboard = ({ components }) => {
  const dispatch = useDispatch();
  console.log("IN FLOSTAT dashboard: ", components)
  const org_id = useSelector((state: RootState) => state.org.org_id);
  const token = useSelector((state: RootState) => state.auth.token);
  // fetch topics of the org
  useEffect(() => {
    const fetchTopicsOfOrg = async (org_id) => {
      const result = await getOrgTopics(org_id, token);
      console.log("Result topic fetch : ", result);
      if (result) {
        dispatch(setTopics(result));
      }
    }
    if (org_id && token) {
      fetchTopicsOfOrg(org_id);
    }
  }, [org_id])
  return (
    <div>
      {components === "dashboard" && <Dashboard />},
      {components === "devices" && <Devices />},
      {components === "users" && <Users />},
      {components === "schedule" && <ScheduleList />},
      {components === "logs" && <Logs />},
      {components === "reports" && <Reports />},
      {components === "support" && <Support />},
      {components === "ocr" && <OCR />},
      {components === "scada" && <SCADA />},
      {components === "customer-support" && <CustomerService />},
      {components === "setting" && <Settings />},

    </div>
  );
};

export default FlostatDashboard;
