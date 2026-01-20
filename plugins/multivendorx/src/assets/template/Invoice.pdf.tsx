import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { buildInvoiceTheme, getInvoiceRows } from './InvoiceLayout';

interface Props {
  colors: {
    colorPrimary: string;
    colorSecondary: string;
    colorAccent: string;
    colorSupport: string;
  };
}

const InvoicePDF: React.FC<Props> = ({ colors }) => {
  const theme = buildInvoiceTheme(colors);
  const rows = getInvoiceRows();

  const styles = StyleSheet.create({
    page: {
      padding: 24,
      backgroundColor: theme.cardBg,
      color: theme.textPrimary,
      fontSize: 12,
    },
    header: {
      fontSize: 18,
      color: theme.accent,
      marginBottom: 12,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    price: {
      color: theme.support,
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ width: 50, height: 50, backgroundColor: colors.colorPrimary, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>MK</Text>
            </View>
            <View>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>MarketKit Ltd.</Text>
              <Text style={{ fontSize: 10, color: '#6b7280' }}>Modern products, simple invoices</Text>
            </View>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Invoice</Text>
            <Text style={{ fontSize: 10, color: '#6b7280' }}>INV-2025-0091</Text>
          </View>
        </View>

        {rows.map((row, i) => (
          <View key={i} style={styles.row}>
            <Text>{row.description}</Text>
            <Text style={styles.price}>₹{row.price}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
};

export default InvoicePDF;