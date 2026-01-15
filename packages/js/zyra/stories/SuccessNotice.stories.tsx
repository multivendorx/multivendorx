import SuccessNotice from '../src/components/SuccessNotice';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof SuccessNotice> = {
    title: 'Zyra/Components/SuccessNotice',
    component: SuccessNotice,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SuccessNotice>;

export const DefaultNotice: Story = {
    args: {
        message: 'Your settings have been saved successfully.',
    },
};

export const CustomTitleAndIcon: Story = {
    args: {
        title: 'Success!',
        message: 'Your profile has been updated.',
        iconClass: 'adminlib-icon-success',
    },
};

export const NoMessage: Story = {
    args: {
        message: '', // component should render nothing
    },
};

export const CustomTitleOnly: Story = {
    args: {
        title: 'Done!',
        message: 'Your changes were saved.',
    },
};

export const CustomIconOnly: Story = {
    args: {
        message: 'Operation completed successfully.',
        iconClass: 'adminfont-check-circle',
    },
};

export const LongMessage: Story = {
    args: {
        message:
            'Congratulations! Your operation was successful. You can now proceed to the next step in your workflow. If you need further assistance, feel free to reach out to our support team.',
    },
};
