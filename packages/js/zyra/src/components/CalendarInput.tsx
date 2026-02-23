import React, { useEffect, useRef, useState } from 'react';
import DatePicker, { Calendar, DateObject, DatePickerRef } from 'react-multi-date-picker'; 
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import { FieldComponent } from './types';

export interface CalendarRange {
  startDate: Date;
  endDate: Date;
}

interface CalendarInputProps {
  wrapperClass?: string;
  inputClass?: string;
  format?: string;
  value?: CalendarRange;
  onChange?: (range?: CalendarRange) => void;
  multiple?: boolean;
  proSetting?: boolean;
  showInput?: boolean; 
  NumberOfMonth?: number;
  fullYear?: boolean;
}

const convertToDateObjectRange = (
  range?: CalendarRange,
  format = 'MMMM DD YYYY'
) => {
  if (!range) return null;

  return [
    new DateObject({ date: range.startDate, format }),
    new DateObject({ date: range.endDate, format }),
  ];
};

interface PresetsProps {
  setValue: (dates: DateObject[] | DateObject) => void;
  pickerRef: React.RefObject<DatePickerRef>;
  format: string;
}

const Presets : React.FC<PresetsProps> = ({ setValue, pickerRef, format }) => {
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
    const result = dates.map(date => new DateObject({ date, format }));
    setValue(result.length === 1 ? result[0] : result);
    pickerRef.current?.closeCalendar();
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

  const lastMonthStart = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1
  );

  const lastMonthEnd = endOfMonth(lastMonthStart);

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
    </div>
  );
};

export const CalendarInputUI: React.FC<CalendarInputProps> = ({
  wrapperClass = "calender-wrapper",
  inputClass,
  format = "MMMM DD YYYY",
  value,
  onChange,
  multiple = false,
  showInput = true,
  NumberOfMonth = 1,
  fullYear
}) => {
  const pickerRef = useRef<DatePickerRef>(null);

  const [internalValue, setInternalValue] =
    useState<DateObject[] | DateObject | null>(convertToDateObjectRange(value, format));

  useEffect(() => {
    setInternalValue(convertToDateObjectRange(value, format));
  }, [value, format]);

  const handleChange = (val: DateObject[] | DateObject | null) => {
    setInternalValue(val);
    if (Array.isArray(val) && val.length === 2) {
      const [start, end] = val as DateObject[];

      onChange?.({
        startDate: start.toDate(),
        endDate: end.toDate(),
      });

      pickerRef.current?.closeCalendar();
    } else if (val instanceof DateObject) {
      const date = val.toDate();
      onChange?.({ startDate: date, endDate: date });

      pickerRef.current?.closeCalendar();
    }
  };

  const plugins = [];
  if (multiple) {
    plugins.push(<DatePanel key="date-panel" />);
  } else {
    plugins.push(
      <Presets
        key="presets"
        setValue={handleChange}
        pickerRef={pickerRef}
        format={format}
      />
    );
  }

  const commonProps = {
    ref: pickerRef,
    value: internalValue,
    format,
    range: !multiple,
    numberOfMonths: {NumberOfMonth},
    sort: true,
    onChange: handleChange,
    maxDate: new Date(),
    multiple,
    plugins,
    fullYear,
  };

  return (
    <div className={`settings-calender ${wrapperClass || ''}`}>
      {showInput ? (
        <DatePicker
          {...commonProps}
          className={inputClass}
          placeholder={format}
        />
      ) : (
        <Calendar
          className="calender"
          {...commonProps}
        />
      )}
    </div>
  );
};

const CalendarInput: FieldComponent= {
  render: CalendarInputUI,
}

export default CalendarInput;