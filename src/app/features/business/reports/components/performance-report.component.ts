import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerformanceReport } from '../../models/report.model';
import { FormatPricePipe } from '../../../../core/pipes';
import { BusinessStrategyService } from '../../../../core/services/business-strategy.service';

@Component({
    selector: 'app-performance-report',
    standalone: true,
    imports: [CommonModule, FormatPricePipe],
    templateUrl: './performance-report.component.html'
})
export class PerformanceReportComponent {
    @Input({ required: true }) data!: PerformanceReport;
    strategyService = inject(BusinessStrategyService);
}
