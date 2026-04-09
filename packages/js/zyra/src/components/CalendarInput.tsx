import React, { useEffect, useRef, useState } from 'react';
import DatePicker, {
    Calendar,
    DateObject,
    DatePickerRef,
} from 'react-multi-date-picker';
import DatePanel from 'react-multi-date-picker/plugins/date_panel';
import { FieldComponent } from './fieldUtils';
import '../styles/web/CalendarInput.scss';

export interface CalendarRange {
    startDate: Date;
    endDate: Date;
    selectedDates?: Date[]; // Array of selected dates for multiple mode
}

interface CalendarInputProps {
    inputClass?: string;
    format?: string;
    value?: CalendarRange;
    onChange?: (range?: CalendarRange) => void;
    multiple?: boolean;
    showInput?: boolean;
    numberOfMonths?: number;
    fullYear?: boolean;
    maxFutureMonths?: number;
    showCompare?: boolean;
}

const convertToDateObjectRange = (
    range?: CalendarRange,
    format = 'MMMM DD YYYY'
) => {
    if (!range) {
        return null;
    }

    // If we have selectedDates array (multiple mode), convert all dates
    if (range.selectedDates && range.selectedDates.length > 0) {
        return range.selectedDates.map(
            (date) => new DateObject({ date, format })
        );
    }

    // Otherwise use startDate and endDate (range mode)
    return [
        new DateObject({ date: range.startDate, format }),
        new DateObject({ date: range.endDate, format }),
    ];
};

const calculateMaxDate = (maxFutureMonths?: number): Date => {
    if (maxFutureMonths !== undefined) {
        const date = new Date();
        date.setMonth(date.getMonth() + maxFutureMonths);
        return date;
    }
    return new Date();
};

interface PresetsProps {
    setValue: (dates: DateObject[] | DateObject) => void;
    pickerRef: React.RefObject<DatePickerRef>;
    format: string;
    onClose?: () => void;
}

const Presets: React.FC<PresetsProps> = ({ setValue, pickerRef, format, onClose }) => {
    const now = new Date();

    const startOfWeek = (date: Date) => {
        const newdate = new Date(date);
        const day = newdate.getDay();
        newdate.setDate(newdate.getDate() - day + (day === 0 ? -6 : 1));
        return newdate;
    };

    const endOfWeek = (date: Date) => {
        const newdate = startOfWeek(date);
        newdate.setDate(newdate.getDate() + 6);
        return newdate;
    };

    const startOfMonth = (date: Date) =>
        new Date(date.getFullYear(), date.getMonth(), 1);

    const endOfMonth = (date: Date) =>
        new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const apply = (dates: Date[]) => {
        const result = dates.map((date) => new DateObject({ date, format }));
        setValue(result.length === 1 ? result[0] : result);
        pickerRef.current?.closeCalendar();
        onClose?.();
    };

    const yesterday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1
    );

    const lastWeekStart = new Date(
        startOfWeek(now).getFullYear(),
        startOfWeek(now).getMonth(),
        startOfWeek(now).getDate() - 7
    );

    const lastWeekEnd = endOfWeek(lastWeekStart);

    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const lastMonthEnd = endOfMonth(lastMonthStart);

    const startOfQuarter = (date: Date) => {
        const month = date.getMonth();
        const quarterStartMonth = Math.floor(month / 3) * 3;
        return new Date(date.getFullYear(), quarterStartMonth, 1);
    };

    const startOfYear = (date: Date) => {
        return new Date(date.getFullYear(), 0, 1);
    };

    const weekToDateStart = startOfWeek(now);
    const monthToDateStart = startOfMonth(now);
    const quarterToDateStart = startOfQuarter(now);
    const yearToDateStart = startOfYear(now);

    return (
        <div className="range-picker-wrapper">
            <div onClick={() => apply([now])}>Today</div>
            <div onClick={() => apply([yesterday])}>Yesterday</div>

            <div onClick={() => apply([startOfWeek(now), endOfWeek(now)])}>
                This Week
            </div>
            <div onClick={() => apply([lastWeekStart, lastWeekEnd])}>
                Last Week
            </div>

            <div onClick={() => apply([startOfMonth(now), endOfMonth(now)])}>
                This Month
            </div>
            <div onClick={() => apply([lastMonthStart, lastMonthEnd])}>
                Last Month
            </div>

            <div onClick={() => apply([weekToDateStart, now])}>
                Week to date
            </div>

            <div onClick={() => apply([monthToDateStart, now])}>
                Month to date
            </div>

            <div onClick={() => apply([quarterToDateStart, now])}>
                Quarter to date
            </div>

            <div onClick={() => apply([yearToDateStart, now])}>
                Year to date
            </div>
        </div>
    );
};

