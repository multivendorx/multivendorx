import React from "react";
import { Document, Page, View, Text } from "@react-pdf/renderer";

interface Row {
    description: string;
    qty?: number | string;
    unitPrice?: string;
    subtotal?: string;
    taxRate?: string;
    taxAmount?: string;
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

const Invoice1: React.FC<Props> = ({ invoiceRows, colors }) => {
    const rows: Row[] = invoiceRows || [
        { description: "Widget A – Premium Edition", qty: 2, unitPrice: "$50.00", subtotal: "$100.00", taxRate: "10%", taxAmount: "$10.00" },
        { description: "Widget B – Deluxe Model", qty: 1, unitPrice: "$75.00", subtotal: "$75.00", taxRate: "10%", taxAmount: "$7.50" },
        { description: "Website Design", qty: 1, unitPrice: "$1,500.00", subtotal: "$1,500.00", taxRate: "18%", taxAmount: "$270.00" },
        { description: "Frontend Development", qty: 40, unitPrice: "$40.00", subtotal: "$1,600.00", taxRate: "18%", taxAmount: "$288.00" },
        { description: "Backend API Integration", qty: 25, unitPrice: "$45.00", subtotal: "$1,125.00", taxRate: "18%", taxAmount: "$202.50" },
        { description: "SEO Optimization", qty: 1, unitPrice: "$300.00", subtotal: "$300.00", taxRate: "12%", taxAmount: "$36.00" },
        { description: "Annual Hosting", qty: 1, unitPrice: "$250.00", subtotal: "$250.00", taxRate: "5%", taxAmount: "$12.50" },
        { description: "Maintenance & Support", qty: 12, unitPrice: "$60.00", subtotal: "$720.00", taxRate: "18%", taxAmount: "$129.60" },
        { description: "Custom Plugin Development", qty: 1, unitPrice: "$900.00", subtotal: "$900.00", taxRate: "18%", taxAmount: "$162.00" },
        { description: "Discount", qty: " ", unitPrice: " ", subtotal: "−$200.00", taxRate: " ", taxAmount: "$0.00" },
    ];

    return (
        <Document>
            <Page size="A4"
                style={{
                    fontSize: 12,
                    fontFamily: "Helvetica",
                    backgroundColor: "#fff",
                    position: "relative"
                }}>
                <View>
                    {/* header start*/}
                    <View id='invoice-header' style={{ display: "flex", justifyContent: "space-between", flexDirection: "row", padding: "30px 20px", backgroundColor: colors.colorPrimary }}>
                        <View id='invoice-header-left' style={{ display: "flex", alignItems: "center", flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={{ fontSize: "26px", color: "#fff", fontWeight: "bold" }}> INVOICE </Text>
                        </View>

                        {/* right section */}
                        <View id='invoice-header-right' style={{ display: "flex", justifyContent: "space-between", gap: 15, flexDirection: "row", alignItems: "flex-start" }}>
                            <View style={{ display: "flex", gap: 5, flexDirection: "column", color: "#fff" }}>
                                <Text id='company-name' style={{ fontSize: 20, fontWeight: 600, color: "#fff" }} >Premium Electronics Store</Text>
                                <Text id='address' style={{ color: "#fff" }}>123 Commerce Street</Text>
                                <Text id='address' style={{ color: "#fff" }}>London, EC1A 1BB</Text>
                                <Text id='address' style={{ color: "#fff" }}><Text style={{ fontWeight: "bold" }}>VAT: </Text> GB987654321</Text>
                                <Text id='address' style={{ color: "#fff" }}><Text style={{ fontWeight: "bold" }}>Tax ID: </Text> TRN-2024-SELL-9012</Text>
                            </View>
                        </View>  {/* right section end*/}

                    </View>
                    {/* header end*/}

                    {/* billing section start */}
                    <View id="billing-section" style={{ margin: "20px", display: "flex", flexDirection: "row", justifyContent: "space-between", gap: "20px" }}>
                        <View id="left-details" style={{ display: "flex", flexDirection: "column", gap: "5px", width: "100%", padding: "10px", backgroundColor: "#f0f0f0", border: "1px solid #ccc", borderRadius: "5px" }}>
                            <Text style={{ fontSize: "14px", color: colors.colorPrimary, marginBottom: "5px", fontWeight: "bold" }}>Invoice Details:</Text>
                            <Text style={{ fontSize: "10px" }}> <Text style={{ fontWeight: "bold" }}>Invoice Number: </Text>INV-ELEC-20260122-001</Text>
                            <Text style={{ fontSize: "10px" }}> <Text style={{ fontWeight: "bold" }}>Order Number: </Text>ORD-20260122-101</Text>
                            <Text style={{ fontSize: "10px" }}> <Text style={{ fontWeight: "bold" }}>Seller: </Text>Premium Electronics Store</Text>
                            <Text style={{ fontSize: "10px" }}> <Text style={{ fontWeight: "bold" }}>Invoice Date: </Text>22 Jan 2026</Text>
                        </View>

                        <View id="left-details" style={{ display: "flex", flexDirection: "column", gap: "5px", width: "100%", padding: "10px", backgroundColor: "#f0f0f0", border: "1px solid #ccc", borderRadius: "5px" }}>
                            <Text style={{ fontSize: "14px", color: colors.colorPrimary, marginBottom: "5px", fontWeight: "bold" }}>Bill To:</Text>
                            <Text style={{ fontSize: "12px", fontWeight: "bold" }}>John Smith</Text>
                            <Text style={{ fontSize: "10px" }}>john.smith@email.com</Text>
                            <Text style={{ fontSize: "10px" }}>456 Oak Avenue</Text>
                            <Text style={{ fontSize: "10px" }}>Springfield, IL 62701</Text>
                            <Text style={{ fontSize: "10px" }}>jane.doe@acme.co</Text>
                            <Text style={{ fontSize: "10px" }}>(555) 987-6543</Text>

                            <Text style={{ fontSize: "14px", color: colors.colorPrimary, margin: "5px 0", fontWeight: "bold" }}>Ship To:</Text>
                            <Text style={{ fontSize: "12px", fontWeight: "bold" }}>John Smith</Text>
                            <Text style={{ fontSize: "10px" }}>456 Customer Lane</Text>
                            <Text style={{ fontSize: "10px" }}>Manchester, M1 2AB</Text>
                            <Text style={{ fontSize: "10px" }}>United Kingdom</Text>
                        </View>
                    </View>
                    {/* billing section end */}

                    {/* tax information */}
                    <View id="tax-information" style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", gap: "16px", padding: "10px", backgroundColor: "#f9f9f9", margin: "20px", border: `1px solid #ccc`, borderRadius: "5px" }}>
                        <View style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <Text style={{ fontSize: "10px" }}>Store VAT Number</Text>
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
                                <Text style={{ fontWeight: 600 }}>Product / Service</Text>
                            </View>

                            {/* Qty */}
                            <Text style={{ flex: 1, textAlign: "center", fontWeight: 600 }}>
                                Quantity
                            </Text>

                            {/* Unit Price */}
                            <Text style={{ flex: 2, textAlign: "right", fontWeight: 600 }}>
                                Unit Price
                            </Text>

                            {/* Amount */}
                            <Text
                                style={{
                                    flex: 2,
                                    textAlign: "right",
                                    fontWeight: 600,
                                }}
                            >
                                Subtotal
                            </Text>
                            <Text
                                style={{
                                    flex: 2,
                                    textAlign: "right",
                                    fontWeight: 600,
                                }}
                            >
                                Tax Rate
                            </Text>
                            <Text
                                style={{
                                    flex: 2,
                                    textAlign: "right",
                                    fontWeight: 600,
                                }}
                            >
                                Tax Amount
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

                                    {/* Qty */}
                                    <Text style={{ flex: 1, textAlign: "center" }}>
                                        {row.qty}
                                    </Text>

                                    {/* Unit Price */}
                                    <Text style={{ flex: 2, textAlign: "right" }}>
                                        {row.unitPrice}
                                    </Text>

                                    <Text
                                        style={{
                                            flex: 2,
                                            textAlign: "right"
                                        }}
                                    >
                                        {row.subtotal}
                                    </Text>
                                    <Text
                                        style={{
                                            flex: 2,
                                            textAlign: "right"
                                        }}
                                    >
                                        {row.taxRate}
                                    </Text>
                                    <Text
                                        style={{
                                            flex: 2,
                                            textAlign: "right"
                                        }}
                                    >
                                        {row.taxAmount}
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
                                <Text style={{ fontSize: "12px" }}>Items Subtotal:</Text>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", marginLeft: "10px" }}>$1,000.00</Text>
                            </View>
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: "8px" }}>
                                <Text style={{ fontSize: "12px" }}>Tax Subtotal:</Text>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", marginLeft: "10px" }}>$701.25</Text>
                            </View>
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: "8px" }}>
                                <Text style={{ fontSize: "12px" }}>Shipping (Seller Portion):</Text>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", marginLeft: "10px" }}>$0.00</Text>
                            </View>
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", borderTop: `1px solid ${colors.colorPrimary}`, paddingTop: "8px" }}>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", color: colors.colorPrimary }}>Total:</Text>
                                <Text style={{ fontSize: "12px", fontWeight: "bold",color: colors.colorPrimary, marginLeft: "10px" }}>$9,201.25</Text>
                            </View>
                        </View>
                    </View>
                    {/* total section end */}

                    {/* note section start */}
                    <View style={{ padding: "10px", display: "flex", justifyContent: "center", borderLeft: `3px solid ${colors.colorPrimary}`, margin: "20px", backgroundColor: "#f9f9f9" }}>
                        <Text style={{ fontSize: "12px", fontWeight: "bold" }}>
                            Notes: <Text style={{ fontSize: "10px" }}>This invoice covers items sold by Premium Electronics Store. Tax amounts shown are calculated based on applicable VAT/GST rates for the delivery jurisdiction. For questions regarding this invoice, please contact the seller directly.</Text>
                        </Text>
                    </View>
                    {/* note section end */}
                </View>
            </Page>
        </Document>
    );
};

export default Invoice1;