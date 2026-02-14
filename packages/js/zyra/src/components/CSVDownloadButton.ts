import axios from 'axios';

type Primitive = string | number | boolean | null | undefined | Date;

type DownloadCSVOptions<Type extends Record<string, Primitive>> = {
  data: Type[];
  filename?: string;
  headers?: Partial<Record<keyof Type, string>>;
};

const downloadCSV = <Type extends Record<string, Primitive>>({
  data,
  filename = new Date().toISOString().split('T')[0] + '.csv',
  headers,
}: DownloadCSVOptions<Type>) => {
  const keys = headers
    ? (Object.keys(headers) as (keyof Type)[])
    : (Object.keys(data[0]) as (keyof Type)[]);

  const rows: string[] = [];

  rows.push(
    keys.map(k => `"${headers?.[k] ?? String(k)}"`).join(',')
  );

  data.forEach(row => {
    rows.push(
      keys
        .map(k => {
          const v = row[k];
          const normalized =
            v instanceof Date ? v.toISOString() : v ?? '';
          return `"${String(normalized).replace(/"/g, '""')}"`;
        })
        .join(',')
    );
  });

  const blob = new Blob([rows.join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * THIS is what you use in buttonActions
 */
interface CSVActionProps<Type> {
  url: string;
  headers?: Record<string, string>;
  filename?: string;

  paramsBuilder?: (query: any) => any;
  mapFn: (item: Type) => Record<string, Primitive>;
  csvHeaders?: Record<string, string>;
}

export function ExportCSV<Type>({
  url,
  headers,
  filename,
  paramsBuilder,
  mapFn,
  csvHeaders,
}: CSVActionProps<Type>) {
  return async (query: any) => {
    try {
      const res = await axios.get(url, {
        headers,
        params: paramsBuilder?.(query),
      });

      const data = Array.isArray(res.data) ? res.data : [];

      if (!data.length) {
        alert('No data available');
        return;
      }

      const csvData = data.map(mapFn);

      downloadCSV({
        data: csvData,
        filename,
        headers: csvHeaders,
      });

    } catch (e) {
      console.error('CSV Download failed', e);
    }
  };
}
