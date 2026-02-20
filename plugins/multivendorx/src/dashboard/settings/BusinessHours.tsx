import { useState } from 'react';
import {
	FormGroupWrapper,
	FormGroup,
	NestedComponentUI,
	SelectInputUI,
	TextAreaUI,
} from 'zyra';
import { __ } from '@wordpress/i18n';

const BusinessHours = () => {
	const [rules, setRules] = useState<any[]>([]);

	const nestedFields = [
		{
			key: 'facilitator_fixed',
			type: 'number',
			size: '5rem',
			afterElement: {
				type: 'preposttext',
				textType: 'post',
				postText: ':',
			},
		},
		{
			key: 'facilitator_fixed',
			type: 'number',
			size: '5rem',
			afterElement: {
				type: 'preposttext',
				textType: 'post',
				postText: ':',
			},
		},
		{
			key: 'facilitator_fixed',
			type: 'number',
			size: '2rem',
			postText: 'AM',
			afterElement: {
				type: 'preposttext',
				textType: 'post',
				postText: '--',
			},
		},
		{
			key: 'facilitator_fixed',
			type: 'number',
			size: '5rem',
			afterElement: {
				type: 'preposttext',
				textType: 'post',
				postText: ':',
			},
		},
		{
			key: 'facilitator_fixed',
			type: 'number',
			size: '5rem',
			afterElement: {
				type: 'preposttext',
				textType: 'post',
				postText: ':',
			},
		},
		{
			key: 'facilitator_fixed',
			type: 'number',
			size: '2rem',
			postText: 'AM',
		},
	];
	const stockStatusOptions = [
		{ value: '', label: 'Eastern Time (ET)' },
		{ value: 'instock', label: 'Central Time (CT)' },
		{ value: 'outofstock', label: 'Mountain Time (MT)' },
		{ value: 'onbackorder', label: 'Pacific Time (PT)' },
		{ value: 'onbackorder', label: 'London (GMT)' },
	];
	return (
		<>
			<FormGroupWrapper>
				<FormGroup label={__('Store Timezone', 'multivendorx')}>
					<SelectInputUI
						name="stock_status"
						options={stockStatusOptions}
						size={'14rem'}
						// value={product.stock_status}
						// onChange={(selected) =>
						//     handleChange('stock_status', selected.value)
						// }
					/>
				</FormGroup>
				<FormGroup
					label={__('Shop Open & Close Timings', 'multivendorx')}
				>
					<NestedComponentUI
						id="role_rules"
						fields={nestedFields}
						value={rules}
						addButtonLabel="Add Hours"
						deleteButtonLabel="Remove"
						onChange={(val) => setRules(val)}
					/>
				</FormGroup>
				<FormGroup
					label={__('Message When Shop is Closed', 'multivendorx')}
				>
					<TextAreaUI name="content" />
				</FormGroup>
			</FormGroupWrapper>
		</>
	);
};

export default BusinessHours;
