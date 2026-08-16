import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VaccinationService } from '../../services/vaccination.service';
import { EventCalendarComponent, CalendarEvent } from '../../shared/components/event-calendar/event-calendar.component';
import type { Vaccination } from '../../models';

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

@Component({
  selector: 'app-vaccination-calendar',
  standalone: true,
  imports: [CommonModule, EventCalendarComponent],
  templateUrl: './vaccination-calendar.component.html',
})
export class VaccinationCalendarComponent implements OnInit {
  private vaccinationService = inject(VaccinationService);
  private router = inject(Router);

  month = signal(new Date());
  vaccinations = signal<Vaccination[]>([]);
  isLoading = signal(true);

  private vaccinationsById = computed(() => {
    const map = new Map<number, Vaccination>();
    for (const v of this.vaccinations()) map.set(v.id, v);
    return map;
  });

  calendarEvents = computed<CalendarEvent[]>(() =>
    this.vaccinations()
      .filter((v) => !!v.next_due_at)
      .map((v) => ({
        id: String(v.id),
        title: `${v.animal?.name || 'Animal'} — ${v.vaccine_type_name || v.vaccine_name || 'Vaccin'}`,
        date: v.next_due_at!,
        classNames: [v.is_overdue ? 'is-overdue' : v.is_due_soon ? 'is-due-soon' : 'is-upcoming'],
      }))
  );

  ngOnInit(): void {
    this.loadMonth();
  }

  onRangeChange({ start }: { start: Date; end: Date }): void {
    this.month.set(start);
    this.loadMonth();
  }

  private loadMonth(): void {
    const m = this.month();
    const from = toDateKey(new Date(m.getFullYear(), m.getMonth(), 1));
    const to = toDateKey(new Date(m.getFullYear(), m.getMonth() + 1, 0));

    this.isLoading.set(true);
    this.vaccinationService.getUpcoming(from, to).subscribe({
      next: (res) => {
        this.vaccinations.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  vaccinationFor(event: CalendarEvent): Vaccination | undefined {
    return this.vaccinationsById().get(Number(event.id));
  }

  goToAnimal(event: CalendarEvent): void {
    const v = this.vaccinationFor(event);
    if (!v?.animal?.id) return;
    this.router.navigate(['/business/clinique', v.animal.id]);
  }
}
