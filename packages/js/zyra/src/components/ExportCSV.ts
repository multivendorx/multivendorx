import axios from 'axios';
import { FilterValue } from './table/types';

type Primitive = string | number | boolean | null | undefined | Date;

interface CSVActionProps<Type> {
  url: string;
  headers?: Record<string, string>;
  filename?: string;
  paramsBuilder?: (query: any) => any;
  mapFn: (item: Type) => Record<string, Primitive>;
  csvHeaders?: Record<string, string>;
}

export type QueryProps = {
  orderby?: string;
  order?: string;
  page?: string;
  per_page?: number;
  paged?: number | string;
  filter?: Record<string, FilterValue>;
  categoryFilter?: string;
};

export const ExportCSV = <Type>({
  url,
  headers,
  filename,
  paramsBuilder,
  mapFn,
  csvHeaders,
}: CSVActionProps<Type>) => async (query: QueryProps) => {
  try {
    const { data: resData } = await axios.get(url, {
      headers,
      params: paramsBuilder?.(query),
    });

    const dataArray = Array.isArray(resData) ? resData : [];
    if (!dataArray.length) return alert('No data available');

    const mappedData = dataArray.map(mapFn);
    const keys = csvHeaders
      ? (Object.keys(csvHeaders) as (keyof typeof mappedData[0])[])
      : (Object.keys(mappedData[0]) as (keyof typeof mappedData[0])[]);

    const csvContent = [
      keys.map(k => `"${csvHeaders?.[k] ?? String(k)}"`).join(','),
      ...mappedData.map(row =>
        keys
          .map(k => {
            const val = row[k];
            const normalized = val instanceof Date ? val.toISOString() : val ?? '';
            return `"${String(normalized).replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: filename ?? `${new Date().toISOString().split('Type')[0]}.csv`,
    });

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

  } catch (error) {
    console.error('CSV Download failed', error);
  }
};
