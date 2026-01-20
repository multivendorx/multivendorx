import React from 'react';
import { buildInvoiceTheme, getInvoiceRows } from './InvoiceLayout';

interface Props {
  colors: {
    colorPrimary: string;
    colorSecondary: string;
    colorAccent: string;
    colorSupport: string;
  };
}

const InvoiceDOM: React.FC<Props> = ({ colors }) => {
  const theme = buildInvoiceTheme(colors);
  const rows = getInvoiceRows();

  return (
    <div
      style={{
        background: theme.cardBg,
        padding: 16,
        color: theme.textPrimary,
      }}
    >
      <h3 style={{ color: theme.accent }}>
        Invoice Preview
      </h3>

      {rows.map((row, i) => (
        <div key={i}>
          {row.description} — ₹{row.price}
        </div>
      ))}
    </div>
  );
};

export default InvoiceDOM;