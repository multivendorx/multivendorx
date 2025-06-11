/**
 * External dependencies
 */
import React, { useState } from 'react';
import DatePicker from 'react-multi-date-picker';

// Types
export interface CalendarInputProps {
	wrapperClass?: string;
	inputClass?: string;
	format?: string;
	multiple?: boolean;
	range?: boolean;
	value: string;
	onChange?: ( date: any ) => void;
	proSetting?: boolean;
}

const CalendarInput: React.FC< CalendarInputProps > = ( props ) => {
	let formattedDate: any;
	const dates = props.value.split( ',' );

	if ( dates.length === 1 && ! dates[ 0 ].includes( ' - ' ) ) {
		formattedDate = new Date( dates[ 0 ].trim() );
	} else {
		formattedDate = dates.map( ( date ) => {
			if ( date.includes( ' - ' ) ) {
				const rangeDates = date.split( ' - ' );
				const startDate = new Date( rangeDates[ 0 ].trim() );
				const endDate = new Date( rangeDates[ 1 ].trim() );
				return [ startDate, endDate ];
			}
			return new Date( date.trim() );
		} );
	}

	const [ selectedDate, setSelectedDate ] = useState< any >(
		formattedDate || ''
	);

	const handleDateChange = ( e: any ) => {
		setSelectedDate( e );
		props.onChange?.( e );
	};

	return (
		<div className={ props.wrapperClass }>
			<DatePicker
				className={ props.inputClass }
				format={ props.format || 'YYYY-MM-DD' }
				multiple={ props.multiple }
				range={ props.range }
				value={ selectedDate }
				placeholder={ 'YYYY-MM-DD' }
				onChange={ handleDateChange }
			/>
			{ props.proSetting && <span className="admin-pro-tag">pro</span> }
		</div>
	);
};

export default CalendarInput;
