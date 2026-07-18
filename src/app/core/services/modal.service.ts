import { Injectable, signal } from '@angular/core';

export interface ModalState<T = unknown> {
    isOpen: boolean;
    data?: T;
}

@Injectable({
    providedIn: 'root'
})
export class ModalService {
    private modals = new Map<string, ReturnType<typeof signal<ModalState>>>();

    /** Get or create a signal for a modal by ID */
    private getModal(id: string) {
        if (!this.modals.has(id)) {
            this.modals.set(id, signal<ModalState>({ isOpen: false }));
        }
        return this.modals.get(id)!;
    }

    /** Open a modal, optionally passing data */
    open<T = unknown>(id: string, data?: T) {
        this.getModal(id).set({ isOpen: true, data });
    }

    /** Close a modal */
    close(id: string) {
        this.getModal(id).set({ isOpen: false });
    }

    /** Read the state signal of a modal */
    state<T = unknown>(id: string): ReturnType<typeof signal<ModalState<T>>> {
        return this.getModal(id) as ReturnType<typeof signal<ModalState<T>>>;
    }

    /** Whether a modal is open */
    isOpen(id: string): boolean {
        return this.getModal(id)().isOpen;
    }
}


