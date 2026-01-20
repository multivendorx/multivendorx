import { StyleSheet, Text, View } from "@react-pdf/renderer";
import React from "react";

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
    colorPrimary: colors.colorPrimary || "#6366F1",
    colorSecondary: colors.colorSecondary || "#E5E7EB",
    colorAccent: colors.colorAccent || "#6366F1",
    colorSupport: colors.colorSupport || "#EF4444",
    cardBg: colors.cardBg || "#ffffff",
    textPrimary: colors.textPrimary || "#111827",
    textSecondary: colors.textSecondary || "#6B7280",
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
    <div
      style={{
        background: "#f3f4f6",
        padding: 28,
        fontFamily: "Inter, Roboto, sans-serif",
        minHeight: "100vh",
      }}
    >
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
      <div
        className="card"
        style={{
          background: theme.cardBg,
          borderRadius: 12,
          maxWidth: 920,
          margin: "0 auto",
          boxShadow: "0 6px 20px rgba(15,23,42,0.06)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          className="invoice-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 28,
            borderBottom: `1px solid ${theme.colorSecondary}`,
          }}
        >
          <div className="brand" style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div
              className="logo"
              style={{
                width: 68,
                height: 68,
                background: theme.colorPrimary,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: 20,
              }}
            >
              MK
            </div>
            <div className="brand-details" style={{ lineHeight: 1 }}>
              <div className="company" style={{ fontWeight: 700, fontSize: 18 }}>
                MarketKit Ltd.
              </div>
              <div className="tagline" style={{ fontSize: 13, color: theme.textSecondary }}>
                Modern products, simple invoices
              </div>
              <div className="muted" style={{ fontSize: 13, color: theme.textSecondary, marginTop: 6 }}>
                123 Elm Street, Suite 400 · (555) 555-0123
              </div>
            </div>
          </div>

          <div className="invoice-meta" style={{ textAlign: "right", minWidth: 220 }}>
            <div className="title" style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
              Invoice
            </div>
            <div className="muted" style={{ color: theme.textSecondary, fontSize: 13 }}>
              Invoice #: <strong>INV-2025-0091</strong>
            </div>
            <div className="muted" style={{ color: theme.textSecondary, fontSize: 13 }}>
              Issued: <strong>October 9, 2025</strong>
            </div>
            <div className="muted" style={{ color: theme.textSecondary, fontSize: 13 }}>
              Due: <strong>October 23, 2025</strong>
            </div>
            <div style={{ marginTop: 8 }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "6px 10px",
                  background: "#e6f4ff",
                  borderRadius: 9999,
                  fontWeight: 600,
                  color: "#0369a1",
                  fontSize: 13,
                }}
              >
                Unpaid
              </span>
            </div>
          </div>
        </div>

        {/* Bill To / Ship To */}
        <div
          className="invoice-body"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            padding: 28,
          }}
        >
          <div className="box" style={{ background: "#fbfdff", border: "1px solid #eef2f7", padding: 18, borderRadius: 8 }}>
            <h4>Bill To</h4>
            <p>
              <strong>Acme Corporation</strong>
            </p>
            <p style={{ color: theme.textSecondary, lineHeight: 1.5 }}>
              Attn: Jane Doe<br />
              456 Oak Avenue<br />
              Springfield, IL 62701<br />
              jane.doe@acme.co<br />
              (555) 987-6543
            </p>
          </div>
          <div className="box" style={{ background: "#fbfdff", border: "1px solid #eef2f7", padding: 18, borderRadius: 8 }}>
            <h4>Ship To</h4>
            <p>
              <strong>Acme Warehouse</strong>
            </p>
            <p style={{ color: theme.textSecondary, lineHeight: 1.5 }}>789 Distribution Road<br />Springfield, IL 62702</p>
            <div style={{ marginTop: 12 }}>
              <h4>Payment</h4>
              <p style={{ color: theme.textSecondary, lineHeight: 1.5 }}>
                Bank: First Modern Bank<br />
                Account: <strong>0123456789</strong><br />
                IBAN: <strong>US00FM123456</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="items" style={{ padding: "0 28px 28px 28px", overflowX: "auto" }}>
          <table className="invoice-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr>
                <th style={{ width: "48%", textAlign: "left", padding: 12, fontSize: 13 }}>Description</th>
                <th style={{ width: "12%", textAlign: "right", padding: 12 }}>Unit</th>
                <th style={{ width: "10%", textAlign: "right", padding: 12 }}>Qty</th>
                <th style={{ width: "15%", textAlign: "right", padding: 12 }}>Unit Price</th>
                <th style={{ width: "15%", textAlign: "right", padding: 12 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ fontSize: 14, color: "#374151" }}>{row.description}</div>
                    {row.meta && <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 6 }}>{row.meta}</div>}
                  </td>
                  <td style={{ textAlign: "right" }}>{row.unit}</td>
                  <td style={{ textAlign: "right" }}>{row.qty}</td>
                  <td style={{ textAlign: "right" }}>{row.price}</td>
                  <td style={{ textAlign: "right" }}>{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="totals" style={{ display: "flex", justifyContent: "flex-end", padding: "18px 28px 36px 28px" }}>
          <div
            className="totals-table"
            style={{
              width: 320,
              borderRadius: 8,
              overflow: "hidden",
              background: "#fbfdff",
              border: "1px solid #eef2f7",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px" }}>
              <div style={{ fontSize: 13, color: theme.textSecondary }}>Subtotal</div>
              <div style={{ fontSize: 13, color: theme.textSecondary }}>$8,500.00</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px" }}>
              <div style={{ fontSize: 13, color: theme.textSecondary }}>Sales Tax (8.25%)</div>
              <div style={{ fontSize: 13, color: theme.textSecondary }}>$701.25</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px" }}>
              <div style={{ fontSize: 13, color: theme.textSecondary }}>Shipping</div>
              <div style={{ fontSize: 13, color: theme.textSecondary }}>$0.00</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", fontWeight: 700, fontSize: 18 }}>
              <div>Total Due</div>
              <div>$9,201.25</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="invoice-footer"
          style={{ display: "flex", justifyContent: "space-between", padding: "18px 28px 36px", borderTop: "1px dashed #eef2f7" }}
        >
          <div style={{ fontSize: 13, color: theme.textSecondary }}>
            <strong>Notes</strong>
            <div style={{ height: 6 }} />
            Thank you for your business. Please make payment within 14 days. Late payments may incur additional fees.
          </div>
          <div style={{ textAlign: "right", minWidth: 220 }}>
            <div
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px dashed #e6eef7",
                color: "#374151",
                fontSize: 13,
                background: "#fff",
              }}
            >
              Authorized Signature
            </div>
            <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 6 }}>
              marketkit@support.co • +1 (555) 555-0123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDOM;
