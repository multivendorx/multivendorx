import React from "react";
import { Document, Page, View, Text } from "@react-pdf/renderer";

interface Row {
    description: string;
    billingCycle?: string;
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

const subscriptionInvoice1: React.FC<Props> = ({ invoiceRows, colors }) => {
    const rows: Row[] = invoiceRows || [
        { description: "Pro Seller Plan", billingCycle: "Monthly", amount: "$3,500.00" },
        { description: "Additional Store Profile", billingCycle: "Monthly", amount: "$800.00" },
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
                                <Text style={{ color: "#fff" }}>MS</Text>
                            </View>
                            <View style={{ display: "flex", gap: 5, flexDirection: "column" }}>
                                <Text id='company-name' style={{ fontSize: 20, fontWeight: 600 }} >Marketplace Solutions Inc.</Text>
                                <Text id='address'>789 Commerce Boulevard, Suite 500</Text>
                                <Text id='address'>San Francisco, CA 94102, United States</Text>
                                <Text style={{ fontSize: 12, color: "#555" }}>Tax ID: <Text style={{ fontWeight: 600 }}>US-TAX-123456789</Text></Text>
                                <Text style={{ fontSize: 12, color: "#555" }}>GST/VAT Number: <Text style={{ fontWeight: 600 }}>GST-US-987654321</Text>
                                </Text>
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
                                Subscription Invoice
                            </Text>

                            <Text style={{ fontSize: 12, color: "#555" }}>
                                Invoice #: <Text style={{ fontWeight: 600 }}>SUB-STORE-2026-001</Text>
                            </Text>

                            <Text style={{ fontSize: 12, color: "#555" }}>
                                Issued: <Text style={{ fontWeight: 600 }}>October 9, 2025</Text>
                            </Text>

                            <Text style={{ fontSize: 12, color: "#555" }}>
                                Billing Period: <Text style={{ fontWeight: 600 }}>22 Jan 2026 – 21 Feb 2026</Text>
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

                    {/* billing section start */}
                    <View id="billing-section" style={{ margin: "20px", display: "flex", flexDirection: "row", justifyContent: "space-between", gap: "20px" }}>

                        <View id="left-details" style={{ display: "flex", flexDirection: "column", gap: "5px", width: "100%", padding: "10px", backgroundColor: "#f0f0f0", border: "1px solid #ccc", borderRadius: "5px" }}>
                            <Text style={{ fontSize: "14px", color: colors.colorPrimary, marginBottom: "5px", fontWeight: "bold" }}>Billed To (Store):</Text>
                            <Text style={{ fontSize: "12px", fontWeight: "bold" }}>Premium Electronics Store</Text>
                            <Text style={{ fontSize: "10px" }}> <Text style={{ fontWeight: "bold" }}>Owner: </Text>Sarah Johnson</Text>
                            <Text style={{ fontSize: "10px" }}>123 Seller Street</Text>
                            <Text style={{ fontSize: "10px" }}>New York, NY 10001</Text>
                            <Text style={{ fontSize: "10px" }}>United States</Text>
                            <Text style={{ fontSize: "10px" }}> <Text style={{ fontWeight: "bold" }}>Store Tax ID: </Text>STORE-TAX-567890</Text>
                        </View>

                        <View id="left-details" style={{ display: "flex", flexDirection: "column", gap: "5px", width: "100%", padding: "10px", backgroundColor: "#f0f0f0", border: "1px solid #ccc", borderRadius: "5px" }}>
                            <Text style={{ fontSize: "14px", color: colors.colorPrimary, marginBottom: "5px", fontWeight: "bold" }}>Tax Information:</Text>
                            <Text style={{ fontSize: "10px" }}> <Text style={{ fontWeight: "bold" }}>Tax ID: </Text>US-TAX-123456789</Text>
                            <Text style={{ fontSize: "10px" }}> <Text style={{ fontWeight: "bold" }}>GST/VAT Number: </Text>GST-US-987654321</Text>
                            <Text style={{ fontSize: "10px" }}> <Text style={{ fontWeight: "bold" }}>Business Registration: </Text>BRN-2020-MKT-4567</Text>
                            <Text style={{ fontSize: "10px" }}> <Text style={{ fontWeight: "bold" }}>Tax Jurisdiction: </Text>United States</Text>
                        </View>
                    </View>
                    {/* billing section end */}

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

                            <Text style={{ flex: 2, textAlign: "right", fontWeight: 600 }}>
                                Billing Cycle
                            </Text>

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

                                    {/* Unit Price */}
                                    <Text style={{ flex: 2, textAlign: "right" }}>
                                        {row.billingCycle}
                                    </Text>

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

                        <View style={{ border: "1px solid #ccc", borderRadius: "5px", padding: "10px", backgroundColor: "#f9f9f9", width: "60%", alignSelf: "flex-end", marginLeft: "auto" }}>
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: "8px" }}>
                                <Text style={{ fontSize: "12px" }}>Subscription Subtotal:</Text>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", marginLeft: "10px" }}>$59.00</Text>
                            </View>
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: "8px" }}>
                                <Text style={{ fontSize: "12px" }}>Platform Tax (GST/VAT @ 18%):</Text>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", marginLeft: "10px" }}>$10.62</Text>
                            </View>
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", borderTop: `1px solid ${colors.colorPrimary}`, paddingTop: "8px" }}>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", color: colors.colorPrimary }}>Total Payable:</Text>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", color: colors.colorPrimary, marginLeft: "10px" }}>$69.62</Text>
                            </View>
                        </View>
                    </View>
                    {/* total section end */}


                    {/* tax information */}
                    <View id="tax-information" style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", gap: "16px", padding: "10px", backgroundColor: "#f9f9f9", margin: "20px", border: `1px solid #ccc`, borderRadius: "5px" }}>
                        <View style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <Text style={{ fontSize: "10px" }}>Payment Method</Text>
                            <Text style={{ fontSize: "10px", fontWeight: "bold" }}>Credit Card ****5678</Text>
                        </View>
                        <View style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <Text style={{ fontSize: "10px" }}>Transaction ID</Text>
                            <Text style={{ fontSize: "10px", fontWeight: "bold" }}>TXN-20260122-ABC123</Text>
                        </View>
                        <View style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <Text style={{ fontSize: "10px" }}>Payment Date</Text>
                            <Text style={{ fontSize: "10px", fontWeight: "bold" }}>22 Jan 2026</Text>
                        </View>
                        <View style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <Text style={{ fontSize: "10px" }}>Auto-Renewal Status</Text>
                            <Text style={{ fontSize: "10px", fontWeight: "bold", color: "#1bc006ff", backgroundColor: "#00ff221f", padding: "2px 6px", borderRadius: "3px", textAlign: "center" }}>Enabled</Text>
                        </View>
                    </View>
                    {/* tax information end*/}

                    {/* note section start */}
                    <View style={{ padding: "10px", display: "flex", justifyContent: "center", borderLeft: `3px solid ${colors.colorPrimary}`, margin: "20px", backgroundColor: "#f9f9f9" }}>
                        <Text style={{ fontSize: "12px", fontWeight: "bold" }}>
                            Notes: <Text style={{ fontSize: "10px" }}>This invoice covers marketplace subscription services for the billing period indicated above. Your subscription will automatically renew unless cancelled before the next billing date.</Text>
                        </Text>
                    </View>
                    {/* note section end */}
                </View>
            </Page>
        </Document>
    );
};

export default subscriptionInvoice1;
