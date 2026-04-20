import React from 'react';
import { Document, Page, View, Text } from '@react-pdf/renderer';

interface Row {
	description: string;
	qty?: number | string;
	unitPrice?: string;
	subtotal?: string;
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

const Default: React.FC<Props> = ({ invoiceRows, colors }) => {
	const rows: Row[] = invoiceRows || [
		{
			description: 'Product A',
			qty: 2,
			unitPrice: '$250.00',
			subtotal: '$500.00',
		},
		{
			description: 'Product B',
			qty: 1,
			unitPrice: '$850.00',
			subtotal: '$850.00',
		},
	];

	return (
		<Document>
			<Page
				size="A4"
				style={{
					fontSize: 12,
					fontFamily: 'Helvetica',
					backgroundColor: '#fff'
				}}
			>
				{/* Header start */}
				<View
					id="invoice-header"
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						flexDirection: 'row',
						margin: 20,
					}}
				>
					<Text
						style={{
							fontSize: 32,
							color: '#1e2a38',
							fontWeight: 'bold',
						}}
					>
						INVOICE
					</Text>

					<View
						id="company-details"
						style={{
							textAlign: 'right',
							fontSize: 14,
							color: '#555',
                            display: 'flex',
							flexDirection: 'column',
						}}
					>
						<Text style={{ fontWeight: 'bold' }}>
							Your Company Name
						</Text>
						<Text>123 Business Street</Text>
						<Text>City, State, ZIP</Text>
						<Text>Email: info@company.com</Text>
					</View>
				</View>
				{/* Header end */}

				{/* Invoice Info Section start */}
				<View
					id="invoice-info"
					style={{
						display: 'flex',
						flexDirection: 'row',
						justifyContent: 'space-between',
						margin: 20,
					}}
				>
					<View
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: 8,
						}}
					>
						<Text
							style={{
								fontSize: 16,
								marginBottom: 8,
								color: '#1e2a38',
								fontWeight: 'bold',
							}}
						>
							Invoice To:
						</Text>
						<Text style={{ fontSize: 14, color: '#555' }}>
							ABC Infotech
						</Text>
						<Text style={{ fontSize: 14, color: '#555' }}>
							BB-164, BB Block, Sector 1
						</Text>
						<Text style={{ fontSize: 14, color: '#555' }}>
							Salt Lake City, Kolkata
						</Text>
					</View>

					<View
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: 8,
						}}
					>
						<Text
							style={{
								fontSize: 16,
								marginBottom: 8,
								color: '#1e2a38',
								fontWeight: 'bold',
							}}
						>
							Invoice Details:
						</Text>
						<Text style={{ fontSize: 14, color: '#555' }}>
							Invoice No: 201815311526476267
						</Text>
						<Text style={{ fontSize: 14, color: '#555' }}>
							Invoice Date: May 16, 2018
						</Text>
						<Text style={{ fontSize: 14, color: '#555' }}>
							Order Number: 2015
						</Text>
						<Text style={{ fontSize: 14, color: '#555' }}>
							Order Date: 01/03/2018
						</Text>
						<Text style={{ fontSize: 14, color: '#555' }}>
							Payment Method: Cash on Delivery
						</Text>
					</View>
				</View>
				{/* Invoice Info Section end */}

				{/* Table Section start */}
				<View
					id="invoice-table-wrapper"
					style={{
						display: 'flex',
						flexDirection: 'column',
						margin: 20,
					}}
				>
					{/* Table Header */}
					<View
						id="invoice-table-header"
						style={{
							display: 'flex',
							flexDirection: 'row',
							backgroundColor: '#f7f8fa',
							paddingVertical: 15,
							paddingHorizontal: 10,
						}}
					>
						<View style={{ flex: 3 }}>
							<Text
								style={{
									fontWeight: 600,
									color: '#1e2a38',
								}}
							>
								Item
							</Text>
						</View>
						<View style={{ flex: 1 }}>
							<Text
								style={{
									fontWeight: 600,
									color: '#1e2a38',
								}}
							>
								Quantity
							</Text>
						</View>
						<View style={{ flex: 1.5 }}>
							<Text
								style={{
									fontWeight: 600,
									color: '#1e2a38',
								}}
							>
								Price
							</Text>
						</View>
						<View style={{ flex: 1.5 }}>
							<Text
								style={{
									fontWeight: 600,
									color: '#1e2a38',
									textAlign: 'right',
								}}
							>
								Total
							</Text>
						</View>
					</View>

					{/* Table Rows */}
					{rows.map((row, index) => {
						// Calculate total if not provided
						const qty = typeof row.qty === 'number' ? row.qty : parseFloat(row.qty as string) || 0;
						const price = parseFloat(row.unitPrice?.replace('$', '').replace(',', '') || '0');
						const total = row.subtotal || `$${(qty * price).toFixed(2)}`;
						
						return (
							<View
								key={index}
								style={{
									display: 'flex',
									flexDirection: 'row',
									padding: 15,
									borderBottom: '1px solid #eaeaea',
								}}
							>
								<View style={{ flex: 3 }}>
									<Text style={{ fontSize: 14, color: '#555' }}>
										{row.description}
									</Text>
								</View>
								<View style={{ flex: 1 }}>
									<Text style={{ fontSize: 14, color: '#555' }}>
										{row.qty}
									</Text>
								</View>
								<View style={{ flex: 1.5 }}>
									<Text style={{ fontSize: 14, color: '#555' }}>
										{row.unitPrice}
									</Text>
								</View>
								<View style={{ flex: 1.5 }}>
									<Text
										style={{
											fontSize: 14,
											color: '#555',
											textAlign: 'right',
										}}
									>
										{total}
									</Text>
								</View>
							</View>
						);
					})}
				</View>
				{/* Table Section end */}

				{/* Total Section start */}
				<View
					id="total-section"
					style={{
						display: 'flex',
						justifyContent: 'flex-end',
                        alignItems: 'flex-end',
                        flexDirection: 'column',
						margin: 20,
					}}
				>
                    <View
						style={{
							width: 300,
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
							paddingTop: 12,
						}}
					>
						<Text
							style={{
								fontSize: 15,
								color: '#1e2a38',
							}}
						>
							total:
						</Text>
						<Text
							style={{
								fontSize: 15,
								color: '#1e2a38',
							}}
						>
							$1,350.00
						</Text>
					</View>
                    <View
						style={{
							width: 300,
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
							paddingTop: 12,
                            marginBottom: 5,
						}}
					>
						<Text
							style={{
								fontSize: 15,
								color: '#1e2a38',
							}}
						>
							total:
						</Text>
						<Text
							style={{
								fontSize: 15,
								color: '#1e2a38',
							}}
						>
							$1,350.00
						</Text>
					</View>
					<View
						style={{
							width: 300,
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
							borderTop: `2px solid #1e2a38`,
							paddingTop: 12,
						}}
					>
						<Text
							style={{
								fontSize: 16,
								fontWeight: 600,
								color: '#1e2a38',
							}}
						>
							Subtotal:
						</Text>
						<Text
							style={{
								fontSize: 16,
								fontWeight: 600,
								color: '#1e2a38',
							}}
						>
							$1,350.00
						</Text>
					</View>
				</View>
				{/* Total Section end */}
			</Page>
		</Document>
	);
};

export default Default;