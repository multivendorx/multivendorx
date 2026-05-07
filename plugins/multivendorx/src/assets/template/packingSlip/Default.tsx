import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { __ } from '@wordpress/i18n';

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

const Default: React.FC<Props> = ({ invoiceRows, colors }) => {
	const rows: Row[] = invoiceRows || [
		{
			productName:
				'Widget A - Premium Edition (Color: Black | Size: Large)',
			sku: 'SKU-WA-001',
			qty: 2,
			location: 'Shelf A3',
		},
		{
			productName:
				'Widget B - Deluxe Model (Color: Silver | Size: Medium)',
			sku: 'SKU-WB-002',
			qty: 1,
			location: 'Shelf B7',
		},
		{
			productName: 'Premium USB Cable (Length: 2m | Type: USB-C)',
			sku: 'SKU-CAB-015',
			qty: 2,
			location: 'Shelf C2',
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
		boldText: {
			fontWeight: 600,
			fontSize: 11,
			margin: 0,
		},
		flexEnd: {
			display: 'flex',
			justifyContent: 'flex-end',
			margin: 20,
		},
		// box details
		boxDetails: {
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'space-between',
			gap: 15,
			padding: 20,
		},
		box: {
			display: 'flex',
			flexDirection: 'column',
			gap: 5,
			width: '100%',
			borderRadius: 5,
		},
		boxTitle: {
			fontSize: 14,
			marginBottom: 5,
			fontWeight: 'bold',
		},
		boxValueWrapper: {
			display: 'flex',
			flexDirection: 'row',
		},
		detailsValue: {},

		// table start
		table: {
			display: 'flex',
			flexDirection: 'column',
			gap: 10,
			margin: 20,
		},
		tableHeader: {
			display: 'flex',
			flexDirection: 'row',
		},
		tableHeaderText: {
			fontWeight: 600,
		},
		tableRow: {
			display: 'flex',
			flexDirection: 'row',
			borderTop: '0.063rem solid #eee',
		},
		tableRowText: {
			padding: 8,
		}
	});
	const styles = createStyles(colors);
	return (
		<Document>
			<Page size="A4" style={styles.page}>
				{/* billing section start */}
				<View style={styles.boxDetails}>
					<View style={styles.box}>
						<Text style={styles.boxTitle}>{__('Ship From:', 'multivendorx')}</Text>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>{__('Premium Electronics Store', 'multivendorx')}</Text>
						</View>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}>{__('123 Seller Street', 'multivendorx')}</Text>
						</View>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}>{__('123 Seller Street', 'multivendorx')}</Text>
						</View>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>{__('Owner:', 'multivendorx')}</Text>
							<Text style={styles.detailsValue}>{__('Sarah Johnson', 'multivendorx')}</Text>
						</View>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>{__('Phone:', 'multivendorx')}</Text>
							<Text style={styles.detailsValue}>{__('91 9874623146', 'multivendorx')}</Text>
						</View>
					</View>

					<View style={styles.box}>
						<Text style={styles.boxTitle}>{__('Ship To:', 'multivendorx')}</Text>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>{__('John Smith', 'multivendorx')}</Text>
						</View>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}>{__('123 Seller Street', 'multivendorx')}</Text>
						</View>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>{__('Phone:', 'multivendorx')}</Text>
							<Text style={styles.detailsValue}>{__('91 9874623146', 'multivendorx')}</Text>
						</View>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}>{__('123 Seller Street', 'multivendorx')}</Text>
						</View>
					</View>
				</View>
				{/* billing section end */}

				{/* table section start */}
				<View style={styles.table}>
					<View style={styles.tableHeader}>
						<View style={{ flex: 3 }}>
							<Text style={styles.tableHeaderText}> {__('Product Name', 'multivendorx')}</Text>
						</View>
						<View style={{ flex: 1 }}>
							<Text style={styles.tableHeaderText}> {__('SKU', 'multivendorx')}</Text>
						</View>
						<View style={{ flex: 1 }}>
							<Text style={styles.tableHeaderText}> {__('Unit Price', 'multivendorx')}</Text>
						</View>
						<View style={{ flex: 1 }}>
							<Text style={styles.tableHeaderText}> {__('QTY', 'multivendorx')}</Text>
						</View>
						<View style={{ flex: 1 }}>
							<Text style={styles.tableHeaderText}> {__('Total', 'multivendorx')}</Text>
						</View>
					</View>
					{rows.map((row, index) => {
						return (
							<View style={styles.tableRow}>
								<View style={{ flex: 3 }}>
									<Text style={styles.tableRowText}>{row.productName}</Text>
								</View>
								<View style={{ flex: 1 }}>
									<Text style={styles.tableRowText}>{row.sku}</Text>
								</View>
								<View style={{ flex: 1 }}>
									<Text style={styles.tableRowText}>$250</Text>
								</View>
								<View style={{ flex: 1 }}>
									<Text style={styles.tableRowText}>$250</Text>
								</View>
								<View style={{ flex: 1 }}>
									<Text style={styles.tableRowText}>$250</Text>
								</View>
							</View>
						);
					})}
				</View>
				{/* table section end  */}
			</Page>
		</Document >
	);
};

export default Default;
