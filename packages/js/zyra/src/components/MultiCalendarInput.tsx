// External dependencies
import React, { useState, useRef, useEffect } from 'react';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';

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
    value?: { startDate: Date; endDate: Date }; // better type
    onChange?: ( date: { startDate: Date; endDate: Date } ) => void;
    proSetting?: boolean;
    showLabel?: boolean;
}

const MultiCalendarInput: React.FC< CalendarInputProps > = ( props ) => {
    const [value, onChange] = useState<Value>([new Date(), new Date()]);
    const [selectedRange, setSelectedRange] = useState<{ startDate: Date; endDate: Date }>({
        startDate: new Date(),
        endDate: new Date(),
    });

    const [ pickerPosition, setPickerPosition ] = useState< 'top' | 'bottom' >(
        'bottom'
    );
    const dateRef = useRef< HTMLDivElement | null >( null );
    const closeTimeoutRef = useRef<number | null>(null);
    const [ openDatePicker, setOpenDatePicker ] = useState( true );
    useEffect(() => {
        return () => {
            if (closeTimeoutRef.current) {
                window.clearTimeout(closeTimeoutRef.current);
            }
        };
    }, []);
    
    useEffect( () => {
        const handleClickOutside = ( event: MouseEvent ) => {
            if (
                openDatePicker &&
                dateRef.current &&
                ! dateRef.current.contains( event.target as Node )
            ) {
                setOpenDatePicker( false );
            }
        };

        document.addEventListener( 'mousedown', handleClickOutside );
        return () => {
            document.removeEventListener( 'mousedown', handleClickOutside );
        };
    }, [ openDatePicker ] );

    const getLabel = () => {
        const start = selectedRange.startDate;
        const end = selectedRange.endDate;
        const today = new Date();
        today.setHours( 0, 0, 0, 0 );
        const isSameDay = (targetDate:Date, referenceDate:Date) =>
            targetDate.toDateString() === referenceDate.toDateString();

        // Today
        if (
            isSameDay( start, today ) && 
            isSameDay( end, today )
        ) {
            return 'Today';
        }

        // Yesterday
        const yesterday = new Date( today );
        yesterday.setDate( today.getDate() - 1 );
        if (
            isSameDay( start, yesterday ) &&
            isSameDay( end, yesterday )
        ) {
            return 'Yesterday';
        }

        // This Week
        const dayOfWeek = today.getDay();
        const mondayThisWeek = new Date( today );
        mondayThisWeek.setDate(
            today.getDate() - ( dayOfWeek === 0 ? 6 : dayOfWeek - 1 )
        );
        const sundayThisWeek = new Date( mondayThisWeek );
        sundayThisWeek.setDate( mondayThisWeek.getDate() + 6 );

        if (
            isSameDay( start, mondayThisWeek ) &&
            isSameDay( end, sundayThisWeek )
        ) {
            return 'This Week';
        }

        // Last Week
        const mondayLastWeek = new Date( mondayThisWeek );
        mondayLastWeek.setDate( mondayThisWeek.getDate() - 7 );
        const sundayLastWeek = new Date( mondayLastWeek );
        sundayLastWeek.setDate( mondayLastWeek.getDate() + 6 );

        if (
            isSameDay( start, mondayLastWeek ) &&
            isSameDay( end, sundayLastWeek )
        ) {
            return 'Last Week';
        }

        // This Month
        const firstOfMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );
        const lastOfMonth = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0
        );

        if (
            isSameDay( start, firstOfMonth ) &&
            isSameDay( end, lastOfMonth )
        ) {
            return 'This Month';
        }

        // Last Month
        const firstOfLastMonth = new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            1
        );
        const lastOfLastMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            0
        );

        if (
            isSameDay( start, firstOfLastMonth ) &&
            isSameDay( end, lastOfLastMonth )
        ) {
            return 'Last Month';
        }

        // If no match, show nothing
        return '';
    };

    return (
        <div className={ `settings-calender ${ props.wrapperClass || '' }`}>
            <div className="date-picker-section-wrapper" ref={ dateRef }>
                { props.showLabel && getLabel() && (
                    <div className="date-label">{ getLabel() }</div>
                ) }
                { openDatePicker && (
                    <div
                        className={ `date-picker ${
                            pickerPosition === 'top'
                                ? 'open-top'
                                : 'open-bottom'
                        }` }
                        id="date-picker-wrapper"
                    >
                        <DateRangePicker onChange={onChange} value={value} autoFocus={true} />
                    </div>
                ) }
            </div>
        </div>
    );
};

export default MultiCalendarInput;
