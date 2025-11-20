import { inviteUser, removeUser, updateAccess } from "@/lib/operations/userApis";
import { setOrgUsers } from "@/slice/orgSlice";
import { RootState } from "@/store";
import { giveRoles } from "@/utils/constants";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

// ------------- TYPES -------------
export interface CreateUserModalProps {
  setUserModel: (open: boolean) => void;
  mode?: "add" | "remove" | "update";
  user?: {
    email?: string;
    role?: string;
  } | null;
}

// ------------- COMPONENT -------------
const CreateUserModal: React.FC<CreateUserModalProps> = ({
  setUserModel,
  mode = "add",
  user = null,
}) => {
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<string>("");

  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);
  const { org_id } = useSelector((state: RootState) => state.org);

  // Pre-fill values when updating/removing
  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setRole(user.role || "");
    } else {
      setEmail("");
      setRole("");
    }
  }, [user, mode]);

  const handleAction = async () => {
    try {
      if (mode === "add") {
        if (!email.trim()) return toast.error("Email is required");
        if (!role.trim()) return toast.error("Please choose a role");

        const result = await inviteUser(email, org_id, role, token);
        if (result) {
          dispatch(setOrgUsers(result));
          toast.success("User invited successfully!");
        }
      }

      if (mode === "remove") {
        if (!email.trim()) return toast.error("Email missing");

        const result = await removeUser(email, org_id, role, token);
        if (result) {
          dispatch(setOrgUsers(result));
          toast.success("User removed successfully!");
        }
      }

      if (mode === "update") {
        if (!email.trim()) return toast.error("Email missing");
        if (!role.trim()) return toast.error("Please choose a valid role");

        const result = await updateAccess(email, org_id, role, token);
        if (result) {
          dispatch(setOrgUsers(result));
          toast.success("User updated successfully!");
        }
      }

      setUserModel(false);
    } catch (err) {
      console.error(err);
      toast.error("Operation failed");
    }
  };

  return (
    <div className="!mt-0 z-[100] h-screen w-screen overflow-auto grid place-items-center fixed inset-0 backdrop-blur-sm bg-black bg-opacity-40">
      <div className="my-5 sm:my-10 w-11/12 sm:max-w-[600px] rounded-2xl border border-slate-200 bg-white shadow-lg p-6 relative">

        {/* Close button */}
        <button
          onClick={() => setUserModel(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold mb-4">
          {mode === "add" && "Invite user to org"}
          {mode === "remove" && "Remove user from org"}
          {mode === "update" && "Update user details"}
        </h2>

        {/* Role Selector */}
        {(mode === "add" || mode === "update") && (
          <>
            <label className="block mb-2 text-sm font-medium">Choose Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4"
            >
              <option value="" disabled>Choose role</option>
              {giveRoles.map((r, idx) => (
                <option key={idx} value={r}>{r}</option>
              ))}
            </select>
          </>
        )}

        {/* Email Input */}
        {mode === "add" && (
          <>
            <label className="block mb-2 text-sm font-medium">User Email</label>
            <input
              type="email"
              placeholder="Enter user email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4"
            />
          </>
        )}

        {(mode === "update" || mode === "remove") && (
          <>
            <label className="block mb-2 text-sm font-medium">User Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full border rounded-lg px-3 py-2 mb-4 bg-gray-100"
            />
          </>
        )}

        {/* Button */}
        <button
          onClick={handleAction}
          className={`w-full py-2 rounded-lg text-white ${
            mode === "add"
              ? "bg-blue-600 hover:bg-blue-700"
              : mode === "remove"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {mode === "add" && "Send Invite"}
          {mode === "remove" && "Remove User"}
          {mode === "update" && "Update User"}
        </button>

      </div>
    </div>
  );
};

export default CreateUserModal;
