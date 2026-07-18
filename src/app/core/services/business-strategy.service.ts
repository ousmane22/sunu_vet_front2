import { Injectable, inject, computed } from '@angular/core';
import { AuthService } from '../../features/auth/services/auth.service';
import { 
  BusinessStrategy, 
  VETERINARY_STRATEGY, 
  RETAIL_STRATEGY, 
  RESTAURANT_STRATEGY 
} from '../strategies/business.strategy';

@Injectable({
  providedIn: 'root'
})
export class BusinessStrategyService {
  private authService = inject(AuthService);

  strategy = computed<BusinessStrategy>(() => {
    const user = this.authService.currentUser();
    const type = user?.business_type || 'veterinary';

    switch (type) {
      case 'retail':
        return RETAIL_STRATEGY;
      case 'restaurant':
        return RESTAURANT_STRATEGY;
      case 'veterinary':
      default:
        return VETERINARY_STRATEGY;
    }
  });

  isVet = computed(() => this.strategy().type === 'veterinary');

  getLabel(key: keyof BusinessStrategy['labels']): string {
    return this.strategy().labels[key] || '';
  }

  isFieldVisible(field: string): boolean {
    return this.strategy().visibleFormFields.includes(field);
  }

  isMenuVisible(label: string): boolean {
    return this.strategy().visibleMenus.includes(label);
  }
}
