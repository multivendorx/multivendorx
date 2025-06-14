import Modules from '../src/components/Modules';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof Modules > = {
	title: 'Zyra/Components/Modules',
	component: Modules,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof Modules >;
const modulesArray = [
	{
		id: 'analytics',
		name: 'Analytics Tracker',
		desc: 'Track user behavior and site metrics.',
		icon: 'adminlib-mail',
		doc_link: 'https://docs.example.com/modules/analytics',
		settings_link: '/settings/analytics',
		pro_module: false,
	},
	{
		id: 'cache',
		name: 'Cache Booster',
		desc: 'Speed up your website with smart caching.',
		icon: 'adminlib-mail',
		doc_link: 'https://docs.example.com/modules/cache',
		settings_link: '/settings/cache',
		pro_module: true,
	},
	{
		id: 'seo',
		name: 'SEO Optimizer',
		desc: 'Improve your search engine visibility.',
		icon: 'adminlib-mail',
		doc_link: 'https://docs.example.com/modules/seo',
		settings_link: '/settings/seo',
	},
];

export const TestModules: Story = {
	args: {
		insertModule: ( moduleId: string ) =>
			console.log( `Insert module: ${ moduleId }` ),
		removeModule: ( moduleId: string ) =>
			console.log( `Remove module: ${ moduleId }` ),
		modulesArray,
		appLocalizer: {
			siteUrl: 'https://mywordpresssite.com',
			user: {
				id: 1,
				name: 'Admin',
			},
			isProUser: true,
		},
	},
	render: ( args ) => {
		return <Modules { ...args } />;
	},
};
