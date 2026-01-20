import React from "react";
import { Document, Page, View, Text, StyleSheet, Image } from "@react-pdf/renderer";

interface Row {
  item: string;
  seller?: string;
  quantity?: number | string;
  price?: string;
  total?: string;
}

interface Props {
  invoiceRows?: Row[];
}

const InvoicePDF3: React.FC<Props> = ({ invoiceRows }) => {
  const rows: Row[] = invoiceRows || [
    { item: "Beanie with Logo", seller: "Test Shop", quantity: 1, price: "$250.00", total: "$200.00" },
    { item: "New Dress", seller: "Test Shop", quantity: 1, price: "$500.00", total: "$450.00" },
    { item: "Ninja Shirt", seller: "Test Shop", quantity: 1, price: "$550.00", total: "$550.00" },
  ];

  const styles = StyleSheet.create({
    page: { fontFamily: "Helvetica", fontSize: 12, padding: 24, backgroundColor: "#f4f6f8" },
    container: { backgroundColor: "#fff", borderRadius: 10, padding: 24, boxShadow: "0 4px 15px rgba(0,0,0,0.1)" },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 3, borderBottomColor: "#0056b3", paddingBottom: 15, marginBottom: 30 },
    invoiceTitle: { fontSize: 26, color: "#0056b3" },
    invoiceDetails: { fontSize: 12, textAlign: "right", color: "#555" },
    infoRow: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", marginBottom: 25 },
    infoSection: { flex: 1, fontSize: 12, marginBottom: 10 },
    sectionTitle: { fontSize: 14, color: "#0056b3", marginBottom: 4 },
    tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingBottom: 4, marginBottom: 4 },
    tableRow: { flexDirection: "row", paddingBottom: 2 },
    colItem: { flex: 0.4 },
    colQty: { flex: 0.2 },
    colPrice: { flex: 0.2 },
    colTotal: { flex: 0.2, textAlign: "right" },
    totals: { marginTop: 25, alignSelf: "flex-end", width: 200 },
    totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
    totalsRowTotal: { fontWeight: "bold" },
    paid: { backgroundColor: "#e8f7e3", color: "#256029", fontWeight: "bold", padding: 8, borderRadius: 5, textAlign: "center", marginTop: 15 },
    footer: { fontSize: 10, textAlign: "center", color: "#999", marginTop: 30, borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 8 },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Image src="logo.png" style={{ width: 100 }} />
            <View style={styles.invoiceDetails}>
              <Text style={styles.invoiceTitle}>INVOICE</Text>
              <Text>Invoice No: 201815311526476267</Text>
              <Text>Invoice Date: May 16, 2018</Text>
            </View>
          </View>

          {/* Info */}
          <View style={styles.infoRow}>
            <View style={styles.infoSection}>
              <Text>Order Number: 2015</Text>
              <Text>Order Date: 01/03/2018</Text>
              <Text>Payment Method: Cash on Delivery</Text>
            </View>
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Invoice To:</Text>
              <Text>ABC Infotech{"\n"}BB-164, BB Block, Sector 1,{"\n"}Salt Lake City, Kolkata,{"\n"}West Bengal 700064</Text>
            </View>
          </View>

          {/* Table */}
          <View>
            <View style={styles.tableHeader}>
              <Text style={styles.colItem}>Item</Text>
              <Text style={styles.colQty}>Quantity</Text>
              <Text style={styles.colPrice}>Price</Text>
              <Text style={styles.colTotal}>Total</Text>
            </View>
            {rows.map((row, i) => (
              <View style={styles.tableRow} key={i}>
                <Text style={styles.colItem}>{row.item}{"\n"}<Text style={{ fontSize: 10, color: "#777" }}>Sold By: {row.seller}</Text></Text>
                <Text style={styles.colQty}>{row.quantity}</Text>
                <Text style={styles.colPrice}>{row.price}</Text>
                <Text style={styles.colTotal}>{row.total}</Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totals}>
            <View>
              <View style={styles.totalsRow}><Text>Subtotal:</Text><Text>$1200.00</Text></View>
              <View style={styles.totalsRow}><Text>Tax (10%):</Text><Text>$135.00</Text></View>
              <View style={[styles.totalsRow, { borderTopWidth: 1, borderTopColor: "#0056b3" }]}><Text style={styles.totalsRowTotal}>Total:</Text><Text style={styles.totalsRowTotal}>$1335.00</Text></View>
            </View>
          </View>

          {/* Paid Status */}
          <Text style={styles.paid}>Amount Paid: $997.00 — Remaining Balance: $338.00</Text>

          {/* Footer */}
          <Text style={styles.footer}>© 2018 ABC Infotech — Thank you for your business.</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF3;
