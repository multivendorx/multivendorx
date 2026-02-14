import axios from 'axios';
import { __ } from '@wordpress/i18n';
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

const formatValue = (value: Primitive) => {
  const v = value instanceof Date ? value.toISOString() : value ?? '';
  return `"${String(v).replace(/"/g, '""')}"`;
};

export const ExportCSV =
<Type>({
  url,
  headers,
  filename = `${__('export', 'multivendorx')}-${new Date().toISOString().split('Type')[0]}.csv`,
  paramsBuilder,
  columns,
}: ExportCSVProps<Type>) =>
  async (query: QueryProps) => {
    try {
      const { data } = await axios.get<Type[]>(url, {
        headers,
        params: paramsBuilder?.(query),
      });

      if (!Array.isArray(data) || !data.length) {
        console.warn(__('No data available to export.', 'multivendorx'));
        return;
      }

      const mapped = data.map(columns);
      const keys = Object.keys(mapped[0]);

      const header = keys.map(formatValue).join(',');

      const rows = mapped.map(row =>
        keys.map(key => formatValue(row[key])).join(',')
      );

      const csv = [header, ...rows].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const urlObj = URL.createObjectURL(blob);

      Object.assign(document.createElement('a'), {
        href: urlObj,
        download: filename
      }).click();

      URL.revokeObjectURL(urlObj);
    } catch (error) {
      console.error(__('CSV export failed.', 'multivendorx'), error);
    }
};