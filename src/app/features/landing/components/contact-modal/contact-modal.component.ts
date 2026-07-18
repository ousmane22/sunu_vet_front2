import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactModalService } from '../../services/contact-modal.service';

@Component({
  selector: 'app-contact-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-modal.component.html',
})
export class ContactModalComponent {
  contactModal = inject(ContactModalService);
}
