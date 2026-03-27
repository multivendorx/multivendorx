// CalendarInput.stories.tsx
import { useState } from 'react';
import { CalendarInputUI } from '../src/components/CalendarInput';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { CalendarRange } from '../src/components/CalendarInput';

const meta: Meta<typeof CalendarInputUI> = {
    title: 'Zyra/Components/CalendarInput',
    component: CalendarInputUI,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CalendarInputUI>;

export const DefaultDate: Story = {
    render: () => {
        let date = new Date();
        const [value, setValue] = useState<CalendarRange | undefined>({
            startDate: date,
            endDate: date,
            selectedDates: [date, date]
        });

        return (
            <CalendarInputUI
                inputClass="calendar-input"
                value={value}
                onChange={(range: CalendarRange | undefined): void => {
                    setValue(range);
                }}
            />
        );
    },
};

export const MultipleDates: Story = {
    render: () => {
        let date = new Date();
        const [value, setValue] = useState<CalendarRange | undefined>({
            startDate: date,
            endDate: date,
            selectedDates: [date, date]
        });

        return (
            <CalendarInputUI
                inputClass="calendar-input"
                value={value}
                multiple
                onChange={(range: CalendarRange | undefined): void => {
                    setValue(range);
                }}
            />
        );
    },
};

export const StagnantCalenderWithShowinputFlag: Story = {
    render: () => {
        let date = new Date();
        const [value, setValue] = useState<CalendarRange | undefined>({
            startDate: date,
            endDate: date,
            selectedDates: [date, date]
        });

        return (
            <CalendarInputUI
                inputClass="calendar-input"
                value={value}
                showInput={false}
                onChange={(range: CalendarRange | undefined): void => {
                    setValue(range);
                }}
            />
        );
    },
};

export const FullYearCalender: Story = {
    render: () => {
        let date = new Date();
        const [value, setValue] = useState<CalendarRange | undefined>({
            startDate: date,
            endDate: date,
            selectedDates: [date, date]
        });

        return (
            <CalendarInputUI
                inputClass="calendar-input"
                value={value}
                fullYear={true}
                onChange={(range: CalendarRange | undefined): void => {
                    setValue(range);
                }}
            />
        );
    },
};

export const ComparisonWithPreviousYear: Story = {
    render: () => {
        let date = new Date();
        const [value, setValue] = useState<CalendarRange | undefined>({
            startDate: date,
            endDate: date,
            selectedDates: [date, date]
        });

        return (
            <CalendarInputUI
                inputClass="calendar-input"
                value={value}
                showCompare={true}
                onChange={(range: CalendarRange | undefined): void => {
                    setValue(range);
                }}
            />
        );
    },
};
