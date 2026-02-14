import axios from 'axios';

type Primitive = string | number | boolean | null | undefined | Date;

type DownloadCSVOptions<Type extends Record<string, Primitive>> = {
  data: Type[];
  filename?: string;
  headers?: Partial<Record<keyof Type, string>>;
};

const downloadCSV = <Type extends Record<string, Primitive>>({
  data,
  filename = `${new Date().toISOString().split('Type')[0]}.csv`,
  headers,
}: DownloadCSVOptions<Type>) => {
  if (!data.length) return;

  const keys = headers ? (Object.keys(headers) as (keyof Type)[]) : (Object.keys(data[0]) as (keyof Type)[]);

  const csvContent = [
    keys.map(k => `"${headers?.[k] ?? String(k)}"`).join(','),
    ...data.map(row =>
      keys
        .map(k => {
          const value = row[k];
          const normalized = value instanceof Date ? value.toISOString() : value ?? '';
          return `"${String(normalized).replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: filename,
  });

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

interface CSVActionProps<Type> {
  url: string;
  headers?: Record<string, string>;
  filename?: string;
  paramsBuilder?: (query: any) => any;
  mapFn: (item: Type) => Record<string, Primitive>;
  csvHeaders?: Record<string, string>;
}

export const ExportCSV = <Type>({
  url,
  headers,
  filename,
  paramsBuilder,
  mapFn,
  csvHeaders,
}: CSVActionProps<Type>) => async (query: any) => {
  try {
    const { data: resData } = await axios.get(url, {
      headers,
      params: paramsBuilder?.(query),
    });

    const dataArray = Array.isArray(resData) ? resData : [];
    if (!dataArray.length) return alert('No data available');

    downloadCSV({
      data: dataArray.map(mapFn),
      filename,
      headers: csvHeaders,
    });
  } catch (error) {
    console.error('CSV Download failed', error);
  }
};
