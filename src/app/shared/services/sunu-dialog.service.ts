import { Injectable, signal } from '@angular/core';
import {
  SunuAlertOptions,
  SunuConfirmOptions,
  SunuDialogMode,
  SunuDialogState,
  SunuDialogType,
} from './sunu-dialog.types';

interface PendingDialog {
  mode: SunuDialogMode;
  message: string;
  title: string;
  type: SunuDialogType;
  confirmText: string;
  cancelText: string;
  destructive: boolean;
  resolve: (value: boolean | void) => void;
}

@Injectable({ providedIn: 'root' })
export class SunuDialogService {
  private readonly queue: PendingDialog[] = [];
  private readonly _state = signal<SunuDialogState | null>(null);

  /** État du dialogue affiché (null = fermé). */
  readonly state = this._state.asReadonly();

  alert(message: string, options: SunuAlertOptions = {}): Promise<void> {
    return new Promise((resolve) => {
      this.enqueue({
        mode: 'alert',
        message,
        title: options.title ?? 'Information',
        type: options.type ?? 'info',
        confirmText: options.confirmText ?? 'OK',
        cancelText: '',
        destructive: false,
        resolve: () => resolve(),
      });
    });
  }

  confirm(message: string, options: SunuConfirmOptions = {}): Promise<boolean> {
    const type = options.type ?? (options.destructive ? 'danger' : 'warning');

    return new Promise((resolve) => {
      this.enqueue({
        mode: 'confirm',
        message,
        title: options.title ?? (options.destructive ? 'Attention' : 'Confirmation'),
        type,
        confirmText: options.confirmText ?? 'Confirmer',
        cancelText: options.cancelText ?? 'Annuler',
        destructive: options.destructive ?? false,
        resolve: (value) => resolve(!!value),
      });
    });
  }

  /** Fermeture positive (OK / Confirmer). */
  accept(): void {
    const current = this._state();
    if (!current) return;

    const pending = this.queue.shift();
    if (!pending) return;

    pending.resolve(current.mode === 'confirm' ? true : undefined);
    this.showNext();
  }

  /** Fermeture négative (Annuler, clic backdrop, Échap). */
  dismiss(): void {
    const current = this._state();
    if (!current) return;

    const pending = this.queue.shift();
    if (!pending) return;

    pending.resolve(current.mode === 'alert' ? undefined : false);
    this.showNext();
  }

  private enqueue(dialog: PendingDialog): void {
    const isFirst = this.queue.length === 0 && !this._state();
    this.queue.push(dialog);

    if (isFirst) {
      this.showNext();
    }
  }

  private showNext(): void {
    const next = this.queue[0];

    if (!next) {
      this._state.set(null);
      return;
    }

    this._state.set({
      mode: next.mode,
      message: next.message,
      title: next.title,
      type: next.type,
      confirmText: next.confirmText,
      cancelText: next.cancelText,
      destructive: next.destructive,
    });
  }
}
