import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

interface Row {
  description: string;
  qty?: number | string;
  price?: string;
  amount?: string;
}

interface Props {
  invoiceRows?: Row[];
}

const InvoicePDF2: React.FC<Props> = ({ invoiceRows }) => {
  const rows: Row[] = invoiceRows || [
    { description: "Website Design & Development", qty: 1, price: "$3,500.00", amount: "$3,500.00" },
    { description: "Hosting & Maintenance (1 Year)", qty: 1, price: "$800.00", amount: "$800.00" },
    { description: "Content Optimization", qty: 1, price: "$350.00", amount: "$350.00" },
    { description: "Discount", qty: "—", price: "—", amount: "−$150.00" },
  ];

  const styles = StyleSheet.create({
    page: { fontSize: 12, fontFamily: "Helvetica", backgroundColor: "#fff"},
    container: {overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" },
    header: { backgroundColor: "#2563eb", padding: 20, flexDirection: "row", justifyContent: "space-between", color: "#fff" },
    headerTitle: { fontSize: 24, color: "#fff" },
    headerCompany: { fontSize: 12, textAlign: "right", color: "#fff" },
    body: { padding: 20 },
    detailsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
    section: { flex: 1, marginBottom: 10 },
    sectionTitle: { fontSize: 14, color: "#2563eb", marginBottom: 4 },
    sectionText: { fontSize: 12, color: "#333" },
    tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eee", paddingBottom: 4, marginBottom: 4 },
    tableRow: { flexDirection: "row", paddingBottom: 2 },
    desc: { flex: 0.5 },
    qty: { flex: 0.15, textAlign: "right" },
    price: { flex: 0.15, textAlign: "right" },
    amount: { flex: 0.2, textAlign: "right" },
    totals: { marginTop: 20, alignSelf: "flex-end", width: 200 },
    totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
    totalsRowTotal: { fontWeight: "bold" },
    notes: { marginTop: 20, fontSize: 10, color: "#666" },
    footer: { marginTop: 10, fontSize: 10, textAlign: "center", color: "#777" },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>INVOICE</Text>
            <Text style={styles.headerCompany}>
              Bluewave Solutions{"\n"}
              123 Business Street{"\n"}
              New York, NY 10001{"\n"}
              contact@bluewave.co | +1 555-123-4567
            </Text>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <View style={styles.detailsRow}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Bill To:</Text>
                <Text style={styles.sectionText}>John Doe{"\n"}456 Oak Avenue{"\n"}Los Angeles, CA 90012{"\n"}john.doe@email.com</Text>
              </View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Invoice Details:</Text>
                <Text style={styles.sectionText}>Invoice #: INV-2025-103{"\n"}Date: Oct 9, 2025{"\n"}Due Date: Oct 23, 2025{"\n"}Status: Paid</Text>
              </View>
            </View>

            {/* Items Table */}
            <View>
              <View style={styles.tableHeader}>
                <Text style={styles.desc}>Description</Text>
                <Text style={styles.qty}>Qty</Text>
                <Text style={styles.price}>Unit Price</Text>
                <Text style={styles.amount}>Amount</Text>
              </View>
              {rows.map((row, i) => (
                <View style={styles.tableRow} key={i}>
                  <Text style={styles.desc}>{row.description}</Text>
                  <Text style={styles.qty}>{row.qty}</Text>
                  <Text style={styles.price}>{row.price}</Text>
                  <Text style={styles.amount}>{row.amount}</Text>
                </View>
              ))}
            </View>

            {/* Totals */}
            <View style={styles.totals}>
              <View>
                <View style={styles.totalsRow}><Text>Subtotal</Text><Text>$4,500.00</Text></View>
                <View style={styles.totalsRow}><Text>Tax (10%)</Text><Text>$450.00</Text></View>
                <View style={[styles.totalsRow, { borderTopWidth: 1, borderTopColor: "#2563eb" }]}><Text style={styles.totalsRowTotal}>Total</Text><Text style={styles.totalsRowTotal}>$4,950.00</Text></View>
              </View>
            </View>

            {/* Notes */}
            <Text style={styles.notes}>
              Thank you for your payment. We appreciate your business! Please contact us if you need any additional documents.
            </Text>
          </View>

          <Text style={styles.footer}>© 2025 Bluewave Solutions — www.bluewave.co</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF2;
