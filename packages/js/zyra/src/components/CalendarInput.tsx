import React, { useEffect, useRef, useState } from 'react';
import DatePicker, { Calendar, DateObject, DatePickerRef } from 'react-multi-date-picker'; 
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import { FieldComponent } from './types';
import { BasicInputUI } from './BasicInput';
import { TextAreaUI } from './TextArea';

export interface CalendarRange {
  startDate: Date;
  endDate: Date;
}
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
}
export type EventsData = Record<string, CalendarEvent[]>;

interface CalendarInputProps {
  wrapperClass?: string;
  inputClass?: string;
  format?: string;
  value?: CalendarRange | EventsData;
  onChange?: (value: CalendarRange | EventsData) => void;
  multiple?: boolean;
  proSetting?: boolean;
  showInput?: boolean; 
  NumberOfMonth?: number;
  fullYear?: boolean;
  defaultOpen?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toDateKey = (date: DateObject): string => {
  const y = date.year;
  const m = String(date.month.number).padStart(2, '0');
  const d = String(date.day).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const isEventsData = (value: any): value is EventsData => {
  if (!value) return false;
  
  // If it's a string, try to parse it
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return false;
    }
  }
  
  // Now check if it's an object and doesn't have startDate property
  return typeof value === 'object' && !('startDate' in value);
};

/**
 * Safely parse the value to either CalendarRange or EventsData
 */
const convertToDateObjectRange = (value: any): CalendarRange | EventsData | undefined => {
  if (!value) return undefined;
  
  // If it's a string, try to parse it
  if (typeof value === 'string') {
    try {
      // Handle PHP serialized object - if it starts with 'a:', it's a serialized array
      if (value.startsWith('a:')) {
        console.warn('Received PHP serialized object. Expected JSON.');
        return undefined;
      }
      value = JSON.parse(value);
    } catch {
      return undefined;
    }
  }
  
  return value;
};

interface EventPopupProps {
  date: DateObject;
  events: CalendarEvent[];
  onSave: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const EventPopup: React.FC<EventPopupProps> = ({ date, events, onSave, onDelete, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!title.trim()) {
      setError('Event title is required.');
      return;
    }
    onSave({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: title.trim(),
      description: description.trim() || undefined,
    });
    setTitle('');
    setDescription('');
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onClose();
  };

  const label = `${date.day} ${date.month.name} ${date.year}`;

