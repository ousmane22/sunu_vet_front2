import { Component, HostListener, inject } from '@angular/core';
import { SunuDialogService } from '../../services/sunu-dialog.service';
import { SunuDialogState, SunuDialogType } from '../../services/sunu-dialog.types';

@Component({
  selector: 'app-sunu-dialog',
  standalone: true,
  imports: [],
  templateUrl: './sunu-dialog.component.html',
  styles: [`
    @keyframes sunuDialogBackdropIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes sunuDialogPanelIn {
      from {
        opacity: 0;
        transform: scale(0.96) translateY(8px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .animate-sunu-dialog-backdrop {
      animation: sunuDialogBackdropIn 0.18s ease-out;
    }

    .animate-sunu-dialog-panel {
      animation: sunuDialogPanelIn 0.22s ease-out;
    }
  `],
})
export class SunuDialogComponent {
  readonly dialog = inject(SunuDialogService);

  readonly iconWrapClasses: Record<SunuDialogType, string> = {
    info: 'bg-primary-50 text-primary-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
  };

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.dialog.state()) {
      this.dialog.dismiss();
    }
  }

  onBackdropClick(): void {
    this.dialog.dismiss();
  }

  confirmButtonClass(state: SunuDialogState): string {
    if (state.mode === 'confirm' && state.destructive) {
      return 'bg-red-600 hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600';
    }

    return 'bg-primary-700 hover:bg-primary-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700';
  }
}
