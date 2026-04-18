import React from 'react';
import { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';

type Row = {
    seller: string;
    product: string;
    qty: number;
    unitPrice: number;
    subtotal: number;
    tax: number;
    total: number;
};

interface Props {
    invoiceRows?: Row[];
    colors: {
        colorPrimary: string;
        colorSecondary: string;
        colorAccent: string;
        colorSupport: string;
    };
    logoUrl?: string;
    productImages?: Array<{
        productName: string;
        imageUrl: string;
    }>;
    showProductImages?: boolean;
}

const LuxeDisplay: React.FC<Props> = ({
    invoiceRows,
    colors,
}) => {
    const rows: Row[] = invoiceRows || [
        {
            seller: 'Premium Electronics',
            product: 'Widget A - Premium Edition',
            qty: 2,
            unitPrice: 50,
            subtotal: 100,
            tax: 10,
            total: 110,
        },
        {
            seller: 'Premium Electronics',
            product: 'Widget B - Deluxe Model',
            qty: 1,
            unitPrice: 75,
            subtotal: 75,
            tax: 7.5,
            total: 82.5,
        },
        {
            seller: 'Tech Accessories Co',
            product: 'Premium USB Cable',
            qty: 2,
            unitPrice: 15,
            subtotal: 30,
            tax: 3,
            total: 33,
        },
    ];

    const createStyles = (colors: Props['colors']) => StyleSheet.create({
        page: {
            fontSize: 12,
            fontFamily: 'Helvetica',
            backgroundColor: '#fff',
            position: 'relative',
            padding: 0,
            margin: 0
        },
        boldText:{
            fontWidth: 600,
            margin: 0,
        },
        // header start
        header: {
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'row',
            paddingTop: 30,
            paddingBottom: 30,
            marginLeft: 20,
            marginRight: 20,
            borderBottom: `0.188rem solid ${colors.colorPrimary}`,
        },
        headerTitle: {
            fontSize: 30,
            fontWeight: 600,
        },
        // header start

        // details start
        detailsWrapper: {
            display: 'flex',
            flexDirection: 'row',
            margin: 20
        },
        details: {
            width: '50%',
            display: 'flex',
            flexDirection: 'column'
        },
        detailsTitle: {
            fontSize: 18,
            fontWeight: 500,
            color: colors.colorSecondary,
            paddingBottom: 5
        },
        detailsValue: {
            fontSize: 14,
            fontWeight: 600
        }
        // details end
    });

    const styles = createStyles(colors);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header*/}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>INVOICE</Text>
                </View>

                {/* details section */}
                <View style={styles.detailsWrapper}>
                    <View style={styles.details}>
                        <Text style={styles.detailsTitle}>Invoice Details</Text>
                        <Text style={styles.detailsValue}> <Text style={styles.boldText}>Invoice No: </Text>  201815311526476267</Text>
                        <Text style={styles.detailsValue}> <Text style={styles.boldText}>Invoice No: </Text>  201815311526476267</Text>
                        <Text style={styles.detailsValue}> <Text style={styles.boldText}>Invoice No: </Text>  201815311526476267</Text>
                        <Text style={styles.detailsValue}> <Text style={styles.boldText}>Invoice No: </Text>  201815311526476267</Text>
                    </View>
                    <View style={styles.details}>
                        <Text style={styles.detailsTitle}>Invoice Details</Text>
                        <Text style={styles.detailsValue}> <Text style={styles.boldText}>Invoice No: </Text>  201815311526476267</Text>
                        <Text style={styles.detailsValue}> <Text style={styles.boldText}>Invoice No: </Text>  201815311526476267</Text>
                        <Text style={styles.detailsValue}> <Text style={styles.boldText}>Invoice No: </Text>  201815311526476267</Text>
                        <Text style={styles.detailsValue}> <Text style={styles.boldText}>Invoice No: </Text>  201815311526476267</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default LuxeDisplay;