import OptionMetaBox from "../src/components/OptionMetaBox";
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof OptionMetaBox> = {
  title: "Zyra/Components/Form/OptionMetaBox",
    component: OptionMetaBox,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof OptionMetaBox>;
 const option = {
        label: "Enable Notifications",
        value: "true",
        isdefault: true,
    };
export const TestOptionMetaBox : Story = {
    args : {
        option: option,
        onChange: ( key, value ) => {
            console.log( `Changed ${ key } to ${ value }` );
        },
        setDefaultValue: () => {
            console.log( "Default value has been set." );
        },
        hasOpen: true,
    },
    render:(args)=>{
        return <OptionMetaBox { ...args } />;
    }
};
