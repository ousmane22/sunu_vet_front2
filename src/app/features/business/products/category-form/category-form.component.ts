import { Component, inject, signal, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import type { Category } from '../../models';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-form.component.html',
})
export class CategoryFormComponent {
  private fb = inject(FormBuilder);
  private service = inject(CategoryService);

  category = input<Category | undefined>(undefined);
  close = output<boolean>();

  isSaving = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', [Validators.maxLength(500)]],
    is_active: [true],
  });

  constructor() {
    effect(() => {
      const cat = this.category();
      if (cat) {
        this.form.patchValue({
          name: cat.name,
          description: cat.description || '',
          is_active: cat.is_active,
        });
      } else {
        this.form.reset({ is_active: true });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSaving()) return;

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const val = this.form.getRawValue();
    const req = this.category()
      ? this.service.update(this.category()!.id, val as any)
      : this.service.create(val as any);

    req.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.close.emit(true);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(err.error?.message || 'Une erreur est survenue.');
      },
    });
  }

  onCancel(): void {
    this.close.emit(false);
  }
}
