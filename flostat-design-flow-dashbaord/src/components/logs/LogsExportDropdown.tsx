import { exportToCSV, exportToExcel, exportToPDF } from "@/utils/exportUtils";
import React, { useState, useRef, useEffect } from "react";


interface LogsExportDropdownProps {
  data: any[]; // <-- You can replace this with a stronger type if you know the shape
}

const LogsExportDropdown: React.FC<LogsExportDropdownProps> = ({ data }) => {
  const [open, setOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2  text-white rounded-lg"
      >
        Download
      </button>

      {open && (
        <div className="absolute mt-2 -ml-5 w-40 bg-white text-black border rounded-lg shadow-lg z-50">
          <button
            onClick={() => {
              exportToExcel(data, "devices.xlsx");
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            📗 Excel
          </button>

          <button
            onClick={() => {
              exportToCSV(data, "devices.csv");
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            📄 CSV
          </button>

          <button
            onClick={() => {
              exportToPDF(data, "devices.pdf", "Device List");
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            📘 PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default LogsExportDropdown;
