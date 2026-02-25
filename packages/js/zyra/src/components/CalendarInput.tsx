import React, { useEffect, useRef, useState } from 'react';
import DatePicker, { Calendar, DateObject, DatePickerRef } from 'react-multi-date-picker'; 
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import { FieldComponent } from './types';
import { BasicInputUI } from './BasicInput';
import { TextAreaUI } from './TextArea';
import { AdminButtonUI } from './AdminButton';

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
  inputClass?: string;
  format?: string;
  value?: CalendarRange | EventsData;
  onChange?: (value: CalendarRange | EventsData) => void;
  multiple?: boolean;
  showInput?: boolean; 
  NumberOfMonth?: number;
  fullYear?: boolean;
  defaultOpen?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const toDateKey = (date: DateObject): string => {
  const m = String(date.month.number).padStart(2, '0');
  const d = String(date.day).padStart(2, '0');
  return `${date.year}-${m}-${d}`;
};

const isEventsData = (value: any): value is EventsData =>
  !!value && typeof value === 'object' && !('startDate' in value);

const toDateObjectRange = (range?: CalendarRange, format = 'MMMM DD YYYY') => {
  if (!range) return null;
  return [
    new DateObject({ date: range.startDate, format }),
    new DateObject({ date: range.endDate, format }),
  ];
};

