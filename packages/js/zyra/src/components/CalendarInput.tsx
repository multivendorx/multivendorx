import React, { useEffect, useRef, useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';

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

  const startOfWeek = (date: Date) => {
    const newDate = new Date(date);
    const day = newDate.getDay();
    const diff = newDate.getDate() - day + 1;
    return new Date(newDate.setDate(diff));
  };

  const endOfWeek = (date: Date) => {
    const startDate = startOfWeek(date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return endDate;
  };

  const startOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1);

  const endOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const apply = (dates: Date[]) => {
    const objs = dates.map(date => new DateObject({ date: date, format }));
    setValue(objs.length === 1 ? objs[0] : objs);
    pickerRef.current?.closeCalendar();
  };

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const lastWeekStart = new Date(startOfWeek(now));
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(lastWeekStart);
  lastWeekEnd.setDate(lastWeekStart.getDate() + 6);

  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

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
      <div
        onClick={() =>
          apply([
            startOfMonth(lastMonth),
            endOfMonth(lastMonth),
          ])
        }
      >
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

  return (
    <div className={`settings-calender ${wrapperClass || ''}`}>
      <DatePicker
        ref={pickerRef}
        className={inputClass}
        value={internalValue}
        format={format}
        range
        numberOfMonths={1}
        sort
        placeholder={format}
        onChange={handleChange}
        maxDate={new Date()}
        plugins={[
          <Presets
            key="presets"
            setValue={handleChange}
            pickerRef={pickerRef}
            format={format}
          />,
        ]}
      />

      {proSetting && <span className="admin-pro-tag">Pro</span>}
    </div>
  );
};

export default CalendarInput;
