// CalendarInput.stories.tsx
import React, { useState } from 'react';
import CalendarInput from '../src/components/CalendarInput';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DateObject } from 'react-multi-date-picker';
import "../src/styles/common.scss";

const meta: Meta<typeof CalendarInput> = {
    title: 'Zyra/Components/CalendarInput',
    component: CalendarInput,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CalendarInput>;

export const DefaultDate: Story = {
    render: () => {
        const [value, setValue] = useState('2025-12-19');

        return (
            <div className='multivendorx-main-wrapper'>
            <CalendarInput
                wrapperClass="calendar-input-wrapper"
                inputClass="calendar-input"
                value={value}
                onChange={(date) => {
                    if (Array.isArray(date)) {
                        const formatted = date
                            .map((d) =>
                                Array.isArray(d)
                                    ? `${d[0].format('YYYY-MM-DD')} - ${d[1].format('YYYY-MM-DD')}`
                                    : d.format('YYYY-MM-DD')
                            )
                            .join(', ');
                        setValue(formatted);
                    } else {
                        setValue((date as DateObject).format('YYYY-MM-DD'));
                    }
                }}
            />
            </div>
        );
    },
};

export const MultipleDates: Story = {
    render: () => {
        const [value, setValue] = useState('2025-12-19, 2025-12-20');

        return (
            <div className='multivendorx-main-wrapper'>
            <CalendarInput
                wrapperClass="calendar-input-wrapper"
                inputClass="calendar-input"
                value={value}
                multiple
                onChange={(date) => {
                    if (Array.isArray(date)) {
                        const formatted = date
                            .map((d) =>
                                Array.isArray(d)
                                    ? `${d[0].format('YYYY-MM-DD')} - ${d[1].format('YYYY-MM-DD')}`
                                    : d.format('YYYY-MM-DD')
                            )
                            .join(', ');
                        setValue(formatted);
                    }
                }}
            />
            </div>
        );
    },
};

export const RangeDates: Story = {
    render: () => {
        const [value, setValue] = useState('2025-12-19 - 2025-12-25');

        return (
            <div className='multivendorx-main-wrapper'>
            <CalendarInput
                wrapperClass="calendar-input-wrapper"
                inputClass="calendar-input"
                value={value}
                range
                onChange={(date) => {
                    if (Array.isArray(date)) {
                        const formatted = date
                            .map((d) =>
                                Array.isArray(d)
                                    ? `${d[0].format('YYYY-MM-DD')} - ${d[1].format('YYYY-MM-DD')}`
                                    : d.format('YYYY-MM-DD')
                            )
                            .join(', ');
                        setValue(formatted);
                    }
                }}
            />
            </div>
        );
    },
};

export const WithProTag: Story = {
    render: () => {
        const [value, setValue] = useState('2025-12-19');

        return (
            <div className='multivendorx-main-wrapper'>
            <CalendarInput
                wrapperClass="calendar-input-wrapper"
                inputClass="calendar-input"
                value={value}
                proSetting
                onChange={(date) => {
                    if (Array.isArray(date)) {
                        const formatted = date
                            .map((d) =>
                                Array.isArray(d)
                                    ? `${d[0].format('YYYY-MM-DD')} - ${d[1].format('YYYY-MM-DD')}`
                                    : d.format('YYYY-MM-DD')
                            )
                            .join(', ');
                        setValue(formatted);
                    } else {
                        setValue((date as DateObject).format('YYYY-MM-DD'));
                    }
                }}
            />
            </div>
        );
    },
};

export const FormatCustomized: Story = {
    render: () => {
        const [value, setValue] = useState('19/12/2025');

        return (
            <div className='multivendorx-main-wrapper'>
            <CalendarInput
                wrapperClass="calendar-input-wrapper"
                inputClass="calendar-input"
                value={value}
                format="DD/MM/YYYY"
                onChange={(date) => {
                    if (Array.isArray(date)) {
                        const formatted = date
                            .map((d) =>
                                Array.isArray(d)
                                    ? `${d[0].format('DD/MM/YYYY')} - ${d[1].format('DD/MM/YYYY')}`
                                    : d.format('DD/MM/YYYY')
                            )
                            .join(', ');
                        setValue(formatted);
                    } else {
                        setValue((date as DateObject).format('DD/MM/YYYY'));
                    }
                }}
            />
            </div>
        );
    },
};