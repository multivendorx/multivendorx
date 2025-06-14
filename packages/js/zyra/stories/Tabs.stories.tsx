import Tabs from '../src/components/Tabs';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof Tabs > = {
	title: 'Zyra/Components/Tabs',
	component: Tabs,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof Tabs >;

export const TestTabs: Story = {
	args: {
		tabData: [
			{
				type: 'folder' as const,
				content: [
					{
						type: 'file' as const,
						content: {
							id: 'general',
							name: 'General',
							desc: 'Basic settings',
							icon: 'adminlib-settings',
							link: '/settings/general',
						},
					},
					{
						type: 'file' as const,
						content: {
							id: 'advanced',
							name: 'Advanced',
							desc: 'Advanced configuration',
							icon: 'adminlib-settings',
							link: '/settings/advanced',
							proDependent: true,
						},
					},
				],
			},
			{
				type: 'file' as const,
				content: {
					id: 'integration',
					name: 'Integration',
					desc: 'Connect with third-party apps',
					icon: 'adminlib-settings',
					link: '/settings/integration',
				},
			},
		],
		currentTab: 'general',
		getForm: ( currentTab ) => {
			return <div className="tab-description-body">Form content for { currentTab }</div>;
		},
		prepareUrl: ( tabId ) => `/settings/${ tabId }`,
		HeaderSection: () => <header>Header</header>,
		BannerSection: () => <div>Banner</div>,
		horizontally: true,
		appLocalizer: {
			ajax_url: 'https://example.com/wp-admin/admin-ajax.php',
		},
		brandImg: 'https://example.com/assets/brand.png',
		smallbrandImg: 'https://example.com/assets/brand-small.png',
		supprot: [
			{
				title: 'Support',
				icon: 'adminlib-mail',
				description: 'Get support',
				link: 'https://support.example.com',
			},
			{
				title: 'Docs',
				icon: 'adminlib-mail',
				description: 'Read documentation',
				link: 'https://docs.example.com',
			},
			{
				title: 'Docs',
				icon: 'adminlib-mail',
				description: 'Read documentation',
				link: 'https://docs.example.com',
			},
		],
		Link: ( props ) => <a { ...props }>Link</a>,
	},
	render: ( args ) => {
		return <Tabs { ...args } />;
	},
};
