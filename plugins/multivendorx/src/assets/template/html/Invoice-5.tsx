import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

interface Row {
  description: string;
  meta?: string;
  unit?: string;
  qty?: number | string;
  price?: string;
  amount?: string;
}

interface Props {
  colors?: {
    colorPrimary?: string;
    colorSecondary?: string;
    colorAccent?: string;
    colorSupport?: string;
    cardBg?: string;
    textPrimary?: string;
    textSecondary?: string;
  };
  invoiceRows?: Row[];
}

const InvoiceDOM: React.FC<Props> = ({ colors = {}, invoiceRows }) => {
  const theme = {
    colorPrimary: colors.colorPrimary || "#2563EB", 
    colorSecondary: colors.colorSecondary || "#E5E7EB",
    colorAccent: colors.colorAccent || "#6366F1",
    colorSupport: colors.colorSupport || "#EF4444",
    cardBg: colors.cardBg || "#FFFFFF",
    textPrimary: colors.textPrimary || "#FFFFFF",
    textSecondary: colors.textSecondary || "#6B7280",
  };

  const styles = StyleSheet.create({
    page: {
      fontSize: 12,
      fontFamily: "Helvetica",
      backgroundColor: "#fff",
      padding: 0,
    },
    header: {
      backgroundColor: "red",
      padding: 20,
      flexDirection: "column",
      justifyContent: "space-between",
    },
    headerTitle: {
      fontSize: 24,
      color: "#fff",
    },
    headerInfo: {
      fontSize: 12,
      color: "#fff",
      lineHeight: 1.5,
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>INVOICE</Text>
          <Text style={styles.headerInfo}>
            Bluewave Solutions{"\n"}
            123 Business Street{"\n"}
            New York, NY 10001{"\n"}
            contact@bluewave.co | +1 555-123-4567
          </Text>
        </View>
       
      </Page>
    </Document>
  );
};

export default InvoiceDOM;
