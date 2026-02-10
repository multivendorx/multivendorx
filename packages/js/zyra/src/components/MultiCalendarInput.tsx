// External dependencies
import React, { useState, useRef, useEffect } from 'react';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import Calendar from 'react-calendar';
import '../styles/web/CalendarInput.scss';
import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';
import 'react-calendar/dist/Calendar.css';

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

interface CalendarInputProps {
    wrapperClass?: string;
    inputClass?: string;
    format?: string;
    multiple?: boolean;
    range?: boolean;
    value?: { startDate: Date; endDate: Date };
    onChange?: (date: { startDate: Date; endDate: Date }) => void;
    proSetting?: boolean;
    showLabel?: boolean;
    isSingle?: boolean;
}

const MultiCalendarInput: React.FC<CalendarInputProps> = (props) => {
    const isSingle = props.isSingle || false;
    const initialStart =
        props.value?.startDate ||
        new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);

    const initialEnd = props.value?.endDate || new Date();

    const [value, setValue] = useState<Value>([initialStart, initialEnd]);
    const [singleDate, setSingleDate] = useState<Date | null>(initialStart);
    const [selectedRange, setSelectedRange] = useState({
        startDate: initialStart,
        endDate: initialEnd,
    });

    const [pickerPosition, setPickerPosition] =
        useState<'top' | 'bottom'>('bottom');

    const dateRef = useRef<HTMLDivElement | null>(null);
    const closeTimeoutRef = useRef<number | null>(null);
    const [openDatePicker, setOpenDatePicker] = useState(false);
    useEffect(() => {
        return () => {
            if (closeTimeoutRef.current) {
                window.clearTimeout(closeTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                openDatePicker &&
                dateRef.current &&
                !dateRef.current.contains(event.target as Node)
            ) {
                setOpenDatePicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openDatePicker]);

    const applyRange = (start: Date, end: Date) => {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        setValue([start, end]);
        setSelectedRange({ startDate: start, endDate: end });
        props.onChange?.({ startDate: start, endDate: end });
    };

    const today = new Date();
    const presets = {
        Today: () => {
            applyRange(new Date(today), new Date(today));
        },
        Yesterday: () => {
            today.setDate(today.getDate() - 1);
            applyRange(new Date(today), new Date(today));
        },
        'This Week': () => {
            const day = today.getDay();
            const monday = new Date(today);
            monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            applyRange(monday, sunday);
        },
        'Last Week': () => {
            const day = today.getDay();
            const monday = new Date(today);
            monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1) - 7);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            applyRange(monday, sunday);
        },
        'This Month': () => {
            applyRange(
                new Date(today.getFullYear(), today.getMonth(), 1),
                new Date(today.getFullYear(), today.getMonth() + 1, 0)
            );
        },
        'Last Month': () => {
            applyRange(
                new Date(today.getFullYear(), today.getMonth() - 1, 1),
                new Date(today.getFullYear(), today.getMonth(), 0)
            );
        },
    };

    const handleDateOpen = () => {
        if (dateRef.current) {
            const rect = dateRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            setPickerPosition(
                viewportHeight - rect.bottom < 300 ? 'top' : 'bottom'
            );
        }
        setOpenDatePicker((prev) => !prev);
    };

    const handlePresetSelect = (key: keyof typeof presets) => {
        presets[key]();
        setOpenDatePicker(false);
    };

    const handleDateChange = (val: Value) => {
        if (isSingle) {
            if (val instanceof Date) {
                setSingleDate(val);
                props.onChange?.({ startDate: val, endDate: val });
            }
            return;
        }
        setValue(val);

        if (Array.isArray(val) && val[0] && val[1]) {
            applyRange(new Date(val[0]), new Date(val[1]));
        }
    };

    return (
        <div className={`settings-calender ${props.wrapperClass || ''}`}>
            <div className="date-picker-section-wrapper" ref={dateRef}>
                { isSingle && (
                    <div>
                        <input
                            value={`${selectedRange.startDate.toLocaleDateString('en-US', {
                                month: 'long',
                                day: '2-digit',
                                year: 'numeric',
                            })}`}
                            onClick={handleDateOpen}
                            className={props.inputClass || 'basic-input date'}
                            type="text"
                            readOnly
                        />
                        {openDatePicker && (
                            <div
                                className={`date-picker panel-layout ${pickerPosition === 'top' ? 'open-top' : 'open-bottom'
                                    }`}
                            >
                                <Calendar
                                    value={selectedRange.startDate}
                                    onChange={(date) => {
                                        if (date instanceof Date) {
                                            applyRange(date, date);
                                        }
                                    }}
                                    maxDate={new Date()}
                                />
                            </div>
                        )}
                    </div>
                )}
                { !isSingle && (
                    <div>
                        <input
                            value={`${selectedRange.startDate.toLocaleDateString('en-US', {
                                month: 'long',
                                day: '2-digit',
                                year: 'numeric',
                            })} - ${selectedRange.endDate.toLocaleDateString('en-US', {
                                month: 'long',
                                day: '2-digit',
                                year: 'numeric',
                            })}`}
                            onClick={handleDateOpen}
                            className={props.inputClass || 'basic-input date'}
                            type="text"
                            readOnly
                        />

                        {openDatePicker && (
                            <div
                                className={`date-picker panel-layout ${pickerPosition === 'top' ? 'open-top' : 'open-bottom'
                                    }`}
                            >
                                <div className="range-presets">
                                    {Object.keys(presets).map((key) => (
                                        <button key={key} onClick = {() => handlePresetSelect(key as keyof typeof presets)}>
                                            {key}
                                        </button>
                                    ))}
                                </div>

                                <DateRangePicker
                                    value={value}
                                    onChange={handleDateChange}
                                    maxDate={new Date()}
                                    calendarIcon={null}
                                    clearIcon={null}
                                    shouldCloseCalendar={() => false}
                                    isOpen={true}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MultiCalendarInput;
