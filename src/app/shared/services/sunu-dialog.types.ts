export type SunuDialogType = 'info' | 'success' | 'warning' | 'danger';

export interface SunuAlertOptions {
  title?: string;
  confirmText?: string;
  type?: SunuDialogType;
}

export interface SunuConfirmOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  type?: SunuDialogType;
  /** Bouton de confirmation rouge (suppression, annulation, etc.) */
  destructive?: boolean;
}

export type SunuDialogMode = 'alert' | 'confirm';

export interface SunuDialogState {
  mode: SunuDialogMode;
  message: string;
  title: string;
  type: SunuDialogType;
  confirmText: string;
  cancelText: string;
  destructive: boolean;
}
