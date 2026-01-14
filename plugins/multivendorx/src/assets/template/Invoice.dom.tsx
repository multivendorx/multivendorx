import React from 'react';
import { buildInvoiceTheme, getInvoiceRows } from './InvoiceLayout';

interface Props {
  themeVars: Record<string, string>;
}

const InvoiceDOM: React.FC<Props> = ({ themeVars }) => {
  const theme = buildInvoiceTheme(themeVars);
  const rows = getInvoiceRows();

  return (
    <div style={{ background: theme.cardBg, padding: 16, color: theme.textPrimary }}>
      <h3 style={{ color: theme.accent }}>Invoice Preview</h3>

      {rows.map((row, i) => (
        <div key={i}>
          {row.description} — ${row.price}
        </div>
      ))}
    </div>
  );
};

export default InvoiceDOM;
