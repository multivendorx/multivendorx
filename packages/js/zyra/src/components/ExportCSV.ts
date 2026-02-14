import axios from 'axios';
import { FilterValue } from './table/types';

export type QueryProps = {
  orderby?: string;
  order?: string;
  page?: string;
  per_page?: number;
  filter?: Record<string, FilterValue>;
};

type Primitive = string | number | boolean | Date;

type ColumnMapping<Type> = {
  [Key in keyof Type]: {
    header: string;
    value: Primitive;
  };
};

interface ExportCSVProps<Type> {
  url: string;
  headers?: Record<string, string>;
  filename?: string;
  paramsBuilder?: (query: QueryProps) => any;
  columns: (item: Type) => ColumnMapping<Type>;
}

export const ExportCSV = <Type>({
  url,
  headers,
  filename,
  paramsBuilder,
  columns,
}: ExportCSVProps<Type>) => async (query: QueryProps) => {
  try {
    const { data: resData } = await axios.get(url, {
      headers,
      params: paramsBuilder?.(query),
    });

    const dataArray = Array.isArray(resData) ? resData : [];
    if (!dataArray.length) return alert('No data available');

    const mappedData = dataArray.map(columns);

    // Use the first item to get headers
    const keys = Object.keys(mappedData[0]) as (keyof typeof mappedData[0])[];

    const csvContent = [
      keys.map(Key => `"${mappedData[0][Key].header}"`).join(','),
      ...mappedData.map(row =>
        keys
          .map(Key => {
            const val = row[Key].value;
            const normalized = val instanceof Date ? val.toISOString() : val ?? '';
            return `"${String(normalized).replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: filename ?? `${new Date().toISOString().split('T')[0]}.csv`,
    });

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

  } catch (error) {
    console.error('CSV Download failed', error);
  }
};
