import React, { useEffect } from 'react';

interface CSVDownloadProps {
  headers: Record<string, any>; 
  rows: Record<string, any>[];
  filename?: string;
}

const CSVDownload: React.FC<CSVDownloadProps> = ({
  headers,
  rows,
  filename = 'export.csv',
}) => {
  const generateCSV = () => {
    const csvRows: string[] = [];

    // Prepare CSV columns from headers
    const csvColumns = Object.entries(headers)
      .filter(([_, h]) => !h.csv?.skip)
      .map(([key, h]) => ({
        label: h.label,
        keys: h.csv?.keys || (h.csv?.key ? [h.csv.key] : [key]),
        joinWith: h.csv?.joinWith || ', ',
      }));

    // Header row
    csvRows.push(csvColumns.map(c => `"${c.label}"`).join(','));

    // Data rows
    rows.forEach(row => {
      const rowData = csvColumns
        .map(col =>
          `"${col.keys
            .map(k => (row[k] != null ? row[k] : ''))
            .join(col.joinWith)}"`
        )
        .join(',');
      csvRows.push(rowData);
    });

    return csvRows.join('\n');
  };

  const triggerDownload = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Auto-download when component mounts or rows/headers change
  useEffect(() => {
    if (rows.length > 0) {
      triggerDownload();
    }
  }, [rows, headers]);

  return null; // no button
};

export default CSVDownload;
