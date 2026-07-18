import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SuperAdminService, BusinessAdminListItem } from '../services/super-admin.service';

@Component({
  selector: 'app-business-admins',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './business-admins.component.html',
})
export class BusinessAdminsComponent implements OnInit {
  private superAdminService = inject(SuperAdminService);

  admins = signal<BusinessAdminListItem[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoading.set(true);
    this.superAdminService.getBusinessAdmins().subscribe({
      next: (res) => {
        this.admins.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }
}




