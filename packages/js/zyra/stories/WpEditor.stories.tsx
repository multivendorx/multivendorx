import WpEditor from '../src/components/WpEditor';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof WpEditor> = {
	title: 'Zyra/Components/WpEditor',
	component: WpEditor,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof WpEditor>;

export const TestWpEditor: Story = {
	args: {
		apiKey: 'your-api-key',
		value: '<p>Initial content</p>',
		onEditorChange: (content) => {
			console.log('Editor content changed:', content);
		},
	},
	render: (args) => {
		return <WpEditor {...args} />;
	},
};