interface EventPopupProps {
  date: DateObject;
  events: CalendarEvent[];
  onSave: (event: CalendarEvent) => void;
  onEdit: (id: string, title: string, description?: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const EventPopup: React.FC<EventPopupProps> = ({
  date, events, onSave, onEdit, onDelete, onClose,
}) => {
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [error, setError]           = useState('');
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editTitle, setEditTitle]   = useState('');
  const [editDesc, setEditDesc]     = useState('');
  const [editError, setEditError]   = useState('');

  const handleSave = () => {
    if (!title.trim()) { setError('Event title is required.'); return; }
    onSave({ id: generateId(), title: title.trim(), description: description.trim() || undefined });
    setTitle('');
    setDescription('');
    setError('');
  };

  const startEdit = (ev: CalendarEvent) => {
    setEditingId(ev.id);
    setEditTitle(ev.title);
    setEditDesc(ev.description ?? '');
    setEditError('');
  };

  const confirmEdit = () => {
    if (!editTitle.trim()) { setEditError('Event title is required.'); return; }
    onEdit(editingId!, editTitle.trim(), editDesc.trim() || undefined);
    setEditingId(null);
  };

  return (
    <div className="calendar-event-overlay" onClick={onClose}>
      <div
        className="calendar-event-popup"
        onClick={e => e.stopPropagation()}
        onKeyDown={e => e.key === 'Escape' && onClose()}
      >
        <div className="calendar-event-popup__header">
          <span className="calendar-event-popup__date">
            {date.day} {date.month.name} {date.year}
          </span>
          <AdminButtonUI
            buttons={{
              icon: 'close',
              onClick: onClose,
              color: 'transparent',
              children: <span>✕</span>,
            }}
            position="right"
          />
        </div>

        {events.length > 0 && (
          <ul className="calendar-event-popup__list">
            {events.map(ev => (
              <li key={ev.id} className="calendar-event-popup__item">
                {editingId === ev.id ? (
                  <div className="calendar-event-popup__edit-form">
                    <BasicInputUI
                      type="text"
                      placeholder="Event title *"
                      value={editTitle}
                      onChange={val => { setEditTitle(val); setEditError(''); }}
                    />
                    {editError && <span className="calendar-event-popup__error">{editError}</span>}
                    <TextAreaUI
                      placeholder="Description (optional)"
                      value={editDesc}
                      onChange={setEditDesc}
                    />
                    <div className="calendar-event-popup__edit-actions">
                      <AdminButtonUI
                        buttons={[
                          {
                            text: 'Save',
                            onClick: confirmEdit,
                            color: 'green',
                          },
                          {
                            text: 'Cancel',
                            onClick: () => setEditingId(null),
                            color: 'red',
                          },
                        ]}
                        position="right"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="calendar-event-popup__item-content">
                      <strong>{ev.title}</strong>
                      {ev.description && <p>{ev.description}</p>}
                    </div>
                    <div className="calendar-event-popup__item-actions">
                      <AdminButtonUI
                        buttons={[
                          {
                            icon: 'edit',
                            onClick: () => startEdit(ev),
                            color: 'blue',
                            children: <span>✎</span>,
                          },
                          {
                            icon: 'delete',
                            onClick: () => onDelete(ev.id),
                            color: 'red',
                            children: <span>✕</span>,
                          },
                        ]}
                        position="right"
                      />
                    </div>
                  </>
                )}
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
          <TextAreaUI placeholder="Description (optional)" value={description} onChange={setDescription} />
          <AdminButtonUI
            buttons={{
              text: 'Add Event',
              onClick: handleSave,
              color: 'purple-bg',
            }}
            position="center"
          />
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
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
    return d;
  };
  const endOfWeek   = (date: Date) => { const d = startOfWeek(date); d.setDate(d.getDate() + 6); return d; };
  const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth   = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const apply = (dates: Date[]) => {
    const result = dates.map(date => new DateObject({ date, format }));
    setValue(result.length === 1 ? result[0] : result);
    pickerRef.current?.closeCalendar();
  };

  const yesterday      = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const lastWeekStart  = new Date(startOfWeek(now).getTime() - 7 * 86_400_000);
  const lastWeekEnd    = endOfWeek(lastWeekStart);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd   = endOfMonth(lastMonthStart);

  return (
    <div className="range-picker-wrapper">
      <div onClick={() => apply([now])}>Today</div>
      <div onClick={() => apply([yesterday])}>Yesterday</div>
      <div onClick={() => apply([startOfWeek(now), endOfWeek(now)])}>This Week</div>
      <div onClick={() => apply([lastWeekStart, lastWeekEnd])}>Last Week</div>
      <div onClick={() => apply([startOfMonth(now), endOfMonth(now)])}>This Month</div>
      <div onClick={() => apply([lastMonthStart, lastMonthEnd])}>Last Month</div>
    </div>
  );
};

export const CalendarInputUI: React.FC<CalendarInputProps> = ({
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

  // DatePicker mode
  const [rangeValue, setRangeValue] = useState<DateObject[] | DateObject | null>(
    !defaultOpen ? toDateObjectRange(value as CalendarRange, format) : null
  );

  // Event calendar mode
  const [eventsData, setEventsData] = useState<EventsData>(
    defaultOpen && isEventsData(value) ? value : {}
  );
  const [popupDate, setPopupDate] = useState<DateObject | null>(null);

  useEffect(() => {
    if (defaultOpen) {
      if (isEventsData(value)) setEventsData(value);
    } else {
      setRangeValue(toDateObjectRange(value as CalendarRange, format));
    }
  }, [value, format, defaultOpen]);

  // Update eventsData + fire onChange
  const applyUpdate = (updated: EventsData) => {
    setEventsData(updated);
    onChange?.(updated);
  };

  // Event handlers
  const handleEventSave = (event: CalendarEvent) => {
    if (!popupDate) return;
    const key = toDateKey(popupDate);
    applyUpdate({ ...eventsData, [key]: [...(eventsData[key] ?? []), event] });
  };

  const handleEventEdit = (id: string, title: string, description?: string) => {
    if (!popupDate) return;
    const key = toDateKey(popupDate);
    applyUpdate({
      ...eventsData,
      [key]: (eventsData[key] ?? []).map(ev => ev.id === id ? { ...ev, title, description } : ev),
    });
  };

  const handleEventDelete = (id: string) => {
    if (!popupDate) return;
    const key = toDateKey(popupDate);
    const filtered = (eventsData[key] ?? []).filter(ev => ev.id !== id);
    const updated = { ...eventsData };
    filtered.length > 0 ? (updated[key] = filtered) : delete updated[key];
    applyUpdate(updated);
  };

  // DatePicker mode handler
  const handlePickerChange = (val: DateObject[] | DateObject | null) => {
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

  // Event calendar render
  if (defaultOpen) {
    return (
      <div className="settings-calender">
        <Calendar
          className="calender"
          format={format}
          numberOfMonths={NumberOfMonth}
          fullYear={fullYear}
          mapDays={({ date }) => {
            const key = toDateKey(date);
            const dayEvents = eventsData[key] ?? [];

            return {
              onClick: () => setPopupDate(date),
              children: (
                <div className="calendar-day">
                  <span className="calendar-day__number">{date.day}</span>
                  {dayEvents.map((ev, idx) => (
                    <div
                      key={ev.id}
                      title={ev.description ?? ev.title}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPopupDate(date);
                      }}
                    >
                      {ev.title}
                    </div>
                  ))}
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
            onEdit={handleEventEdit}
            onDelete={handleEventDelete}
            onClose={() => setPopupDate(null)}
          />
        )}
      </div>
    );
  }

  const plugins = multiple
    ? [<DatePanel key="date-panel" />]
    : [<Presets key="presets" setValue={handlePickerChange} pickerRef={pickerRef} format={format} />];

  const commonProps = {
    ref: pickerRef,
    value: rangeValue,
    format,
    range: !multiple,
    numberOfMonths: NumberOfMonth,
    onChange: handlePickerChange,
    maxDate: new Date(),
    multiple,
    plugins,
    fullYear,
  };

  return (
    <div className="settings-calender">
      {showInput ? (
        <DatePicker {...commonProps} className={inputClass} placeholder={format} />
      ) : (
        <Calendar {...commonProps} className="calender" />
      )}
    </div>
  );
};

const CalendarInput: FieldComponent = {
  render: ({ field, value, onChange }) => (
    <CalendarInputUI {...field} value={value} onChange={onChange} />
  ),
};

export default CalendarInput;