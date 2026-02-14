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
    colors: {
        colorPrimary: string;
        colorSecondary: string;
        colorAccent: string;
        colorSupport: string;
    };
}

const InvoicePDF2: React.FC<Props> = ({ invoiceRows, colors }) => {
    const rows: Row[] = invoiceRows || [
        { description: "Website Design & Development", qty: 1, price: "$3,500.00", amount: "$3,500.00" },
        { description: "Hosting & Maintenance (1 Year)", qty: 1, price: "$800.00", amount: "$800.00" },
        { description: "Content Optimization", qty: 1, price: "$350.00", amount: "$350.00" },
        { description: "Discount", qty: " ", price: " ", amount: "−$150.00" },
    ];

    return (
        <Document>
            <Page
                size="A4"
                style={{
                    fontSize: 12,
                    fontFamily: "Helvetica",
                    backgroundColor: "#fff",
                    position: "relative"
                }}
            >
                <View>
                    {/* header start*/}
                    <View id='invoice-header' style={{ display: "flex", justifyContent: "space-between", flexDirection: "row", margin: "20px", paddingBottom: "20px", borderBottom: "1px solid #eee" }}>
                        {/* left section */}
                        <View id='invoice-header-left' style={{ display: "flex", justifyContent: "space-between", gap: 15, flexDirection: "row", alignItems: "flex-start" }}>
                            <View
                                style={{
                                    padding: 10,
                                    backgroundColor: colors.colorPrimary,
                                    fontSize: 25,
                                    fontWeight: 600,
                                    borderRadius: 4,
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Text style={{ color: "#fff" }}>MK</Text>
                            </View>
                            <View style={{ display: "flex", gap: 5, flexDirection: "column" }}>
                                <Text id='company-name' style={{ fontSize: 20, fontWeight: 600 }} >Marketplace Fee Invoice</Text>
                                <Text id='address'>john.smith@email.com</Text>
                                {/* <Text id='address'>123 Elm Street, Suite 400 · (555) 555-0123</Text> */}
                            </View>
                        </View>  {/* left section end*/}

                        {/* right section */}
                        <View id='invoice-header-right'
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-end",
                                gap: 6,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 20,
                                    fontWeight: 600,
                                }}
                            >
                                Invoice
                            </Text>

                            <Text style={{ fontSize: 12, color: "#555" }}>
                                Invoice Number: <Text style={{ fontWeight: 600 }}>INV-MKT-20260122-001</Text>
                            </Text>

                            <Text style={{ fontSize: 12, color: "#555" }}>
                                Invoice Date: <Text style={{ fontWeight: 600 }}>October 9, 2025</Text>
                            </Text>

                            <Text style={{ fontSize: 12, color: "#555" }}>
                                Customer Name: <Text style={{ fontWeight: 600 }}>John Smith</Text>
                            </Text>

                            <View
                                style={{
                                    marginTop: 8,
                                    padding: "4px 8px",
                                    backgroundColor: "#fde68a",
                                    borderRadius: 5,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 10,
                                        fontWeight: 600,
                                        color: "#92400e",
                                    }}
                                >
                                    Unpaid
                                </Text>
                            </View>
                        </View> {/* right section end */}
                    </View>
                    {/* header end*/}

                    {/* tax information */}
                    <View id="tax-information" style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", gap: "16px", padding: "10px", backgroundColor: "#f9f9f9", margin: "20px", border: `1px solid #ccc`, borderRadius: "5px" }}>
                        <View style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <Text style={{ fontSize: "10px" }}>Company VAT Number</Text>
                            <Text style={{ fontSize: "10px", fontWeight: "bold" }}>GB987654321</Text>
                        </View>
                        <View style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <Text style={{ fontSize: "10px" }}>Tax Registration Number</Text>
                            <Text style={{ fontSize: "10px", fontWeight: "bold" }}>TRN-2024-SELL-9012</Text>
                        </View>
                        <View style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <Text style={{ fontSize: "10px" }}>GST Number (if applicable)</Text>
                            <Text style={{ fontSize: "10px", fontWeight: "bold" }}>GST-29XYZAB5678G2H6</Text>
                        </View>
                        <View style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <Text style={{ fontSize: "10px" }}>Tax Jurisdiction</Text>
                            <Text style={{ fontSize: "10px", fontWeight: "bold" }}>United Kingdom / EU</Text>
                        </View>
                    </View>
                    {/* tax information end*/}

                    {/* table section start */}
                    <View id="invoice-table-wrapper" style={{ margin: "20px", display: "flex", flexDirection: "column" }}>
                        <View id="invoice-table-header"
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                paddingVertical: 8,
                            }}
                        >
                            {/* Description */}
                            <View style={{ flex: 4 }}>
                                <Text style={{ fontWeight: 600 }}>Description</Text>
                            </View>

                            {/* Amount */}
                            <Text
                                style={{
                                    flex: 2,
                                    textAlign: "right",
                                    fontWeight: 600,
                                }}
                            >
                                Amount
                            </Text>
                        </View>
                        {rows.map((row, index) => {
                            return (
                                <View id="invoice-table-row"
                                    key={index}
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        paddingVertical: 8,
                                        borderTop: "1px solid #eee",
                                    }}
                                >
                                    {/* Description */}
                                    <View style={{ flex: 4 }}>
                                        <Text>{row.description}</Text>
                                    </View>

                                    {/* Amount */}
                                    <Text
                                        style={{
                                            flex: 2,
                                            textAlign: "right"
                                        }}
                                    >
                                        {row.amount}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                    {/* table section end  */}


                    {/* total section start */}
                    <View id="total-section" style={{ margin: "20px", marginTop: "10px", display: "flex", justifyContent: "flex-end" }}>

                        <View style={{ border: "1px solid #ccc", borderRadius: "5px", padding: "10px", backgroundColor: "#f9f9f9", width: "40%", alignSelf: "flex-end", marginLeft: "auto" }}>
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: "8px" }}>
                                <Text style={{ fontSize: "12px" }}>Subtotal:</Text>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", marginLeft: "10px" }}>$1,000.00</Text>
                            </View>
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: "8px" }}>
                                <Text style={{ fontSize: "12px" }}>Taxes (VAT/GST):</Text>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", marginLeft: "10px" }}>$701.25</Text>
                            </View>
                        </View>
                    </View>
                    {/* total section end */}

                    {/* note section start */}
                    <View style={{ paddingTop: "20px", display: "flex", justifyContent: "center", borderTop: "1px solid #eee", margin: "20px" }}>
                        <Text style={{ fontSize: "12px", fontWeight: "bold" }}>
                            Notes: <Text style={{ fontSize: "10px" }}>This invoice covers marketplace service fees only.</Text>
                        </Text>
                    </View>
                    {/* note section end */}
                </View>
            </Page>
        </Document>
    );
};

export default InvoicePDF2;
