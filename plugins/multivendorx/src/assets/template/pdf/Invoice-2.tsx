import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

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
  };
  invoiceRows?: Row[];
}

const InvoicePDF: React.FC<Props> = ({ colors = {}, invoiceRows }) => {
  const theme = {
    colorPrimary: colors.colorPrimary || "#6366F1",
    colorSecondary: colors.colorSecondary || "#E5E7EB",
    colorAccent: colors.colorAccent || "#6366F1",
    colorSupport: colors.colorSupport || "#EF4444",
  };

  const rows: Row[] = invoiceRows || [
    {
      description: "Premium SaaS Subscription — Pro Plan",
      meta: "License: 12 months, includes priority support",
      unit: "Plan",
      qty: 1,
      price: "$6,000.00",
      amount: "$6,000.00",
    },
    {
      description: "Integration & Onboarding (one-time)",
      meta: "Up to 10 hours of professional services",
      unit: "Service",
      qty: 1,
      price: "$1,200.00",
      amount: "$1,200.00",
    },
    {
      description: "Custom Connector (development)",
      meta: "Flat rate for custom connector",
      unit: "Project",
      qty: 1,
      price: "$1,800.00",
      amount: "$1,800.00",
    },
    {
      description: "Discount",
      meta: "Loyalty discount",
      unit: "—",
      qty: "—",
      price: "—",
      amount: "−$500.00",
    },
  ];

  const styles = StyleSheet.create({
    page: { fontSize: 12, fontFamily: "Helvetica"},
    card: { padding: 24, borderRadius: 12, backgroundColor: "#ffffff" },
    header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
    brand: { flexDirection: "row" },
    logo: {
      width: 50,
      height: 50,
      backgroundColor: theme.colorPrimary,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    logoText: { color: "#fff", fontWeight: "bold", fontSize: 20 },
    brandDetails: { justifyContent: "center" },
    company: { fontSize: 16, fontWeight: "bold" },
    tagline: { fontSize: 10, color: "#6b7280" },
    meta: { textAlign: "right" },
    metaTitle: { fontSize: 16, fontWeight: "bold" },
    metaText: { fontSize: 10, color: "#6b7280" },
    body: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
    box: { backgroundColor: "#fbfdff", borderWidth: 1, borderColor: "#eef2f7", borderRadius: 6, padding: 12, flex: 1, marginRight: 12 },
    boxTitle: { fontWeight: "bold", marginBottom: 6 },
    boxText: { fontSize: 10, color: "#6b7280" },
    itemsHeader: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#eef2f7", paddingBottom: 6, marginBottom: 6 },
    itemRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
    itemDesc: { flex: 0.48, fontSize: 12, color: "#374151" },
    itemMeta: { fontSize: 10, color: "#6b7280" },
    colUnit: { flex: 0.12, textAlign: "right" },
    colQty: { flex: 0.1, textAlign: "right" },
    colPrice: { flex: 0.15, textAlign: "right" },
    colAmount: { flex: 0.15, textAlign: "right" },
    totals: { alignSelf: "flex-end", width: 200, padding: 6, borderRadius: 6, borderWidth: 1, borderColor: "#eef2f7", backgroundColor: "#fbfdff" },
    totalsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
    totalsRowTotal: { fontWeight: "bold", fontSize: 12 },
    footer: { flexDirection: "row", justifyContent: "space-between", marginTop: 30, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#eef2f7" },
    notes: { fontSize: 10, color: "#6b7280", flex: 1 },
    signBox: { borderWidth: 1, borderColor: "#e6eef7", borderRadius: 6, padding: 6, fontSize: 10, textAlign: "center", color: "#374151" },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.brand}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>MK</Text>
              </View>
              <View style={styles.brandDetails}>
                <Text style={styles.company}>MarketKit Ltd.</Text>
                <Text style={styles.tagline}>Modern products, simple invoices</Text>
              </View>
            </View>
            <View style={styles.meta}>
              <Text style={styles.metaTitle}>Invoice</Text>
              <Text style={styles.metaText}>Invoice #: INV-2025-0091</Text>
              <Text style={styles.metaText}>Issued: October 9, 2025</Text>
              <Text style={styles.metaText}>Due: October 23, 2025</Text>
            </View>
          </View>

          {/* Bill To / Ship To */}
          <View style={styles.body}>
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Bill To</Text>
              <Text>Acme Corporation</Text>
              <Text style={styles.boxText}>
                Attn: Jane Doe{"\n"}456 Oak Avenue{"\n"}Springfield, IL 62701{"\n"}jane.doe@acme.co{"\n"}(555) 987-6543
              </Text>
            </View>
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Ship To</Text>
              <Text>Acme Warehouse</Text>
              <Text style={styles.boxText}>789 Distribution Road{"\n"}Springfield, IL 62702</Text>

              <Text style={{ marginTop: 8, fontWeight: "bold" }}>Payment</Text>
              <Text style={styles.boxText}>
                Bank: First Modern Bank{"\n"}Account: 0123456789{"\n"}IBAN: US00FM123456
              </Text>
            </View>
          </View>

          {/* Items */}
          <View>
            <View style={styles.itemsHeader}>
              <Text style={styles.itemDesc}>Description</Text>
              <Text style={styles.colUnit}>Unit</Text>
              <Text style={styles.colQty}>Qty</Text>
              <Text style={styles.colPrice}>Unit Price</Text>
              <Text style={styles.colAmount}>Amount</Text>
            </View>
            {rows.map((row, i) => (
              <View key={i} style={styles.itemRow}>
                <Text style={styles.itemDesc}>{row.description}</Text>
                {row.meta && <Text style={styles.itemMeta}>{row.meta}</Text>}
                <Text style={styles.colUnit}>{row.unit}</Text>
                <Text style={styles.colQty}>{row.qty}</Text>
                <Text style={styles.colPrice}>{row.price}</Text>
                <Text style={styles.colAmount}>{row.amount}</Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totals}>
            <View>
              <View style={styles.totalsRow}>
                <Text style={{ fontSize: 10, color: "#6b7280" }}>Subtotal</Text>
                <Text style={{ fontSize: 10, color: "#6b7280" }}>$8,500.00</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={{ fontSize: 10, color: "#6b7280" }}>Sales Tax (8.25%)</Text>
                <Text style={{ fontSize: 10, color: "#6b7280" }}>$701.25</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={{ fontSize: 10, color: "#6b7280" }}>Shipping</Text>
                <Text style={{ fontSize: 10, color: "#6b7280" }}>$0.00</Text>
              </View>
              <View style={[styles.totalsRow, { marginTop: 2 }]}>
                <Text style={styles.totalsRowTotal}>Total Due</Text>
                <Text style={styles.totalsRowTotal}>$9,201.25</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;