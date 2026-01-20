import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

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

const InvoicePDF4: React.FC<Props> = ({ invoiceRows }) => {
  const rows: Row[] = invoiceRows || [
    { item: "Beanie with Logo", seller: "Test Shop", quantity: 1, price: "$250.00", total: "$200.00" },
    { item: "New Dress", seller: "Test Shop", quantity: 1, price: "$500.00", total: "$450.00" },
    { item: "Ninja Shirt", seller: "Test Shop", quantity: 1, price: "$550.00", total: "$550.00" },
  ];

  const styles = StyleSheet.create({
    page: { fontFamily: "Helvetica", fontSize: 12, padding: 24, backgroundColor: "#f5f5f5" },
    container: { backgroundColor: "#fff", padding: 24, borderRadius: 10, margin: "0 auto" },
    header: { textAlign: "center", marginBottom: 30, borderBottomWidth: 3, borderBottomColor: "#2c3e50", paddingBottom: 20 },
    headerText: { fontSize: 36, color: "#2c3e50", marginBottom: 10 },
    infoSection: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
    infoBox: { flex: 1 },
    infoTitle: { fontSize: 14, color: "#2c3e50", textTransform: "uppercase", marginBottom: 10, letterSpacing: 1 },
    invoiceTo: { backgroundColor: "#f8f9fa", padding: 20, marginBottom: 30, borderLeftWidth: 4, borderLeftColor: "#2c3e50" },
    invoiceToTitle: { fontSize: 14, color: "#2c3e50", textTransform: "uppercase", marginBottom: 10, letterSpacing: 1 },
    paymentMethod: { backgroundColor: "#e8f4f8", padding: 8, marginBottom: 20, borderRadius: 4 },
    tableHeader: { flexDirection: "row", backgroundColor: "#2c3e50", color: "#fff", padding: 6 },
    tableRow: { flexDirection: "row", padding: 6, borderBottomWidth: 1, borderBottomColor: "#ddd" },
    colItem: { flex: 0.5 },
    colQty: { flex: 0.15, textAlign: "center" },
    colPrice: { flex: 0.15, textAlign: "right" },
    colTotal: { flex: 0.2, textAlign: "right" },
    totals: { marginTop: 20, alignSelf: "flex-end", width: 300 },
    totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2, borderBottomWidth: 1, borderBottomColor: "#eee" },
    totalsRowTotal: { fontSize: 18, fontWeight: "bold", color: "#2c3e50", borderBottomWidth: 2 },
    totalsRowPaid: { fontSize: 16, fontWeight: "bold", color: "#27ae60", borderBottomWidth: 0 },
    footer: { textAlign: "center", fontSize: 12, color: "#888", marginTop: 40, borderTopWidth: 1, borderTopColor: "#ddd", paddingTop: 10 },
    itemName: { fontWeight: "bold", color: "#2c3e50" },
    soldBy: { fontSize: 10, color: "#888" },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>INVOICE</Text>
          </View>

          {/* Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Invoice Details</Text>
              <Text>Invoice No: 201815311526476267</Text>
              <Text>Invoice Date: May 16, 2018</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Order Details</Text>
              <Text>Order Number: 2015</Text>
              <Text>Order Date: 01/03/2018</Text>
            </View>
          </View>

          {/* Invoice To */}
          <View style={styles.invoiceTo}>
            <Text style={styles.invoiceToTitle}>Invoice To</Text>
            <Text>ABC Infotech{"\n"}BB-164, BB Block, Sector 1{"\n"}Salt Lake City, Kolkata{"\n"}West Bengal 700064</Text>
          </View>

          {/* Payment */}
          <View style={styles.paymentMethod}>
            <Text>Payment Method: Cash on Delivery</Text>
          </View>

          {/* Table */}
          <View style={styles.tableHeader}>
            <Text style={styles.colItem}>Item</Text>
            <Text style={styles.colQty}>Quantity</Text>
            <Text style={styles.colPrice}>Price</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>
          {rows.map((row, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.colItem}>{row.item}{"\n"}<Text style={styles.soldBy}>Sold By: {row.seller}</Text></Text>
              <Text style={styles.colQty}>{row.quantity}</Text>
              <Text style={styles.colPrice}>{row.price}</Text>
              <Text style={styles.colTotal}>{row.total}</Text>
            </View>
          ))}

          {/* Totals */}
          <View style={styles.totals}>
            <View style={styles.totalsRow}><Text>Subtotal:</Text><Text>$1200.00</Text></View>
            <View style={styles.totalsRow}><Text>Tax (10%):</Text><Text>$135.00</Text></View>
            <View style={styles.totalsRowTotal}><Text>Total:</Text><Text>$1335.00</Text></View>
            <View style={styles.totalsRowPaid}><Text>Amount Paid:</Text><Text>$997.00</Text></View>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>Thank you for your business!</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF4;
