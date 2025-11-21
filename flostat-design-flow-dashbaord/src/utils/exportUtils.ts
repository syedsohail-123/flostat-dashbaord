import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable, { UserOptions } from "jspdf-autotable";

/**
 * Generic record type for row objects
 */
export type RowData = Record<string, any>;

/**
 * Export JSON data to Excel (.xlsx)
 */
export const exportToExcel = (
  data: RowData[],
  filename: string = "data.xlsx"
): void => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, filename);
};

/**
 * Export JSON data to CSV (.csv)
 */
export const exportToCSV = (
  data: RowData[],
  filename: string = "data.csv"
): void => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  saveAs(blob, filename);
};

/**
 * Export JSON data to PDF (.pdf)
 */
export const exportToPDF = (
  data: RowData[],
  filename: string = "data.pdf",
  title: string = "Device Data"
): void => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(title, 14, 15);

  // Ensure data is not empty
  if (!data.length) {
    doc.text("No data available", 14, 25);
    doc.save(filename);
    return;
  }

  const columns = Object.keys(data[0]);
  const rows = data.map((row) => Object.values(row));

  const tableOptions: UserOptions = {
    head: [columns],
    body: rows,
    startY: 25,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    styles: { fontSize: 10 },
  };

  autoTable(doc, tableOptions);

  doc.save(filename);
};
