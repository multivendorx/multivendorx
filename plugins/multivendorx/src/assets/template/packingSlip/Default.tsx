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
			fontSize: 14,
			margin: 0,
		},

		header: {
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			flexDirection: 'row',
			margin: 20,
		},
		headerTitle: {
			fontSize: 32,
			color: '#1e2a38',
			fontWeight: 'bold',
		},
		headerRight: {
			textAlign: 'right',
			fontSize: 14,
			color: '#555',
			display: 'flex',
			flexDirection: 'column',
		},
		headerDetails: {
			display: 'flex',
			flexDirection: 'row',
		},
		// boxDetails start
		boxDetails: {
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'space-between',
			margin: 20,
		},
		box: {
			display: 'flex',
			flexDirection: 'column',
			gap: 8,
		},
		boxTitle: {
			fontSize: 16,
			marginBottom: 8,
			color: '#1e2a38',
			fontWeight: 'bold',
		},
		boxValueWrapper: {
			display: 'flex',
			flexDirection: 'row',
		},
		detailsValue: {
			fontSize: 14,
			color: '#555'
		},

		// table start
		table: {
			display: 'flex',
			flexDirection: 'column',
			margin: 20,
		},
		tableHeader: {
			display: 'flex',
			flexDirection: 'row',
			backgroundColor: '#f7f8fa',
			padding: 10,
		},
		tableHeaderText: {
			fontWeight: 600,
			color: '#1e2a38',
		},
		tableRow: {
			display: 'flex',
			flexDirection: 'row',
			padding: 15,
			borderBottom: '1px solid #eaeaea',
		},
		tableRowText: {
			fontSize: 14,
			color: '#555'
		},
		// total section 
		totalSection: {
			display: 'flex',
			justifyContent: 'flex-end',
			alignItems: 'flex-end',
			flexDirection: 'column',
			margin: 20,
		},
		totalDetails: {
			width: 300,
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'space-between',
			paddingTop: 12,
		},
		subTotal: {
			fontSize: 15,
			color: '#1e2a38',
		},
		totalWrapper: {
			width: 300,
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'space-between',
			borderTop: `0.125rem solid #61666bff`,
			paddingTop: 10,
			marginTop: 10,
		},
		total: {
			fontSize: 16,
			fontWeight: 600,
			color: '#1e2a38',
		},

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
							<Text style={styles.tableHeaderText}> QTY</Text>
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
								<Text style={styles.tableRowText}>6</Text>
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
