import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { buildInvoiceTheme, getInvoiceRows } from './InvoiceLayout';

interface Props {
  themeVars: Record<string, string>;
}

const InvoicePDF: React.FC<Props> = ({ themeVars }) => {
  const theme = buildInvoiceTheme(themeVars);
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
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Invoice</Text>

        {rows.map((row, i) => (
          <View key={i} style={styles.row}>
            <Text>{row.description}</Text>
            <Text>${row.price}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
};

export default InvoicePDF;
