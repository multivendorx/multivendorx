import React from "react";
import { Document, Page, View, Text } from "@react-pdf/renderer";

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

  return (
    <Document>
      <Page
        size="A4"
        style={{
          fontSize: 12,
          fontFamily: "Helvetica",
          backgroundColor: "#fff",
        }}
      >
        <View
          style={{
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <View
            style={{
              backgroundColor: "#2563eb",
              padding: 20,
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontSize: 24, color: "#fff" }}>
              INVOICE
            </Text>

            <Text
              style={{
                fontSize: 12,
                color: "#fff",
                textAlign: "right",
                lineHeight: 1.4,
              }}
            >
              Bluewave Solutions
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#fff",
                textAlign: "right",
                lineHeight: 1.4,
              }}
            >
              123 Business Street
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#fff",
                textAlign: "right",
                lineHeight: 1.4,
              }}
            >
              New York, NY 10001{"\n"}
              contact@bluewave.co | +1 555-123-4567
            </Text>
          </View>

          {/* Body */}
          <View style={{ padding: 20 }}>
            {/* Details */}
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: "#2563eb", marginBottom: 4 }}>
                  Bill To:
                </Text>
                <Text style={{ fontSize: 12, color: "#333", lineHeight: 1.4 }}>
                  John Doe{"\n"}
                  456 Oak Avenue{"\n"}
                  Los Angeles, CA 90012{"\n"}
                  john.doe@email.com
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: "#2563eb", marginBottom: 4 }}>
                  Invoice Details:
                </Text>
                <Text style={{ fontSize: 12, color: "#333", lineHeight: 1.4 }}>
                  Invoice #: INV-2025-103{"\n"}
                  Date: Oct 9, 2025{"\n"}
                  Due Date: Oct 23, 2025{"\n"}
                  Status: Paid
                </Text>
              </View>
            </View>

            {/* Table Header */}
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                borderBottomWidth: 1,
                borderBottomColor: "#eee",
                paddingBottom: 4,
                marginBottom: 4,
              }}
            >
              <Text style={{ flex: 0.5 }}>Description</Text>
              <Text style={{ flex: 0.15, textAlign: "right" }}>Qty</Text>
              <Text style={{ flex: 0.15, textAlign: "right" }}>Unit Price</Text>
              <Text style={{ flex: 0.2, textAlign: "right" }}>Amount</Text>
            </View>

            {/* Table Rows */}
            {rows.map((row, i) => (
              <View
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  paddingBottom: 2,
                }}
              >
                <Text style={{ flex: 0.5 }}>{row.description}</Text>
                <Text style={{ flex: 0.15, textAlign: "right" }}>{row.qty}</Text>
                <Text style={{ flex: 0.15, textAlign: "right" }}>{row.price}</Text>
                <Text style={{ flex: 0.2, textAlign: "right" }}>{row.amount}</Text>
              </View>
            ))}

            {/* Totals */}
            <View
              style={{
                marginTop: 20,
                alignSelf: "flex-end",
                width: 200,
              }}
            >
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 2,
                }}
              >
                <Text>Subtotal</Text>
                <Text>$4,500.00</Text>
              </View>

              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 2,
                }}
              >
                <Text>Tax (10%)</Text>
                <Text>$450.00</Text>
              </View>

              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 4,
                  borderTopWidth: 1,
                  borderTopColor: "#2563eb",
                }}
              >
                <Text style={{ fontWeight: "bold" }}>Total</Text>
                <Text style={{ fontWeight: "bold" }}>$4,950.00</Text>
              </View>
            </View>

            {/* Notes */}
            <Text
              style={{
                marginTop: 20,
                fontSize: 10,
                color: "#666",
                lineHeight: 1.4,
              }}
            >
              Thank you for your payment. We appreciate your business! Please
              contact us if you need any additional documents.
            </Text>
          </View>

          {/* Footer */}
          <Text
            style={{
              marginTop: 10,
              fontSize: 10,
              textAlign: "center",
              color: "#777",
            }}
          >
            © 2025 Bluewave Solutions — www.bluewave.co
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF2;
