// InputWithSuggestions.stories.tsx
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import InputWithSuggestions from '../src/components/InputWithSuggestions';

const meta: Meta<typeof InputWithSuggestions> = {
  title: 'Zyra/Components/InputWithSuggestions',
  component: InputWithSuggestions,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof InputWithSuggestions>;

// Default story: basic input with suggestions
export const Default: Story = {
  render: (args) => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    return (
      <InputWithSuggestions
        {...args}
        value={selectedItems}
        onChange={setSelectedItems}
      />
    );
  },
  args: {
    suggestions: ['Apple', 'Banana', 'Cherry', 'Date', 'Grape', 'Mango'],
    placeholder: 'Type a fruit...',
    addButtonLabel: 'Add',
  },
};

// Story: input with pre-filled items
export const Prefilled: Story = {
  render: (args) => {
    const [selectedItems, setSelectedItems] = useState<string[]>([
      'Banana',
      'Mango',
    ]);

    return (
      <InputWithSuggestions
        {...args}
        value={selectedItems}
        onChange={setSelectedItems}
      />
    );
  },
  args: {
    suggestions: ['Apple', 'Banana', 'Cherry', 'Date', 'Grape', 'Mango'],
    placeholder: 'Add fruits...',
    addButtonLabel: 'Add Fruit',
  },
};

// Story: custom suggestions and button label
export const CustomLabels: Story = {
  render: (args) => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    return (
      <InputWithSuggestions
        {...args}
        value={selectedItems}
        onChange={setSelectedItems}
      />
    );
  },
  args: {
    suggestions: ['Red', 'Blue', 'Green', 'Yellow', 'Purple'],
    placeholder: 'Type a color...',
    addButtonLabel: 'Insert',
  },
};

// Story: no suggestions (free input only)
export const FreeInputOnly: Story = {
  render: (args) => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    return (
      <InputWithSuggestions
        {...args}
        value={selectedItems}
        onChange={setSelectedItems}
      />
    );
  },
  args: {
    suggestions: [],
    placeholder: 'Enter any item...',
    addButtonLabel: 'Add Item',
  },
};

export const PreventDuplicates: Story = {
  render: (args) => {
    const [items, setItems] = useState<string[]>(['Apple']);
    return <InputWithSuggestions {...args} value={items} onChange={setItems} />;
  },
  args: {
    suggestions: ['Apple', 'Banana', 'Cherry'],
    placeholder: 'Try adding Apple again...',
  },
};

export const CaseInsensitiveSearch: Story = {
  render: (args) => {
    const [items, setItems] = useState<string[]>([]);
    return <InputWithSuggestions {...args} value={items} onChange={setItems} />;
  },
  args: {
    suggestions: ['Apple', 'Banana', 'Mango'],
    placeholder: 'Type "ap" or "AP"...',
  },
};
