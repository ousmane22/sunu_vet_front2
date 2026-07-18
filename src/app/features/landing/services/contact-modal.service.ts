import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ContactModalService {
  private _isOpen = signal(false);
  isOpen = this._isOpen.asReadonly();

  open(): void {
    this._isOpen.set(true);
  }

  close(): void {
    this._isOpen.set(false);
  }
}
