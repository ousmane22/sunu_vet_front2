import { Component, inject, signal, OnInit, OnDestroy, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormatPricePipe } from '../../../../core/pipes';
import { ProductService } from '../../services/product.service';
import { CashRegisterService } from '../../services/cash-register.service';
import { CartService } from '../../services/cart.service';
import { BusinessProfileService } from '../../services/business-profile.service';
import { BusinessStrategyService } from '../../../../core/services/business-strategy.service';
import { OpenRegisterSessionService } from '../../services/open-register-session.service';
import { OpenRegisterPromptService } from '../../services/open-register-prompt.service';
import { OpenRegisterPromptComponent } from '../../../../shared/components/open-register-prompt/open-register-prompt.component';
import { PAGINATION } from '../../../../core/config/pagination.config';
import type { PosProduct, PosProductListResponse, CashRegister } from '../../models';

@Component({
    selector: 'app-pos-product-grid',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, FormatPricePipe, OpenRegisterPromptComponent],
    templateUrl: './pos-product-grid.component.html',
    host: {
        'class': 'flex flex-col min-h-0 flex-1'
    },
    styles: [`
      .pos-products-grid {
        display: grid;
        gap: 0.625rem;
        /* Nombre de colonnes = largeur dispo du panneau (pas le viewport) */
        grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
      }
      @media (min-width: 480px) {
        .pos-products-grid {
          gap: 0.75rem;
          grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
        }
      }
      @media (min-width: 1024px) {
        .pos-products-grid {
          gap: 0.875rem;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        }
      }
      @media (min-width: 1536px) {
        .pos-products-grid {
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        }
      }
    `],
})
export class PosProductGridComponent implements OnInit {
    private productService = inject(ProductService);
    private cashRegisterService = inject(CashRegisterService);
    private destroyRef = inject(DestroyRef);
    private cartService = inject(CartService);
    private profileService = inject(BusinessProfileService);
    registerSession = inject(OpenRegisterSessionService);
    private registerPrompt = inject(OpenRegisterPromptService);
    private fb = inject(FormBuilder);
    strategyService = inject(BusinessStrategyService);

    products = signal<PosProduct[]>([]);
    loading = signal(true);
    activeRegister = signal<CashRegister | null>(null);
    requireOpenRegister = signal(false);
    showRegisterPrompt = signal(false);

    searchControl = this.fb.control('');

    meta = signal<{ current_page: number; last_page: number; total: number } | null>(null);
    hasMore = computed(() => {
        const m = this.meta();
        return m ? m.current_page < m.last_page : false;
    });

    ngOnInit(): void {
        this.loadActiveRegister();
        this.loadRequireOpenRegister();

        this.cashRegisterService.onChanged()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.loadActiveRegister());

        this.profileService.onChanged()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.loadRequireOpenRegister());

        this.loadProducts();
        this.searchControl.valueChanges
            .pipe(debounceTime(250), distinctUntilChanged())
            .subscribe(() => this.loadProducts());
    }

    private loadActiveRegister(): void {
        this.cashRegisterService.getCurrent(true).subscribe({
            next: (res) => this.activeRegister.set(res.data),
            error: () => this.activeRegister.set(null),
        });
    }

    private loadRequireOpenRegister(): void {
        this.profileService.getProfile(true).subscribe({
            next: (res) => this.requireOpenRegister.set(res.data.settings?.require_open_register === true),
            error: () => this.requireOpenRegister.set(false),
        });
    }

    loadProducts(page = 1): void {
        this.loading.set(page === 1);
        this.productService.getForPos({
            search: this.searchControl.value ?? '',
            per_page: PAGINATION.POS,
            page,
        }).subscribe({
            next: (res: PosProductListResponse) => {
                const list = Array.isArray(res?.data) ? res.data : [];
                if (page === 1) {
                    this.products.set(list);
                } else {
                    this.products.update(prev => [...prev, ...list]);
                }
                this.meta.set(res?.meta ?? null);
                this.loading.set(false);
            },
            error: () => this.loading.set(false),
        });
    }

    loadMore(): void {
        const m = this.meta();
        if (m && m.current_page < m.last_page) {
            this.loadProducts(m.current_page + 1);
        }
    }

    addToCart(med: PosProduct): void {
        if (this.registerSession.shouldBlock(this.requireOpenRegister(), !!this.activeRegister(), 'pos')) {
            this.showRegisterPrompt.set(true);
            return;
        }
        if (med.stock_quantity <= 0) return;
        this.cartService.add(med);
        this.playAddSound();
    }

    onOpenRegisterFromPrompt(): void {
        this.showRegisterPrompt.set(false);
        this.registerPrompt.openRegisterPage('/business/pos');
    }

    private playAddSound(): void {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            if (ctx.state === 'suspended') {
                ctx.resume();
            }
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 800;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.08);
        } catch {
            // AudioContext non supporté ou bloqué
        }
    }

    getCategoryName(product: PosProduct): string {
        return product.category || '—';
    }

    /** Badge coloré stable selon le libellé (catégorie ou type). */
    getBadgeClass(label: string): string {
        const palette = [
            'bg-sky-100 text-sky-800',
            'bg-violet-100 text-violet-800',
            'bg-emerald-100 text-emerald-800',
            'bg-amber-100 text-amber-900',
            'bg-rose-100 text-rose-800',
            'bg-teal-100 text-teal-800',
            'bg-indigo-100 text-indigo-800',
            'bg-orange-100 text-orange-900',
            'bg-fuchsia-100 text-fuchsia-800',
            'bg-cyan-100 text-cyan-800',
        ];
        const key = (label || '').trim().toLowerCase();
        if (!key || key === '—') {
            return 'bg-zinc-100 text-zinc-700';
        }
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
            hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
        }
        return palette[hash % palette.length];
    }

    getBadgeLabel(product: PosProduct): string {
        return this.strategyService.isVet() ? product.type : this.getCategoryName(product);
    }
}
