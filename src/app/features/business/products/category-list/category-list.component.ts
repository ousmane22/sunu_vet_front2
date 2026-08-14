import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../services/category.service';
import type { Category } from '../../models';
import { CategoryFormComponent } from '../category-form/category-form.component';
import { SunuDialogService } from '../../../../shared/services/sunu-dialog.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, CategoryFormComponent],
  templateUrl: './category-list.component.html',
})
export class CategoryListComponent implements OnInit {
  private service = inject(CategoryService);
  private dialog = inject(SunuDialogService);

  categories = signal<Category[]>([]);
  isLoading = signal(true);
  showModal = signal(false);
  selectedCategory = signal<Category | undefined>(undefined);

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.service.getAll().subscribe({
      next: (res) => {
        this.categories.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  openCreateModal(): void {
    this.selectedCategory.set(undefined);
    this.showModal.set(true);
  }

  openEditModal(category: Category): void {
    this.selectedCategory.set(category);
    this.showModal.set(true);
  }

  closeModal(refresh: boolean): void {
    this.showModal.set(false);
    this.selectedCategory.set(undefined);
    if (refresh) this.loadCategories();
  }

  async deleteCategory(category: Category): Promise<void> {
    const confirmed = await this.dialog.confirm(`Supprimer la catégorie « ${category.name} » ?`, {
      title: 'Supprimer la catégorie',
      destructive: true,
      confirmText: 'Supprimer',
    });
    if (!confirmed) return;

    this.service.delete(category.id).subscribe({
      next: () => this.loadCategories(),
      error: async (err) => {
        await this.dialog.alert(err.error?.message || 'Erreur lors de la suppression.', {
          type: 'danger',
          title: 'Erreur',
        });
      },
    });
  }
}
