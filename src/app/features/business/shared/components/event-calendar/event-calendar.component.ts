import { Component, input, output, viewChild, contentChild, TemplateRef, signal } from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { FullCalendarModule, FullCalendarComponent, CalendarOptions, EventInput, EventClickInfo, DatesSetInfo } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/angular/daygrid';
import frLocale from 'fullcalendar/locales/fr';

export type CalendarEvent = EventInput;

/** Wrapper FullCalendar (vue mois) : navigation + rendu custom Tailwind par événement, réutilisable. */
@Component({
  selector: 'app-event-calendar',
  standalone: true,
  imports: [CommonModule, NgTemplateOutlet, FullCalendarModule],
  templateUrl: './event-calendar.component.html',
})
export class EventCalendarComponent {
  events = input<CalendarEvent[]>([]);

  eventClick = output<CalendarEvent>();
  /** Émis quand la plage visible change (navigation mois précédent/suivant/aujourd'hui). */
  rangeChange = output<{ start: Date; end: Date }>();

  eventTemplate = contentChild<TemplateRef<{ $implicit: EventClickInfo['event'] }>>('eventTemplate');

  private fullCalendar = viewChild<FullCalendarComponent>('calendar');

  monthLabel = signal('');

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    locale: frLocale,
    headerToolbar: false,
    height: 'auto',
    eventClick: (arg) => {
      arg.jsEvent.preventDefault();
      this.eventClick.emit(arg.event as unknown as CalendarEvent);
    },
    datesSet: (arg: DatesSetInfo) => {
      this.monthLabel.set(arg.view.title);
      this.rangeChange.emit({ start: arg.view.currentStart, end: arg.view.currentEnd });
    },
  };

  previousMonth(): void {
    this.fullCalendar()?.getApi().prev();
  }

  nextMonth(): void {
    this.fullCalendar()?.getApi().next();
  }

  today(): void {
    this.fullCalendar()?.getApi().today();
  }
}