// Custom component to handle tabs in calendar
interface CalendarWithTabsProps {
    commonProps: any;
    showInput?: boolean;
    inputClass?: string;
    format?: string;
    getDisplayValue?: () => string;
    presetsProps: PresetsProps;
}

const CalendarWithTabs: React.FC<CalendarWithTabsProps> = ({
    commonProps,
    showInput,
    inputClass,
    format,
    getDisplayValue,
    presetsProps,
}) => {
    const [activeTab, setActiveTab] = useState(0);
    const [showCalendar, setShowCalendar] = useState(false);
    const localPickerRef = useRef<DatePickerRef>(null);
    
    const tabs = [
        {
            label: 'Presets',
            content: <Presets {...presetsProps} />
        },
        {
            label: 'Custom',
            content: (
                <Calendar
                    className={`calendar-wrapper ${!showInput ? 'calendar' : ''}`}
                    {...commonProps}
                    ref={localPickerRef}
                />
            )
        }
    ];

    if (showInput) {
        return (
            <div className="settings-calender">
                <input
                    className={`rmdp-input ${inputClass || ''}`}
                    onFocus={() => setShowCalendar(true)}
                    readOnly
                    name="calendar-input"
                    value={getDisplayValue ? getDisplayValue() : ''}
                    placeholder={format}
                />
                {showCalendar && (
                    <div className="calendar-popup">
                        <div className="calendar-tabs-container">
                            <div className="tabs-wrapper">
                                <div className="tabs-item">
                                    {tabs.map((tab, index) => (
                                        <div
                                            key={index}
                                            className={`tab ${index === activeTab ? 'active-tab' : ''}`}
                                            onClick={() => setActiveTab(index)}
                                        >
                                            {tab.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="calendar-tab-content">
                                {tabs[activeTab].content}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // For non-input mode (just calendar), show tabs without the input
    return (
        <div className="settings-calender">
            <div className="calendar-tabs-container">
                <div className="tabs-wrapper">
                    <div className="tabs-item">
                        {tabs.map((tab, index) => (
                            <div
                                key={index}
                                className={`tab ${index === activeTab ? 'active-tab' : ''}`}
                                onClick={() => setActiveTab(index)}
                            >
                                {tab.label}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="calendar-tab-content">
                    {tabs[activeTab].content}
                </div>
            </div>
        </div>
    );
};

export const CalendarInputUI: React.FC<CalendarInputProps> = ({
    inputClass,
    format = 'MMMM DD YYYY',
    value,
    onChange,
    multiple = false,
    showInput = true,
    numberOfMonths = 1,
    fullYear,
    maxFutureMonths,
    showCompare = false,
}) => {
    const pickerRef = useRef<DatePickerRef>(null);
    const maxDate = calculateMaxDate(maxFutureMonths);

    const [internalValue, setInternalValue] = useState<
        DateObject[] | DateObject | null
    >(convertToDateObjectRange(value, format));

    useEffect(() => {
        setInternalValue(convertToDateObjectRange(value, format));
    }, [value, format]);

    const handleChange = (val: DateObject[] | DateObject | null) => {
        setInternalValue(val);

        if (multiple) {
            // Handle multiple selection mode - store all selected dates
            if (val) {
                const selectedDates = Array.isArray(val)
                    ? val.map((dateObj) => dateObj.toDate())
                    : [val.toDate()];

                onChange?.({ selectedDates });
            }
        } else {
            // Handle range mode (original behavior)
            if (Array.isArray(val) && val.length === 2) {
                const [start, end] = val as DateObject[];
                onChange?.({
                    startDate: start.toDate(),
                    endDate: end.toDate(),
                });
                if (pickerRef.current) {
                    pickerRef.current.closeCalendar();
                }
            } else if (val instanceof DateObject) {
                const date = val.toDate();
                onChange?.({
                    startDate: date,
                    endDate: date,
                });
                if (pickerRef.current) {
                    pickerRef.current.closeCalendar();
                }
            }
        }
    };

    const plugins = [];
    if (multiple) {
        plugins.push(<DatePanel key="date-panel" />);
    }

    const commonProps = {
        ref: pickerRef,
        value: internalValue,
        format,
        range: !multiple,
        numberOfMonths,
        sort: true,
        onChange: handleChange,
        maxDate,
        multiple,
        plugins,
        fullYear,
    };

    const getPrevYearDate = (date: Date) => {
        const d = new Date(date);
        d.setFullYear(d.getFullYear() - 1);
        return d;
    };

    const formatDate = (date: Date) => {
        const d = date instanceof Date ? date : new Date(date);

        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getDisplayValue = () => {
        if (!value?.startDate) return '';

        const start = value.startDate;
        const end = value.endDate || value.startDate;

        const isSameDay = start === end;

        const currentText = isSameDay
            ? formatDate(start)
            : `${formatDate(start)} ~ ${formatDate(end)}`;

        if (!showCompare) return currentText;

        const prevStart = getPrevYearDate(start);
        const prevEnd = getPrevYearDate(end);

        const prevText = isSameDay
            ? formatDate(prevStart)
            : `${formatDate(prevStart)} ~ ${formatDate(prevEnd)}`;

        return `${currentText}  vs ${prevText}`;
    };

    // For multiple mode, use the original DatePicker without tabs
    if (multiple) {
        return (
            <div className="settings-calender">
                {showInput ? (
                    <DatePicker
                        {...commonProps}
                        className={inputClass}
                        placeholder={format}
                        render={(value, openCalendar) => (
                            <input
                                className="rmdp-input"
                                onFocus={openCalendar}
                                readOnly
                                name="calendar-input"
                                value={getDisplayValue()}
                            />
                        )}
                    />
                ) : (
                    <Calendar
                        className={`calendar-wrapper ${
                            !showInput ? 'calendar' : ''
                        }`}
                        {...commonProps}
                    />
                )}
            </div>
        );
    }

    // For range mode, use CalendarWithTabs to show both presets and custom calendar
    return (
        <CalendarWithTabs
            commonProps={commonProps}
            showInput={showInput}
            inputClass={inputClass}
            format={format}
            getDisplayValue={getDisplayValue}
            presetsProps={{
                setValue: handleChange,
                pickerRef,
                format,
                onClose: () => pickerRef.current?.closeCalendar(),
            }}
        />
    );
};

const CalendarInput: FieldComponent = {
    render: ({ field, value, onChange }) => (
        <CalendarInputUI
            inputClass={field.inputClass}
            format={field.format}
            multiple={field.multiple ?? field.mulitple ?? false}
            showInput={field.showInput}
            numberOfMonths={field.numberOfMonths}
            fullYear={field.fullYear}
            value={value}
            onChange={onChange}
            maxFutureMonths={field.maxFutureMonths}
            showCompare={field.showCompare}
        />
    ),
};

export default CalendarInput;