import React, { useState } from 'react';
import { Calendar, DateObject } from 'react-multi-date-picker';
import { FieldComponent } from './types';
import { PopupUI } from './Popup';
import { ExpandablePanelGroupUI } from './ExpandablePanelGroup';

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
// const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
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

  // Get appLocalizer from window
  const appLocalizer = (window as any).appLocalizer || {};

  const updateEvents = (updated: EventsData) => {
    onChange?.(updated);
  };

  // Handle panel changes
  const handlePanelChange = (data: Record<string, Record<string, unknown>>) => {
    if (!selectedDate) return;

    const key = toDateKey(selectedDate);

    // Convert panel data back to calendar events format
    const updatedEvents = Object.entries(data).map(([id, values]) => ({
      id,
      title: (values.title as string),
      description: (values.description as string) || ''
    }));

    updateEvents({
      ...events,
      [key]: updatedEvents
    });
  };

  const selectedDateEvents = selectedDate ? events[toDateKey(selectedDate)] || [] : [];

  const getPanelMethods = () => {
    if (!selectedDate) return [];

    return selectedDateEvents.map(event => ({
      id: event.id,
      label: event.title,
      desc: event.description || '',
      connected: true,
      isCustom: true,
      disableBtn: false,
      hideDeleteBtn: false,
      countBtn: false,
      openForm: false,
    }));
  };

  const getPanelValues = () => {
    if (!selectedDate) return {};

    return selectedDateEvents.reduce((acc, event) => ({
      ...acc,
      [event.id]: {
        title: event.title,
        description: event.description || '',
        enable: true
      }
    }), {});
  };

  return (
    <div className={`settings-event-calendar ${wrapperClass}`}>
      <Calendar
        format={format}
        numberOfMonths={NumberOfMonth}
        fullYear={fullYear}
        mapDays={({ date }) => {
          const dayEvents = events[toDateKey(date)] || [];
          return {
            onClick: () => setSelectedDate(date),
            children: (
              <div className="sd">
                <span className='date'>{date.day}</span>
                {dayEvents.slice(0, 3).map(event => (
                  <div key={event.id} className='event' title={event.title}>
                    <div className="name">
                      {event.title.length > 20 ? `${event.title.substring(0, 20)}...` : event.title}
                    </div>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="event-more">+{dayEvents.length - 3} more</div>
                )}
              </div>
            ),
          };
        }}
      />

      <PopupUI
        position="lightbox"
        open={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        header={{
          icon: 'coupon',
          title: `Events for ${selectedDate?.format("MMMM DD, YYYY")}`,
          description: `${selectedDateEvents.length} event${selectedDateEvents.length !== 1 ? 's' : ''}`
        }}
        width={45}
      >
        {selectedDate && (
          <ExpandablePanelGroupUI
            key={selectedDate.toString()}
            name="calendar-events"
            apilink="calendar-events"
            appLocalizer={appLocalizer}
            methods={getPanelMethods()}
            value={getPanelValues()}
            onChange={handlePanelChange}
            isWizardMode={false}
            canAccess={true}
            addNewBtn={true}
            addNewTemplate={{
              label: 'New Event',
              desc: 'Add a new event to this day',
              iconEnable: false,
              editableFields: {
                title: true,
                description: true,
                icon: false
              },
            }}
          />
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