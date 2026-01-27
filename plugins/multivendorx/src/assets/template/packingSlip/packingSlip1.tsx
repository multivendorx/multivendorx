import React from "react";
import { Document, Page, View, Text, Svg, Path } from "@react-pdf/renderer";

type Row = {
    productName: string;
    sku: string;
    qty: number;
    location: string;
};

interface Props {
    invoiceRows?: Row[];
    colors: {
        colorPrimary: string;
        colorSecondary: string;
        colorAccent: string;
        colorSupport: string;
    };
}

const packingSlip1: React.FC<Props> = ({ invoiceRows, colors }) => {
    const rows: Row[] = invoiceRows || [
        {
            productName: "Widget A - Premium Edition (Color: Black | Size: Large)",
            sku: "SKU-WA-001",
            qty: 2,
            location: "Shelf A3",
        },
        {
            productName: "Widget B - Deluxe Model (Color: Silver | Size: Medium)",
            sku: "SKU-WB-002",
            qty: 1,
            location: "Shelf B7",
        },
        {
            productName: "Premium USB Cable (Length: 2m | Type: USB-C)",
            sku: "SKU-CAB-015",
            qty: 2,
            location: "Shelf C2",
        },
    ];
    const RightArrowIcon = ({ color = "#000" }) => (
        <Svg width={10} height={10} viewBox="0 0 24 24">
            <Path
                d="M10 17l5-5-5-5v10z"
                fill={color}
            />
        </Svg>
    );

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
                                <Text style={{ color: "#fff" }}>PE</Text>
                            </View>
                            <View style={{ display: "flex", gap: 5, flexDirection: "column" }}>
                                <Text id='company-name' style={{ fontSize: 20, fontWeight: 600 }} >Premium Electronics Store</Text>
                                {/* <Text id='address'>789 Commerce Boulevard, Suite 500</Text>
                                <Text id='address'>San Francisco, CA 94102, United States</Text>
                                <Text style={{ fontSize: 12, color: "#555" }}>Tax ID: <Text style={{ fontWeight: 600 }}>US-TAX-123456789</Text></Text>
                                <Text style={{ fontSize: 12, color: "#555" }}>GST/VAT Number: <Text style={{ fontWeight: 600 }}>GST-US-987654321</Text>
                                </Text> */}
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
                                PACKING SLIP
                            </Text>

                            <Text style={{ fontSize: 12, color: "#555" }}>
                                Order Date: <Text style={{ fontWeight: 600 }}>22 Jan 2026</Text>
                            </Text>

                            <Text style={{ fontSize: 12, color: "#555" }}>
                                Ship Date: <Text style={{ fontWeight: 600 }}>23 Jan 2026</Text>
                            </Text>

                            <Text style={{ fontSize: 12, color: "#555" }}>
                                Total Items: <Text style={{ fontWeight: 600 }}>3 Items</Text>
                            </Text>
                            <Text style={{ fontSize: 12, color: "#555" }}>
                                Total Quantity: <Text style={{ fontWeight: 600 }}>5 Units</Text>
                            </Text>
                        </View> {/* right section end */}
                    </View>
                    {/* header end*/}

                    {/* billing section start */}
                    <View id="billing-section" style={{ margin: "20px", display: "flex", flexDirection: "row", justifyContent: "space-between", gap: "20px" }}>

                        <View id="left-details" style={{ display: "flex", flexDirection: "column", gap: "5px", width: "100%", padding: "10px", backgroundColor: "#f0f0f0", border: "1px solid #ccc", borderRadius: "5px" }}>
                            <Text style={{ fontSize: "14px", color: colors.colorPrimary, marginBottom: "5px", fontWeight: "bold" }}>Ship From:</Text>
                            <Text style={{ fontSize: "12px", fontWeight: "bold" }}>Premium Electronics Store</Text>
                            <Text style={{ fontSize: "10px" }}> <Text style={{ fontWeight: "bold" }}>Owner: </Text>Sarah Johnson</Text>
                            <Text style={{ fontSize: "10px" }}>123 Seller Street</Text>
                            <Text style={{ fontSize: "10px" }}>New York, NY 10001</Text>
                            <Text style={{ fontSize: "10px" }}>United States</Text>
                        </View>

                        <View id="left-details" style={{ display: "flex", flexDirection: "column", gap: "5px", width: "100%", padding: "10px", backgroundColor: "#f0f0f0", border: "1px solid #ccc", borderRadius: "5px" }}>
                            <Text style={{ fontSize: "14px", color: colors.colorPrimary, marginBottom: "5px", fontWeight: "bold" }}>Ship To:</Text>
                            <Text style={{ fontSize: "12px", fontWeight: "bold" }}>John Smith</Text>
                            <Text style={{ fontSize: "10px" }}>123 Seller Street</Text>
                            <Text style={{ fontSize: "10px" }}>New York, NY 10001</Text>
                            <Text style={{ fontSize: "10px" }}>United States</Text>
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
                                <Text style={{ fontWeight: 600 }}>Product Name</Text>
                            </View>

                            <Text style={{ flex: 2, textAlign: "right", fontWeight: 600 }}>
                                SKU
                            </Text>

                            <Text
                                style={{
                                    flex: 2,
                                    textAlign: "right",
                                    fontWeight: 600,
                                }}
                            >
                                Qty
                            </Text>
                            <Text style={{ flex: 2, textAlign: "right", fontWeight: 600 }}>
                                Location
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
                                        <Text>{row.productName}</Text>
                                    </View>

                                    {/* Unit Price */}
                                    <Text style={{ flex: 2, textAlign: "right" }}>
                                        {row.sku}
                                    </Text>

                                    {/* Amount */}
                                    <Text
                                        style={{
                                            flex: 2,
                                            textAlign: "right"
                                        }}
                                    >
                                        {row.qty}
                                    </Text>
                                    <Text style={{ flex: 2, textAlign: "right" }}>
                                        {row.location}
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
                                <Text style={{ fontSize: "12px" }}>Total Items:</Text>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", marginLeft: "10px" }}>3 Items</Text>
                            </View>
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: "8px" }}>
                                <Text style={{ fontSize: "12px" }}>Total Quantity:</Text>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", marginLeft: "10px" }}>5 Units</Text>
                            </View>
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: "8px" }}>
                                <Text style={{ fontSize: "12px" }}>Shipping Method:</Text>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", marginLeft: "10px" }}>Standard Delivery (3-5 days)</Text>
                            </View>
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: "8px" }}>
                                <Text style={{ fontSize: "12px" }}>Tracking Number:</Text>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", marginLeft: "10px" }}>TRK-GB-20260123-987654</Text>
                            </View>
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", borderTop: `1px solid ${colors.colorPrimary}`, paddingTop: "8px" }}>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", color: colors.colorPrimary }}>Total Weight:</Text>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", color: colors.colorPrimary, marginLeft: "10px" }}>2.5 kg</Text>
                            </View>
                        </View>
                    </View>
                    {/* total section end */}

                    {/* packing instructions start */}
                    <View
                        style={{
                            margin: "20px",
                            padding: "12px",
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                            backgroundColor: "#f9f9f9",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: colors.colorPrimary,
                                marginBottom: 8,
                            }}
                        >
                            Packing Instructions
                        </Text>

                        <View style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 6 }}>
                                <RightArrowIcon color={colors.colorPrimary} />
                                <Text style={{ fontSize: 11 }}>Verify all items against this packing slip</Text>
                            </View>

                            <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 6 }}>
                                <RightArrowIcon color={colors.colorPrimary} />
                                <Text style={{ fontSize: 11 }}>Check product condition before packing</Text>
                            </View>

                            <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 6 }}>
                                <RightArrowIcon color={colors.colorPrimary} />
                                <Text style={{ fontSize: 11 }}>Use appropriate packaging materials for fragile items</Text>
                            </View>

                            <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 6 }}>
                                <RightArrowIcon color={colors.colorPrimary} />
                                <Text style={{ fontSize: 11 }}>Include this packing slip in the package</Text>
                            </View>

                            <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 6 }}>
                                <RightArrowIcon color={colors.colorPrimary} />
                                <Text style={{ fontSize: 11 }}>Attach shipping label securely</Text>
                            </View>
                        </View>
                    </View>
                    {/* packing instructions end */}
                </View>
            </Page>
        </Document>
    );
};

export default packingSlip1;
