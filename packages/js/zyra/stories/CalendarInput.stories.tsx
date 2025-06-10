import CalendarInput from '../src/components/CalendarInput';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof CalendarInput> = {
	title: 'Zyra/Components/CalendarInput',
	component: CalendarInput,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof CalendarInput>;

export const TestMultipleCalendarRange: Story = {
	args: {
		wrapperClass: 'settings-calender',
		inputClass: 'teal',
		format: 'YYYY-MM-DD',
		multiple: true,
		range: true,
		value: '',
		onChange: (date) => {
			console.log('Date selected:', date);
		},
	},
	render: (args) => {
		return (
			<CalendarInput key={'sample_multiple_calender_range'} {...args} />
		);
	},
};

export const TestMultipleCalendar: Story = {
	args: {
		wrapperClass: 'settings-calender',
		inputClass: 'teal',
		format: 'YYYY-MM-DD',
		multiple: true,
		value: '',
		onChange: (date) => {
			console.log('Date selected:', date);
		},
	},
	render: (args) => {
		return <CalendarInput key={'sample_multiple_calender'} {...args} />;
	},
};

export const TestSingleCalendar: Story = {
	args: {
		wrapperClass: 'settings-calender',
		inputClass: 'teal',
		format: 'YYYY-MM-DD',
		value: '',
		onChange: (date) => {
			console.log('Date selected:', date);
		},
	},
	render: (args) => {
		return <CalendarInput key={'sample_single_calender'} {...args} />;
	},
};
