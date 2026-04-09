/* global appLocalizer */
import {
	BasicInputUI,
	Card,
	Column,
	Container,
	DynamicRowSetting,
	FormGroup,
	FormGroupWrapper,
	NavigatorHeader,
	SelectInputUI,
	ChoiceToggleUI,
	TextAreaUI,
	CalendarInputUI,
} from 'zyra';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';

const AddAppointment = () => {
	const [formData, setFormData] = useState({
		quantity: '',
		distance_unit: 'kilometer',
		distance_price: '',
		hourly_price_type: '1',
		duration: '1_hour',
		repeat: 'none',
		hourly_price: '',
		distance_rules: [],
	});

	const setPriceType = [
		{ label: 'store1', value: '1', customers: '5' },
		{ label: 'store2', value: '2', customers: '3' },
		{ label: 'store3', value: '2', customers: '3' },
		{ label: 'store4', value: '2', customers: '3' },
		{ label: 'store5', value: '2', customers: '3' },
	];

	const durationOptions = [
		{ label: '30 minutes', value: '30_min' },
		{ label: '1 hour', value: '1_hour' },
		{ label: '1.5 hours', value: '1_5_hour' },
		{ label: '2 hours', value: '2_hour' },
		{ label: 'Custom', value: 'custom' },
	];

	const repeatOptions = [
		{ label: 'Does not repeat', value: 'none' },
		{ label: 'Daily', value: 'daily' },
		{ label: 'Weekly', value: 'weekly' },
		{ label: 'Monthly', value: 'monthly' },
	];
	const handleChange = (key: string, value) => {
		const updated = { ...formData, [key]: value };
		setFormData(updated);
	};

	return (
		<>
			<NavigatorHeader
				headerTitle={__('Add New Appointment', 'multivendorx-pro')}
				headerDescription={__(
					'Fill in the details below to create a new appointment.',
					'multivendorx-pro'
				)}
			/>

			<Container general>
				<Column grid={6}>
					<Card title={__('Product & Customer', 'multivendorx-pro')}>
						<FormGroupWrapper>
							<FormGroup
								row
								label={__('Product *', 'multivendorx-pro')}
							>
								<BasicInputUI type="number" />
							</FormGroup>
							<FormGroup
								row
								label={__('Customer *', 'multivendorx-pro')}
							>
								<BasicInputUI type="text" />
							</FormGroup>
							<FormGroup
								row
								label={__('Staff Member', 'multivendorx-pro')}
							>
								<SelectInputUI
									name="type"
									size="15rem"
									options={setPriceType}
									value={formData.hourly_price_type}
									onChange={(val) =>
										handleChange('hourly_price_type', val)
									}
								/>
							</FormGroup>
							<FormGroup
								row
								label={__(
									'Distance Unit Price',
									'multivendorx-pro'
								)}
								desc={__(
									'Additional charge per distance unit (kilometer or mile)',
									'multivendorx-pro'
								)}
							>
								<TextAreaUI
									name="content"
									// value={formData.content}
									// onChange={(value: string) =>
									// 	handleChange('content', value)
									// }
									// usePlainText={false}
									// tinymceApiKey={
									// 	appLocalizer.settings_databases_value[
									// 		'overview'
									// 	]['tinymce_api_section'] ?? ''
									// }
								/>
							</FormGroup>
						</FormGroupWrapper>
					</Card>

					<Card title={__('Order', 'multivendorx-pro')}>
						<FormGroupWrapper>
							<FormGroup
								row
								label={__('Order Type', 'multivendorx-pro')}
							>
								<ChoiceToggleUI
									options={[
										{
											key: 'kilometer',
											value: 'kilometer',
											label: __(
												'Create a new order',
												'multivendorx'
											),
										},
										{
											key: 'mile',
											value: 'mile',
											label: __(
												'Assign to an existing order',
												'multivendorx'
											),
										},
									]}
									value={formData.distance_unit}
									onChange={(val: string) =>
										handleChange('distance_unit', val)
									}
								/>
							</FormGroup>
							<FormGroup
								row
								label={__('Existing Order', 'multivendorx-pro')}
							>
								<BasicInputUI type="number" />
							</FormGroup>
							<FormGroup
								row
								label={__('Billing', 'multivendorx-pro')}
							>
								<BasicInputUI type="text" />
							</FormGroup>
						</FormGroupWrapper>
					</Card>
				</Column>

				<Column grid={6}>
					<Card title={__('Scheduling', 'multivendorx-pro')}>
						<FormGroupWrapper>
							<FormGroup
								row
								label={__('Booking Date', 'multivendorx-pro')}
							>
								<CalendarInputUI
								// onChange={(range: DateRange) => {
								// 	setDateRange({
								// 		startDate: range.startDate,
								// 		endDate: range.endDate,
								// 	});
								// }}
								/>
							</FormGroup>
							<FormGroup
								row
								label={__('Duration', 'multivendorx-pro')}
							>
								<SelectInputUI
									name="duration"
									size="15rem"
									options={durationOptions}
									value={formData.duration}
									onChange={(val) =>
										handleChange('duration', val)
									}
								/>
							</FormGroup>
							<FormGroup
								row
								label={__(
									'Repeat / Recurrence',
									'multivendorx-pro'
								)}
							>
								<SelectInputUI
									name="repeat"
									size="15rem"
									options={repeatOptions}
									value={formData.repeat}
									onChange={(val) =>
										handleChange('repeat', val)
									}
								/>
							</FormGroup>
							<FormGroup
								row
								label={__('Location', 'multivendorx-pro')}
							>
								<BasicInputUI type="number" />
							</FormGroup>
						</FormGroupWrapper>
					</Card>
				</Column>
			</Container>
		</>
	);
};

export default AddAppointment;
