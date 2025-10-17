import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface QuotationExport {
  sl_number: number;
  date: string;
  client: string;
  item: string;
  source: string;
  status: string;
  quote_number: string | null;
  quoted_date: string | null;
  remarks: string | null;
}

export const exportToCSV = (data: QuotationExport[], filename: string) => {
  const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm-ss");
  const csvFilename = `${filename}_${timestamp}.csv`;

  // Define headers
  const headers = [
    "SL #",
    "Date",
    "Client",
    "Item",
    "Source",
    "Status",
    "Quote #",
    "Quoted Date",
    "Remarks",
  ];

  // Convert data to CSV rows
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      [
        row.sl_number,
        format(new Date(row.date), "dd MMM yyyy"),
        `"${row.client.replace(/"/g, '""')}"`,
        `"${row.item.replace(/"/g, '""')}"`,
        row.source,
        row.status,
        row.quote_number || "",
        row.quoted_date ? format(new Date(row.quoted_date), "dd MMM yyyy") : "",
        row.remarks ? `"${row.remarks.replace(/"/g, '""')}"` : "",
      ].join(",")
    ),
  ];

  // Create blob and download
  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", csvFilename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (data: QuotationExport[], filename: string) => {
  const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm-ss");
  const pdfFilename = `${filename}_${timestamp}.pdf`;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Add title
  doc.setFontSize(18);
  doc.text("Quotation Tracker Report", 14, 15);

  // Add generation timestamp
  doc.setFontSize(10);
  doc.text(`Generated: ${format(new Date(), "dd MMM yyyy, HH:mm")}`, 14, 22);
  doc.text(`Total Records: ${data.length}`, 14, 27);

  // Prepare table data
  const tableData = data.map((row) => [
    row.sl_number,
    format(new Date(row.date), "dd MMM yyyy"),
    row.client,
    row.item,
    row.source,
    row.status,
    row.quote_number || "-",
    row.quoted_date ? format(new Date(row.quoted_date), "dd MMM yyyy") : "-",
    row.remarks || "-",
  ]);

  // Generate table
  autoTable(doc, {
    head: [
      [
        "SL #",
        "Date",
        "Client",
        "Item",
        "Source",
        "Status",
        "Quote #",
        "Quoted Date",
        "Remarks",
      ],
    ],
    body: tableData,
    startY: 32,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 25 },
      2: { cellWidth: 40 },
      3: { cellWidth: 45 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 },
      6: { cellWidth: 25 },
      7: { cellWidth: 25 },
      8: { cellWidth: 45 },
    },
  });

  // Save the PDF
  doc.save(pdfFilename);
};
