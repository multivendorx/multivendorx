import React, { useEffect, useRef, useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import DatePanel from "react-multi-date-picker/plugins/date_panel"

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
}

const toDateObjectRange = (
  range?: CalendarRange,
  format = 'YYYY-MM-DD'
) => {
  if (!range) return null;

  return [
    new DateObject({ date: range.startDate, format }),
    new DateObject({ date: range.endDate, format }),
  ];
};

const Presets = ({
  setValue,
  pickerRef,
  format,
}: any) => {
  const now = new Date();

  const clone = (date: Date) => new Date(date);

  const startOfWeek = (date: Date) => {
    const newdate = clone(date);
    const day = newdate.getDay();
    newdate.setDate(newdate.getDate() - day + 1);
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

  // Yesterday
  const yesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1
  );

  // Last week
  const lastWeekStart = new Date(
    startOfWeek(now).getFullYear(),
    startOfWeek(now).getMonth(),
    startOfWeek(now).getDate() - 7
  );

  const lastWeekEnd = endOfWeek(lastWeekStart);

  // Last month
  const lastMonthStart = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1
  );

  const lastMonthEnd = endOfMonth(lastMonthStart);

  return (
    <div style={{ padding: 10, borderRight: '1px solid #eee' }}>
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

const CalendarInput: React.FC<CalendarInputProps> = ({
  wrapperClass,
  inputClass,
  format = 'YYYY-MM-DD',
  value,
  onChange,
  multiple = false,
  proSetting,
}) => {
  const pickerRef = useRef<any>();

  const [internalValue, setInternalValue] =
    useState<any>(toDateObjectRange(value, format));

  useEffect(() => {
    setInternalValue(toDateObjectRange(value, format));
  }, [value, format]);

  const handleChange = (val: any) => {
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
    } else {
      onChange?.(undefined);
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
  return (
    <div className={`settings-calender ${wrapperClass || ''}`}>
      <DatePicker
        ref={pickerRef}
        className={inputClass}
        value={internalValue}
        format={format}
        range={!multiple}
        numberOfMonths={1}
        sort
        placeholder={format}
        onChange={handleChange}
        maxDate={new Date()}
        multiple={multiple}
        plugins={plugins}
      />

      {proSetting && <span className="admin-pro-tag">Pro</span>}
    </div>
  );
};

export default CalendarInput;
