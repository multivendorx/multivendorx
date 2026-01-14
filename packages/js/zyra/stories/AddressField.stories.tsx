// AddressField.stories.tsx
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import AddressField, { AddressFormField } from '../src/components/AddressField';
import '../src/styles/common.scss';

const meta: Meta<typeof AddressField> = {
    title: 'Zyra/Components/AddressField',
    component: AddressField,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AddressField>;

// Sample subfields
const initialSubFields = [
    { id: 1, key: 'street', label: 'Street', type: 'text', placeholder: 'Enter street' },
    { id: 2, key: 'city', label: 'City', type: 'text', placeholder: 'Enter city' },
    { id: 3, key: 'state', label: 'State', type: 'select', options: ['California', 'Texas', 'New York'] },
    { id: 4, key: 'zip', label: 'Zip Code', type: 'text', placeholder: 'Enter zip' },
];

export const DefaultAddressField: Story = {
    render: () => {
        const [addressField, setAddressField] = useState<AddressFormField>({
            id: 101,
            type: 'address',
            label: 'Address',
            fields: initialSubFields,
        });

        const [openedInput, setOpenedInput] = useState<any>(null);

        return (
            <div className='multivendorx-main-wrapper' >
                <AddressField
                    formField={addressField}
                    onChange={(key, value) =>
                        setAddressField((prev) => ({ ...prev, [key]: value }))
                    }
                    opendInput={openedInput}
                    setOpendInput={setOpenedInput}
                />
            </div>
        );
    },
};

export const ReadonlyAddressField: Story = {
    render: () => {
        const [addressField] = useState<AddressFormField>({
            id: 102,
            type: 'address',
            label: 'Readonly Address',
            readonly: true,
            fields: initialSubFields,
        });

        const [openedInput, setOpenedInput] = useState<any>(null);

        return (
            <div className='multivendorx-main-wrapper' >
                <AddressField
                    formField={addressField}
                    onChange={() => {}}
                    opendInput={openedInput}
                    setOpendInput={setOpenedInput}
                />
            </div>
        );
    },
};

export const EmptyAddressField: Story = {
    render: () => {
        const [addressField, setAddressField] = useState<AddressFormField>({
            id: 103,
            type: 'address',
            label: 'Empty Address',
            fields: [],
        });

        const [openedInput, setOpenedInput] = useState<any>(null);

        return (
            <div className= 'multivendorx-main-wrapper' >
                <AddressField
                    formField={addressField}
                    onChange={(key, value) =>
                        setAddressField((prev) => ({ ...prev, [key]: value }))
                    }
                    opendInput={openedInput}
                    setOpendInput={setOpenedInput}
                />
            </div>
        );
    },
};