  return (
    <div className="calendar-event-overlay" onClick={onClose}>
      <div className="calendar-event-popup" onClick={e => e.stopPropagation()} onKeyDown={handleKeyDown}>

        <div className="calendar-event-popup__header">
          <span className="calendar-event-popup__date">{label}</span>
          <button className="calendar-event-popup__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {events.length > 0 && (
          <ul className="calendar-event-popup__list">
            {events.map(ev => (
              <li key={ev.id} className="calendar-event-popup__item">
                <div className="calendar-event-popup__item-content">
                  <strong>{ev.title}</strong>
                  {ev.description && <p>{ev.description}</p>}
                </div>
                <button
                  className="calendar-event-popup__item-delete"
                  onClick={() => onDelete(ev.id)}
                  aria-label="Delete event"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="calendar-event-popup__form">
          <BasicInputUI
            type="text"
            placeholder="Event title *"
            value={title}
            onChange={(value) => { setTitle(value); setError(''); }}
          />
          {error && <span className="calendar-event-popup__error">{error}</span>}
          <TextAreaUI
            placeholder="Description (optional)"
            value={description}
            onChange={setDescription}
          />
          <button className="calendar-event-popup__save" onClick={handleSave}>
            Add Event
          </button>
        </div>

      </div>
    </div>
  );
};

// ─── Presets Plugin (DatePicker mode only) ────────────────────────────────────

interface PresetsProps {
  setValue: (dates: DateObject[] | DateObject) => void;
  pickerRef: React.RefObject<DatePickerRef>;
  format: string;
}

const Presets: React.FC<PresetsProps> = ({ setValue, pickerRef, format }) => {
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
  fullYear,
  defaultOpen = false,
}) => {
  const pickerRef = useRef<DatePickerRef>(null);

  // DatePicker mode state
  const [rangeValue, setRangeValue] = useState<DateObject[] | DateObject | null>(
    !defaultOpen ? convertToDateObjectRange(value as CalendarRange, format) : null
  );

  // Event calendar mode state
  const [eventsData, setEventsData] = useState<EventsData>(
    defaultOpen && isEventsData(value) ? value : {}
  );
  const [popupDate, setPopupDate] = useState<DateObject | null>(null);

  useEffect(() => {
    if (defaultOpen) {
      if (isEventsData(value)) setEventsData(value);
    } else {
      setRangeValue(convertToDateObjectRange(value as CalendarRange, format));
    }
  }, [value, format, defaultOpen]);

  const handleRangeChange = (val: DateObject[] | DateObject | null) => {
    setRangeValue(val);
    if (Array.isArray(val) && val.length === 2) {
      const [start, end] = val as DateObject[];
      onChange?.({ startDate: start.toDate(), endDate: end.toDate() });
      pickerRef.current?.closeCalendar();
    } else if (val instanceof DateObject) {
      const date = val.toDate();
      onChange?.({ startDate: date, endDate: date });
      pickerRef.current?.closeCalendar();
    }
  };

  const handleEventSave = (event: CalendarEvent) => {
    if (!popupDate) return;
    const key = toDateKey(popupDate);
    const updated: EventsData = {
      ...eventsData,
      [key]: [...(eventsData[key] ?? []), event],
    };
    setEventsData(updated);
    onChange?.(updated);
  };

  const handleEventDelete = (id: string) => {
    if (!popupDate) return;
    const key = toDateKey(popupDate);
    const filtered = (eventsData[key] ?? []).filter(ev => ev.id !== id);
    const updated: EventsData = { ...eventsData };
    if (filtered.length > 0) {
      updated[key] = filtered;
    } else {
      delete updated[key];
    }
    setEventsData(updated);
    onChange?.(updated);
  };

  // ── Event calendar (defaultOpen) ──────────────────────────────────────────

  if (defaultOpen) {
    return (
      <div className={`settings-calender ${wrapperClass}`}>
        <Calendar
          className="calender"
          format={format}
          numberOfMonths={NumberOfMonth}
          fullYear={fullYear}
          mapDays={({ date }) => {
            const key = toDateKey(date);
            const hasEvents = (eventsData[key]?.length ?? 0) > 0;
            return {
              onClick: (e: React.MouseEvent) => {
                e.preventDefault();
                setPopupDate(date);
              },
              children: (
                <div className="calendar-day">
                  <span>{date.day}</span>
                  {hasEvents && <span className="calendar-day__dot" />}
                </div>
              ),
            };
          }}
        />

        {popupDate && (
          <EventPopup
            date={popupDate}
            events={eventsData[toDateKey(popupDate)] ?? []}
            onSave={handleEventSave}
            onDelete={handleEventDelete}
            onClose={() => setPopupDate(null)}
          />
        )}
      </div>
    );
  }

  const plugins = multiple
    ? [<DatePanel key="date-panel" />]
    : [<Presets key="presets" setValue={handleRangeChange} pickerRef={pickerRef} format={format} />];

  const commonProps = {
    ref: pickerRef,
    value: rangeValue,
    format,
    range: !multiple,
    numberOfMonths: NumberOfMonth,
    sort: true,
    onChange: handleRangeChange,
    maxDate: new Date(),
    multiple,
    plugins,
    fullYear,
  };

  return (
    <div className={`settings-calender ${wrapperClass}`}>
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

const CalendarInput: FieldComponent = {
  render: ({ field, value, onChange }) => (
    <CalendarInputUI
      {...field}
      value={value}
      onChange={onChange}
    />
  ),
};

export default CalendarInput;