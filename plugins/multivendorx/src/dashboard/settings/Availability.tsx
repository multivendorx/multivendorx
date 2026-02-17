import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    TextArea,
    FileInput,
    useModules,
    getApiLink,
    SuccessNotice,
    FormGroupWrapper,
    FormGroup,
    BasicInputUI,
    ToggleSettingUI,
    TextAreaUI,
    CalendarInput,
} from 'zyra';
import { __ } from '@wordpress/i18n';

const Availability = () => {
    const [dateRange, setDateRange] = useState<{
        startDate: Date;
        endDate: Date;
    } | undefined>();
    return (
        <>
            <FormGroupWrapper>
                <CalendarInput
                    format="YYYY-MM-DD"
                    multiple={true}
                    value={dateRange}
                    onChange={(newRange) => {
                        setDateRange(newRange);
                        onFilterChange(filter.key, newRange);
                    }}
                />
                <FormGroup label={__('"Add to Cart" Button Text', 'multivendorx')}>
                    <BasicInputUI
                        type={'text'}
                    // value={query}
                    // onChange={(val: string) => {
                    //     setQuery(val);
                    //     setIsOpen(true);
                    //     triggerSearch(val);
                    // }}
                    />
                </FormGroup>
                <FormGroup label={__('Notification Message', 'multivendorx')}>
                    <TextAreaUI
                        name="content"
                    />
                </FormGroup>
                <FormGroup label={__('Quick presets', 'multivendorx')}>
                    <ToggleSettingUI
                        options={[
                            {
                                key: 'draft',
                                value: 'draft',
                                label: __('1d', 'multivendorx'),
                                desc: __('Same', 'multivendorx')
                            },
                            {
                                key: 'publish',
                                value: 'publish',
                                label: __('3d', 'multivendorx'),
                                desc: __('Short', 'multivendorx')
                            },
                            {
                                key: 'pending',
                                value: 'pending',
                                label: __('7d', 'multivendorx'),
                                desc: __('1 week', 'multivendorx')
                            },
                            {
                                key: 'pending',
                                value: 'pending',
                                label: __('14d', 'multivendorx'),
                                desc: __('2 week', 'multivendorx')
                            },
                            {
                                key: 'pending',
                                value: 'pending',
                                label: __('30d', 'multivendorx'),
                                desc: __('1 month', 'multivendorx')
                            },
                        ]}
                    // value={product.status}
                    // onChange={(value) => handleChange('status', value)}
                    />

                </FormGroup>
                <FormGroup label={__('Notify via', 'multivendorx')}>
                    <ToggleSettingUI
                        options={[
                            {
                                key: 'draft',
                                value: 'draft',
                                label: __('Store banner', 'multivendorx')
                            },
                            {
                                key: 'publish',
                                value: 'publish',
                                label: __('Email', 'multivendorx')
                            },
                            {
                                key: 'pending',
                                value: 'pending',
                                label: __('SMS', 'multivendorx')
                            },
                        ]}
                    // value={product.status}
                    // onChange={(value) => handleChange('status', value)}
                    />

                </FormGroup>
            </FormGroupWrapper>
        </>
    );
};

export default Availability;
