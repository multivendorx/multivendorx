import React from 'react';
import { Document, Page, View, Text, Svg, Path } from '@react-pdf/renderer';

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

	return (
		<Document>
			<Page
				size="A4"
				style={{
					fontSize: 12,
					fontFamily: 'Helvetica',
					backgroundColor: '#fff',
					position: 'relative',
				}}
			>
				<View>
					{/* billing section start */}
					<View
						id="billing-section"
						style={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
							gap: '15px',
							padding: '20px',							
						}}
					>
						<View
							id="left-details"
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: '5px',
								width: '100%',
								borderRadius: '5px',
							}}
						>
							<Text
								style={{
									fontSize: '14px',
									marginBottom: '5px',
									fontWeight: 'bold',
								}}
							>
								Ship From:
							</Text>
							<Text
								style={{ fontSize: '12px', fontWeight: 'bold' }}
							>
								Premium Electronics Store
							</Text>
							<Text style={{ fontSize: '10px' }}>
								{' '}
								<Text style={{ fontWeight: 'bold' }}>
									Owner:{' '}
								</Text>
								Sarah Johnson
							</Text>
							<Text style={{ fontSize: '10px' }}>
								123 Seller Street
							</Text>
							<Text style={{ fontSize: '10px' }}>
								{' '}
								<Text style={{ fontWeight: 'bold' }}>
									Phone:{' '}
								</Text>
								91 9874623146
							</Text>
						</View>

						<View
							id="left-details"
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: '5px',
								width: '100%',
								borderRadius: '5px',
							}}
						>
							<Text
								style={{
									fontSize: '14px',
									marginBottom: '5px',
									fontWeight: 'bold',
								}}
							>
								Ship To:
							</Text>
							<Text
								style={{ fontSize: '12px', fontWeight: 'bold' }}
							>
								John Smith
							</Text>
							<Text style={{ fontSize: '10px' }}>
								123 Seller Street
							</Text>
							<Text style={{ fontSize: '10px' }}>
								{' '}
								<Text style={{ fontWeight: 'bold' }}>
									Phone:{' '}
								</Text>
								91 9874623146
							</Text>
						</View>
					</View>
					{/* billing section end */}


					{/* table section start */}
					<View
						id="invoice-table-wrapper"
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: '10px',
							margin: '20px',
						}}
					>
						<View
							id="invoice-table-header"
							style={{
								display: 'flex',
								flexDirection: 'row',
							}}
						>
							{/* Description */}
							<View style={{ flex: 4 }}>
								<Text style={{ fontWeight: 600 }}>
									Product Name
								</Text>
							</View>

							<Text
								style={{
									flex: 2,
									textAlign: 'right',
									fontWeight: 600,
								}}
							>
								SKU
							</Text>
							<Text
								style={{
									flex: 2,
									textAlign: 'right',
									fontWeight: 600,
								}}
							>
								Unit Price
							</Text>
							<Text
								style={{
									flex: 2,
									textAlign: 'right',
									fontWeight: 600,
								}}
							>
								Qty
							</Text>
							<Text
								style={{
									flex: 2,
									textAlign: 'right',
									fontWeight: 600,
								}}
							>
								Total
							</Text>
						</View>
						{rows.map((row, index) => {
							return (
								<View
									id="invoice-table-row"
									key={index}
									style={{
										display: 'flex',
										flexDirection: 'row',
										borderTop: '1px solid #eee',
									}}
								>
									{/* Description */}
									<View style={{ flex: 4 }}>
										<Text>{row.productName}</Text>
									</View>

									{/* Unit Price */}
									<Text
										style={{ flex: 2, textAlign: 'right' }}
									>
										{row.sku}
									</Text>
									<Text
										style={{
											flex: 2,
											textAlign: 'right',
										}}
									>
										$250
									</Text>
									{/* Amount */}
									<Text
										style={{
											flex: 2,
											textAlign: 'right',
										}}
									>
										{row.qty}
									</Text>
									<Text
										style={{
											flex: 2,
											textAlign: 'right',
										}}
									>
										$250
									</Text>
								</View>
							);
						})}
					</View>
					{/* table section end  */}
				</View>
			</Page>
		</Document>
	);
};

export default packingSlip1;
