import InputMailchimpList from '../src/components/InputMailchimpList';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof InputMailchimpList > = {
	title: 'Zyra/Components/InputMailchimpList',
	component: InputMailchimpList,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof InputMailchimpList >;

export const TestInputMailchimpList: Story = {
	args: {
		mailchimpKey: 'abc123-us6',
		optionKey: 'mailchimp_list',
		settingChanged: { current: false },
		apiLink: 'https://api.mailchimp.com/3.0/lists',
		proSettingChanged: () => {
			console.log( 'Checked pro setting change' );
			return true;
		},
		onChange: ( event, key ) => {
			console.log( `Changed key ${ key } to`, event.target.value );
		},
		selectKey: 'newsletterList',
		value: 'list_001',
		setting: {},
		updateSetting: ( key: string, value: any ) => {
			console.log( `Updated setting ${ key } to`, value );
		},
		appLocalizer: {
			someFlag: true,
			someText: 'Localized string',
		},
	},
	render: ( args ) => {
		return <InputMailchimpList { ...args } />;
	},
};
