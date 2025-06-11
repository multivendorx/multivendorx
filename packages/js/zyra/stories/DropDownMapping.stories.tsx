import DropDownMapping from '../src/components/DropDownMapping';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof DropDownMapping > = {
	title: 'Zyra/Components/DropDownMapping',
	component: DropDownMapping,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof DropDownMapping >;

export const TestSyncMap: Story = {
	args: {
		description: 'Map fields between systems to keep data in sync.',
		proSetting: true,
		proSettingChanged: () => true,
		value: [
			[ 'email', 'user_email' ],
			[ 'name', 'full_name' ],
		] as [ string, string ][],
		onChange: ( newValue ) => {
			console.log( 'Sync map changed:', newValue );
		},
		syncFieldsMap: {
			wordpress: {
				heading: 'WordPress',
				fields: {
					firstname: 'First name',
					lastname: 'Last name',
					username: 'User name',
					password: 'Password',
				},
			},
			moodle: {
				heading: 'Moodle',
				fields: {
					firstname: 'First name',
					lastname: 'Last name',
					username: 'User name',
					password: 'Password',
				},
			},
		},
	},
	render: ( args ) => {
		return <DropDownMapping { ...args } />;
	},
};
