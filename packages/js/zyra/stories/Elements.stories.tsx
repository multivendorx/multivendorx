import Elements from '../src/components/Elements';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Elements> = {
	title: 'Zyra/Components/Form/Elements',
	component: Elements,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Elements>;

const selectOptions = [
	{
		icon: 'adminLib-t-letter-bold icon-form-textbox',
		value: 'text',
		label: 'Textbox',
	},
	{ icon: 'adminLib-unread icon-form-email', value: 'email', label: 'Email' },
	{
		icon: 'adminLib-text icon-form-textarea',
		value: 'textarea',
		label: 'Textarea',
	},
	{
		icon: 'adminLib-checkbox icon-form-checkboxes',
		value: 'checkboxes',
		label: 'Checkboxes',
	},
	{
		icon: 'adminLib-multi-select icon-form-multi-select',
		value: 'multiselect',
		label: 'Multi Select',
	},
	{ icon: 'adminLib-radio icon-form-radio', value: 'radio', label: 'Radio' },
	{
		icon: 'adminLib-dropdown-checklist icon-form-dropdown',
		value: 'dropdown',
		label: 'Dropdown',
	},
	{
		icon: 'adminLib-captcha-automatic-code icon-form-recaptcha',
		value: 'recaptcha',
		label: 'reCaptcha v3',
	},
	{
		icon: 'adminLib-submission-message icon-form-attachment',
		value: 'attachment',
		label: 'Attachment',
	},
	{
		icon: 'adminLib-form-section icon-form-section',
		value: 'section',
		label: 'Section',
	},
	{
		icon: 'adminLib-calendar icon-form-store-description',
		value: 'datepicker',
		label: 'Date Picker',
	},
	{
		icon: 'adminLib-alarm icon-form-address01',
		value: 'TimePicker',
		label: 'Time Picker',
	},
	{
		icon: 'adminLib-divider icon-form-address01',
		value: 'divider',
		label: 'Divider',
	},
];

export const TestElements: Story = {
	args: {
		selectOptions,
		onClick: (value) => {
			console.log('Selected:', value);
		},
	},
	render: (args) => {
		return <Elements {...args} />;
	},
};
