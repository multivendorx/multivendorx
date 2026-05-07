import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
interface Props {
	colors: {
		colorPrimary: string;
		colorSecondary: string;
		colorAccent: string;
		colorSupport: string;
	};
}

const Default: React.FC<Props> = ({ colors }) => {
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
						<Text style={styles.boxTitle}>Ship From:</Text>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>Premium Electronics Store</Text>
						</View>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}>123 Seller Street</Text>
						</View>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}>123 Seller Street</Text>
						</View>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>Owner:</Text>
							<Text style={styles.detailsValue}>Sarah Johnson</Text>
						</View>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>Phone:</Text>
							<Text style={styles.detailsValue}>91 9874623146</Text>
						</View>
					</View>

					<View style={styles.box}>
						<Text style={styles.boxTitle}>Ship To:</Text>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>John Smith</Text>
						</View>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}>123 Seller Street</Text>
						</View>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>Phone:</Text>
							<Text style={styles.detailsValue}>91 9874623146</Text>
						</View>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}>123 Seller Street</Text>
						</View>
					</View>
				</View>
				{/* billing section end */}

				{/* table section start */}
				<View style={styles.table}>
					<View style={styles.tableHeader}>
						<View style={{ flex: 3 }}>
							<Text style={styles.tableHeaderText}> Product Name</Text>
						</View>
						<View style={{ flex: 1 }}>
							<Text style={styles.tableHeaderText}> SKU</Text>
						</View>
						<View style={{ flex: 1 }}>
							<Text style={styles.tableHeaderText}> Unit Price</Text>
						</View>
						<View style={{ flex: 1 }}>
							<Text style={styles.tableHeaderText}> QTY</Text>
						</View>
						<View style={{ flex: 1 }}>
							<Text style={styles.tableHeaderText}> Total</Text>
						</View>
					</View>
					{Array.from({ length: 6 }).map((_, index) => (
						<View style={styles.tableRow}>
							<View style={{ flex: 3 }}>
								<Text style={styles.tableRowText}>Product {index}</Text>
							</View>
							<View style={{ flex: 1 }}>
								<Text style={styles.tableRowText}>SKU-000{index}</Text>
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
					))}
				</View>
				{/* table section end  */}
			</Page>
		</Document >
	);
};

export default Default;
