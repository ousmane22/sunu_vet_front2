import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatPricePipe } from '../../../../../core/pipes';
import { PrintService } from '../../../../../core/services/print.service';
import type { Sale } from '../../../models';

@Component({
  selector: 'app-pos-sale-result',
  standalone: true,
  imports: [CommonModule, FormatPricePipe],
  templateUrl: './pos-sale-result.component.html',
})
export class PosSaleResultComponent {
  private printService = inject(PrintService);
  
  sale = input.required<Sale>();
  newSale = output<void>();

  onPrint() {
    this.printService.printSaleReceipt(this.sale());
  }
}
