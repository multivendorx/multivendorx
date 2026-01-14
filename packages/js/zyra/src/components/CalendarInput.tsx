/**
 * External dependencies
 */
import React, { useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';

// Types
type CalendarValue = DateObject | DateObject[] | [ DateObject, DateObject ][];

interface CalendarInputProps {
    wrapperClass?: string;
    inputClass?: string;
    format?: string;
    multiple?: boolean;
    range?: boolean;
    value: string;
    onChange?: ( date: CalendarValue ) => void;
    proSetting?: boolean;
}

const CalendarInput: React.FC< CalendarInputProps > = ( props ) => {
    let formattedDate: CalendarValue | null = null;
    const dates = props.value.split( ',' );

    if ( dates.length === 1 && ! dates[ 0 ].includes( ' - ' ) ) {
        formattedDate = new DateObject( {
            date: dates[ 0 ].trim(),
            format: props.format || 'YYYY-MM-DD',
        } );
    } else {
        formattedDate = dates.map( ( date ) => {
            if ( date.includes( ' - ' ) ) {
                const [ start, end ] = date.split( ' - ' );
                return [
                    new DateObject( {
                        date: start.trim(),
                        format: props.format || 'YYYY-MM-DD',
                    } ),
                    new DateObject( {
                        date: end.trim(),
                        format: props.format || 'YYYY-MM-DD',
                    } ),
                ];
            }
            return new DateObject( {
                date: date.trim(),
                format: props.format || 'YYYY-MM-DD',
            } );
        } ) as CalendarValue;
    }

    const [ selectedDate, setSelectedDate ] = useState< CalendarValue | null >(
        formattedDate
    );

    const handleDateChange = (
        date: DateObject | DateObject[] | DateObject[][] | null
    ) => {
        if ( ! date ) {
            return;
        }
        setSelectedDate( date as CalendarValue );
        props.onChange?.( date as CalendarValue );
    };

    return (
        <div className={ `settings-calender ${ props.wrapperClass || '' }`}>
            <DatePicker
                className={`${ props.inputClass || 'teal' }`}
                format={ props.format || 'YYYY-MM-DD' }
                multiple={ props.multiple }
                range={ props.range }
                value={ selectedDate }
                placeholder="YYYY-MM-DD"
                onChange={ handleDateChange }
            />
            { props.proSetting && <span className="admin-pro-tag">Pro</span> }
        </div>
    );
};

export default CalendarInput;
