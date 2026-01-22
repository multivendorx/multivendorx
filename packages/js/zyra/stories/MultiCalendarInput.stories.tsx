// MultiCalendarInput.stories.tsx
import React, { useState } from 'react';
import type { Meta, StoryFn } from '@storybook/react-vite';
import MultiCalendarInput from '../src/components/MultiCalendarInput';

export default {
  title: 'Zyra/Components/MultiCalendarInput',
  component: MultiCalendarInput,
  tags: ['autodocs'],
} as Meta<typeof MultiCalendarInput>;

type Story = StoryFn<typeof MultiCalendarInput>;

// Template with state to handle selected date ranges
const Template: Story = (args) => {
  const [selectedRange, setSelectedRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)), // last 7 days
    endDate: new Date(),
  });

  const handleChange = (range: { startDate: Date; endDate: Date }) => {
    setSelectedRange(range);
  };

  // Force calendar open for Storybook preview
  return <MultiCalendarInput {...args} value={selectedRange} onChange={handleChange} showLabel={true} />;
};

// Default story
export const Default = Template.bind({});
Default.args = {
  wrapperClass: 'calendar-wrapper',
  inputClass: 'basic-input',
};

// Story with custom styling
export const CustomStyling = Template.bind({});
CustomStyling.args = {
  wrapperClass: 'custom-calendar-wrapper',
  inputClass: 'custom-input',
};

// ProSetting story
export const ProSetting = Template.bind({});
ProSetting.args = {
  wrapperClass: 'pro-calendar-wrapper',
  inputClass: 'basic-input',
  proSetting: true,
};

export const TodayRange = Template.bind({});
TodayRange.args = {};
TodayRange.render = (args) => (
  <MultiCalendarInput
    {...args}
    showLabel
    value={{
      startDate: new Date(),
      endDate: new Date(),
    }}
  />
);

export const ThisWeek = Template.bind({});
ThisWeek.render = (args) => {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return (
    <MultiCalendarInput
      {...args}
      showLabel
      value={{
        startDate: monday,
        endDate: sunday,
      }}
    />
  );
};

