import SelectInput from '../src/components/SelectInput';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof SelectInput> = {
	title: 'Zyra/Components/SelectInput',
	component: SelectInput,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SelectInput>;

const commonProps = {
	descClass: 'settings-metabox-description',
	onChange: (value) => console.log('Selected:', value),
};

export const TestSingleSelectInput: Story = {
	args: {
		wrapperClass: 'form-select-field-wrapper',
		name: 'test_select',
		type: 'single-select' as 'single-select',
		description: '',
		inputClass: 'test_select',
		options: [
			{
				label: 'Test 1',
				value: '1',
			},
			{
				label: 'Test 2',
				value: '2',
			},
		],
		value: '2',
		proSetting: false,
		...commonProps,
	},
	render: (args) => {
		return <SelectInput {...args} />;
	},
};

export const TestMultiSelectInput: Story = {
	args: {
		wrapperClass: 'settings-from-multi-select',
		selectDeselectClass: 'btn-purple select-deselect-trigger',
		selectDeselectValue: 'Select / Deselect All',
		selectDeselect: true,
		name: 'Sample Multi Select',
		type: 'multi-select' as 'multi-select',
		description:
			'This is a multi-select input example. You can select multiple options.',
		options: [
			{
				label: 'Cart',
				value: 'option1',
			},
			{
				label: 'Checkout',
				value: 'option2',
			},
			{
				label: 'Shop',
				value: 'option3',
			},
		],
		proSetting: false,
		...commonProps,
	},
	render: (args) => {
		return <SelectInput {...args} />;
	},
};
