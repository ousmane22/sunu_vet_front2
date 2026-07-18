import { Component, inject, signal, input, output, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { BusinessStrategyService } from '../../../../core/services/business-strategy.service';
import type { Product, Category, ProductType } from '../../models';

/** Null = annulation, Product = produit créé ou modifié. */
export type ProductFormResult = Product | null;

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent {
  private fb = inject(FormBuilder);
  private service = inject(ProductService);
  private categoryService = inject(CategoryService);
  strategyService = inject(BusinessStrategyService);
  categories = signal<Category[]>([]);
  productTypes = signal<ProductType[]>([]);
  typesLoading = signal(true);
  typesLoadError = signal(false);

  product = input<Product | undefined>(undefined);
  isEditMode = computed(() => !!this.product());
  /** Émet le produit sauvegardé, ou null si annulation. */
  close = output<ProductFormResult>();

  isSaving = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    type: ['', [Validators.required]],
    category_id: [null as number | null],
    category: ['', [Validators.maxLength(255)]],
    unit: ['unité'],
    allow_fractional_quantity: [false],
    description: ['', [Validators.maxLength(1000)]],
    purchase_price: [0, [Validators.required, Validators.min(0)]],
    selling_price: [0, [Validators.required, Validators.min(0)]],
    stock_quantity: [0, [Validators.required, Validators.min(0)]],
    low_stock_threshold: [10, [Validators.min(0)]],
    expiry_date: [''],
  });

  constructor() {
    this.loadCategories();
    this.loadProductTypes();

    effect(() => {
      const med = this.product();
      const typeRows = this.productTypes();
      if (this.typesLoading()) {
        return;
      }

      if (this.typesLoadError() || typeRows.length === 0) {
        return;
      }

      const defaultSlug =
        typeRows.find((t) => t.slug === 'comprimé')?.slug
        ?? typeRows[0]!.slug;

      if (med) {
        let typeSlug = med.type;
        if (typeRows.length && !typeRows.some((t) => t.slug === typeSlug)) {
          typeSlug =
            typeRows.find((t) => t.slug === 'autre')?.slug ?? defaultSlug;
        }
        this.form.patchValue({
          name: med.name,
          type: typeSlug,
          category_id: med.category_id || null,
          category: typeof med.category === 'string' ? med.category : (med.category?.name || ''),
          unit: med.unit || 'unité',
          allow_fractional_quantity: !!med.allow_fractional_quantity,
          description: med.description,
          purchase_price: med.purchase_price,
          selling_price: med.selling_price,
          stock_quantity: med.stock_quantity,
          low_stock_threshold: med.low_stock_threshold,
          expiry_date: med.expiry_date,
        });
      } else {
        this.form.reset({
          name: '',
          type: defaultSlug,
          category: '',
          category_id: null,
          unit: 'unité',
          allow_fractional_quantity: false,
          description: '',
          purchase_price: 0,
          selling_price: 0,
          stock_quantity: 0,
          low_stock_threshold: 10,
          expiry_date: '',
        });
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (res) => this.categories.set(res.data),
    });
  }

  loadProductTypes(): void {
    this.typesLoading.set(true);
    this.typesLoadError.set(false);
    this.service.getProductTypes().subscribe({
      next: (res) => {
        this.productTypes.set(res.data);
        this.typesLoading.set(false);
      },
      error: () => {
        this.typesLoading.set(false);
        const med = this.product();
        if (med?.type) {
          this.productTypes.set([
            {
              id: med.product_type_id ?? 0,
              slug: med.type,
              label: med.type_label ?? med.type,
              sort_order: 0,
            },
          ]);
          this.typesLoadError.set(false);
        } else {
          this.productTypes.set([]);
          this.typesLoadError.set(true);
        }
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSaving()) return;

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const val = this.form.getRawValue();
    const payload: any = { ...val };
    
    // Nettoyage des valeurs vides
    if (!payload.description) delete payload.description;
    if (!payload.expiry_date) delete payload.expiry_date;
    if (!payload.category_id) payload.category_id = null;
    if (!payload.category) delete payload.category;

    const req = this.product()
      ? this.service.update(this.product()!.id, payload)
      : this.service.create(payload);

    req.subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.close.emit(res.data);
      },
      error: (err: any) => {
        this.isSaving.set(false);
        this.errorMessage.set(
          err.error?.message ?? (err.error?.errors ? Object.values(err.error.errors).flat().join(' ') : 'Erreur lors de l\'enregistrement.')
        );
      },
    });
  }

  onCancel(): void {
    this.close.emit(null);
  }
}





