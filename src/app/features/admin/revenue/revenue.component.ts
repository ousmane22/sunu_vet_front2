import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SuperAdminService, RevenuePaymentItem, RevenueFilters } from '../services/super-admin.service';

@Component({
  selector: 'app-revenue',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './revenue.component.html',
})
export class RevenueComponent implements OnInit {
  private superAdminService = inject(SuperAdminService);
  private fb = inject(FormBuilder);

  payments = signal<RevenuePaymentItem[]>([]);
  total = signal(0);
  count = signal(0);
  isLoading = signal(true);

  /** Années possibles pour le filtre (année en cours + 2 précédentes) */
  years: number[] = [];
  months = [
    { value: 1, label: 'Janvier' }, { value: 2, label: 'Février' }, { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' }, { value: 5, label: 'Mai' }, { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' }, { value: 8, label: 'Août' }, { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' }, { value: 11, label: 'Novembre' }, { value: 12, label: 'Décembre' },
  ];

  filterForm = this.fb.group({
    year: [null as number | null],
    month: [null as number | null],
    date_from: [null as string | null],
    date_to: [null as string | null],
  });

  ngOnInit() {
    const currentYear = new Date().getFullYear();
    this.years = [currentYear, currentYear - 1, currentYear - 2];
    this.load();
  }

  load() {
    this.isLoading.set(true);
    const v = this.filterForm.value;
    const filters: RevenueFilters = {};
    if (v.year != null) filters.year = v.year;
    if (v.month != null) filters.month = v.month;
    if (v.date_from) filters.date_from = v.date_from;
    if (v.date_to) filters.date_to = v.date_to;

    this.superAdminService.getRevenue(filters).subscribe({
      next: (res) => {
        this.payments.set(res.data);
        this.total.set(res.total);
        this.count.set(res.count);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  applyFilters() {
    this.load();
  }

  resetFilters() {
    this.filterForm.reset({ year: null, month: null, date_from: null, date_to: null });
    this.load();
  }
}




