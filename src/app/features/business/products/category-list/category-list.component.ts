import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../services/category.service';
import type { Category } from '../../models';
import { CategoryFormComponent } from '../category-form/category-form.component';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, CategoryFormComponent],
  templateUrl: './category-list.component.html',
})
export class CategoryListComponent implements OnInit {
  private service = inject(CategoryService);

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

  deleteCategory(category: Category): void {
    if (confirm(`Supprimer la catégorie "${category.name}" ?`)) {
      this.service.delete(category.id).subscribe({
        next: () => this.loadCategories(),
        error: (err) => alert(err.error?.message || 'Erreur lors de la suppression.'),
      });
    }
  }
}
