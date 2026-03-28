import { MultiCheckBoxUI } from '../src/components/MultiCheckbox';
import type { Meta, StoryObj } from '@storybook/react-vite';

import type { Option, MultiCheckBoxProps } from '../src/components/MultiCheckbox';
import React, { useState } from 'react';

const meta: Meta<typeof MultiCheckBoxUI> = {
    title: 'Zyra/Components/MultiCheckbox',
    component: MultiCheckBoxUI,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MultiCheckBoxUI>;

const appLocalizer = {
    khali_dabba: false,
};

const inventoryPermissionOptions: Option[] = [
    {
        key: 'read_inventory',
        value: 'read_inventory',
        label: 'View inventory',
        desc: '',
    },
    {
        key: 'edit_inventory',
        value: 'edit_inventory',
        label: 'Track stock',
        desc: '',
        edit:true
    },
    {
        key: 'edit_stock_alerts',
        value: 'edit_stock_alerts',
        label: 'Set stock alerts',
        desc: '',
        proSetting: true,
    },
];

const regularProps: MultiCheckBoxProps = {
    wrapperClass: 'checkbox-list-side-by-side',
    selectDeselect: true,
    selectDeselectValue: 'Select / Deselect All',
    options: inventoryPermissionOptions,
    value: ['read_inventory', 'edit_inventory'],
    rightContent: false,
    inputInnerWrapperClass: 'default-checkbox',
    type: 'checkbox' as const,
    modules: [],
    onChange: (val: string[]) => {
        console.log('Updated values:', val);
    },
}

const ControlledRenderer   = (
    args : Partial<MultiCheckBoxProps>
) => {
    const [value, setValue] = useState<string[]>(['read_inventory', 'edit_inventory']);
    const [options, setOptions] = useState<Option[]>(inventoryPermissionOptions);
    
    return  (
        <MultiCheckBoxUI 
            {...regularProps}
            value= {value}
            options = {options}
            onChange={setValue}
            onOptionsChange = {setOptions}
            {...args}
        />
    )
}

export const MultiCheckBoxDefault : Story = {
    render: (args)=>{
        return (
            <ControlledRenderer {...args}/>
        )
    },
    args: {

    }
}

export const MultiCheckBoxToggle : Story = {
    render: (args)=>{
        return (
            <ControlledRenderer {...args}/>
        )
    },
    args: {
        inputInnerWrapperClass:"toggle-checkbox"
    }
}

export const MultiCheckBoxDisplayingOptionLabel : Story = {
    render: (args)=>{
        return (
            <ControlledRenderer {...args}/>
        )
    },
    args: {
        rightContent:true
    }
}

export const MultiCheckBoxWithAddNewOptionFeature : Story = {
    render: (args)=>(
        <ControlledRenderer {...args} />
    ),
    args: {
        addNewBtn : 'Add new Option'
    }
}

export const MultiCheckBoxWithoutHeaderCheckbox : Story = {
    render: (args)=>(
        <ControlledRenderer {...args} />
    ),
    args: {
        selectDeselect:false
    }
}

 