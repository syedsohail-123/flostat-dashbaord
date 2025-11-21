import { RootState } from "@/store";
import React, { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const token = useSelector((state: RootState) => state.auth.token);

  console.log("PR checked: ", token);

  if (token !== null && token !== undefined) {
    return <>{children}</>;
  } else {
    return <Navigate to="/signin" replace />;
  }
};

export default PrivateRoute;
