import React, { useState } from 'react';
import { Calendar, DateObject } from 'react-multi-date-picker';
import { FieldComponent } from './types';
import { BasicInputUI } from './BasicInput';
import { TextAreaUI } from './TextArea';
import { AdminButtonUI } from './AdminButton';
import { PopupUI } from './Popup';
import FormGroup from './UI/FormGroup';
import FormGroupWrapper from './UI/FormGroupWrapper';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
}

export type EventsData = Record<string, CalendarEvent[]>;

interface EventCalendarProps {
  wrapperClass?: string;
  format?: string;
  value?: EventsData;
  onChange?: (value: EventsData) => void;
  NumberOfMonth?: number;
  fullYear?: boolean;
}

// Helpers
const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const toDateKey = (date: DateObject) =>
  `${date.year}-${String(date.month.number).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;

export const EventCalendarUI: React.FC<EventCalendarProps> = ({
  wrapperClass = "",
  format = "MMMM DD YYYY",
  value = {},
  onChange,
  NumberOfMonth = 1,
  fullYear,
}) => {
  const [selectedDate, setSelectedDate] = useState<DateObject | null>(null);
  const events = value;
  const [newEvent, setNewEvent] = useState({ title: '', description: '' });
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const updateEvents = (updated: EventsData) => {
    onChange?.(updated);
  };

  const handleSave = () => {
    if (!selectedDate || !newEvent.title.trim()) return;

    const key = toDateKey(selectedDate);
    const event = {
      id: generateId(),
      title: newEvent.title,
      description: newEvent.description || undefined
    };

    updateEvents({
      ...events,
      [key]: [...(events[key] || []), event]
    });

    setNewEvent({ title: '', description: '' });
  };

  const handleEdit = (event: CalendarEvent) => {
    if (!selectedDate) return;

    const key = toDateKey(selectedDate);
    updateEvents({
      ...events,
      [key]: events[key].map(e => e.id === event.id ? event : e)
    });
    setEditingEvent(null);
  };

  const handleDelete = (id: string) => {
    if (!selectedDate) return;

    const key = toDateKey(selectedDate);
    const filtered = events[key].filter(e => e.id !== id);
    const updated = { ...events };

    if (filtered.length) updated[key] = filtered;
    else delete updated[key];

    updateEvents(updated);
  };

  const selectedDateEvents = selectedDate ? events[toDateKey(selectedDate)] || [] : [];

  return (
    <div className={`settings-event-calender ${wrapperClass}`}>
      <Calendar
        format={format}
        numberOfMonths={NumberOfMonth}
        fullYear={fullYear}
        mapDays={({ date }) => {
          const dayEvents = events[toDateKey(date)] || [];
          return {
            onClick: () => setSelectedDate(date),
            children: (
              <>
                {date.day}
                {dayEvents.map(event => (
                  <div key={event.id}>
                    {event.title}
                  </div>
                ))}
              </>
            ),
          };
        }}
      />

      <PopupUI
        position="lightbox"
        open={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        width={30}
      >
        {selectedDate && (
          <div className="event-popup">
            {/* Event List */}
            {selectedDateEvents.map(event => (
              <div key={event.id} className="event-item">
                {editingEvent?.id === event.id ? (
                  <>
                    <BasicInputUI
                      value={editingEvent.title}
                      onChange={val => setEditingEvent({ ...editingEvent, title: val })}
                      size="fit-content"
                    />
                    <TextAreaUI
                      value={editingEvent.description || ''}
                      onChange={val => setEditingEvent({ ...editingEvent, description: val })}
                    />
                    <AdminButtonUI
                      buttons={[
                        { text: 'Save', onClick: () => handleEdit(editingEvent), color: 'green' },
                        { text: 'Cancel', onClick: () => setEditingEvent(null), color: 'red' }
                      ]}
                    />
                  </>
                ) : (
                  <>
                    <div>
                      <div>{event.title}</div>
                      {event.description && <div>{event.description}</div>}

                      <AdminButtonUI
                        buttons={[
                          { icon: 'edit', onClick: () => setEditingEvent(event), color: 'blue' },
                          { icon: 'delete', onClick: () => handleDelete(event.id), color: 'red' }
                        ]}
                      />
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Add New Event */}
            <>
              <FormGroupWrapper>
                <FormGroup>
                  <BasicInputUI
                    placeholder="Event title"
                    value={newEvent.title}
                    onChange={val => setNewEvent({ ...newEvent, title: val })}
                  />
                </FormGroup>
                <FormGroup>
                  <TextAreaUI
                    placeholder="Description (optional)"
                    value={newEvent.description}
                    onChange={val => setNewEvent({ ...newEvent, description: val })}
                  />
                </FormGroup>
                <AdminButtonUI
                  buttons={{ text: 'Add Event', onClick: handleSave, icon: 'plus', color: 'purple-bg' }}
                />
              </FormGroupWrapper>
            </>
          </div>
        )}
      </PopupUI>
    </div>
  );
};

// Field Component Integration
const EventCalendar: FieldComponent = {
  render: ({ field, value, onChange }) => (
    <EventCalendarUI {...field} value={value} onChange={onChange} />
  ),
};

export default EventCalendar;