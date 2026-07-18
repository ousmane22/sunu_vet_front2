import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Business } from '../../../models';

/**
 * Onglet Informations : affiche les coordonnées de la entreprise (lecture seule).
 */
@Component({
  selector: 'app-business-detail-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './business-detail-info.component.html',
})
export class BusinessDetailInfoComponent {
  business = input.required<Business>();
}




