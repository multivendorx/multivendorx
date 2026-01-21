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
        <View>
          {/* header start*/}
          <View style={{ display: "flex", justifyContent: "space-between", flexDirection: "row", padding: 20 }}>
            {/* left section */}
            <View style={{ display: "flex", justifyContent: "space-between", gap: 15, flexDirection: "row" }}>
              <View
                style={{
                  padding: 10,
                  backgroundColor: "red",
                  fontSize: 25,
                  // width: 40,
                  // height: 40,
                  fontWeight: 600,
                  borderRadius: 4,
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff"}}>MK</Text>
              </View>
              <View style={{ display: "flex", gap: 5, flexDirection: "column" }}>
                <Text id='company-name' style={{ fontSize: 26, fontWeight: 600 }} >MarketKit Ltd.</Text>
                <Text id='address'>Modern products, simple invoices</Text>
                <Text id='address'>123 Elm Street, Suite 400 · (555) 555-0123</Text>
              </View>
            </View>  {/* left section end*/}

            {/* right section */}
            <View id='right-section'>

            </View> {/* right section end*/}
          </View>
        </View>  {/* header end*/}
      </Page>
    </Document>
  );
};

export default InvoicePDF2;
