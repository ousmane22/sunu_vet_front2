import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-open-register-prompt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './open-register-prompt.component.html',
})
export class OpenRegisterPromptComponent {
  open = input.required<boolean>();
  /** Ex. « une vente » ou « une consultation » */
  activityLabel = input.required<string>();

  openRegister = output<void>();
  cancel = output<void>();
}
