import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormatDatePipe, FormatPricePipe } from '../../../../core/pipes';
import { formatAgeFromBirthDate } from '../../../../core/utils/format.util';
import { animalDisplayName } from '../../utils/animal-display.util';
import { AnimalService } from '../../services/animal.service';
import { HospitalizationService } from '../../services/hospitalization.service';
import { VaccinationService } from '../../services/vaccination.service';
import { PrintService } from '../../../../core/services/print.service';
import { AnimalFormModalComponent } from '../animals-list/components/animal-form-modal.component';
import { VaccinationFormModalComponent } from './components/vaccination-form-modal.component';
import { HospitalizationFormModalComponent } from './components/hospitalization-form-modal.component';
import { DischargeHospitalizationModalComponent } from './components/discharge-hospitalization-modal.component';
import { ConsultationCreateModalComponent } from '../../consultations/consultations-list/components/consultation-create-modal.component';
import { EventCalendarComponent, CalendarEvent } from '../../shared/components/event-calendar/event-calendar.component';
import type { Animal, AnimalDetail, Consultation, Hospitalization, Vaccination } from '../../models';
import { SunuDialogService } from '../../../../shared/services/sunu-dialog.service';

type TabId = 'identite' | 'medical' | 'consultations' | 'vaccinations' | 'hospitalisations' | 'facturation' | 'notes';

interface AnimalTab {
  id: TabId;
  label: string;
  count?: number;
  icon: string;
}

@Component({
  selector: 'app-animal-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    FormatDatePipe,
    FormatPricePipe,
    AnimalFormModalComponent,
    VaccinationFormModalComponent,
    HospitalizationFormModalComponent,
    DischargeHospitalizationModalComponent,
    ConsultationCreateModalComponent,
    EventCalendarComponent,
    BaseChartDirective,
  ],
  templateUrl: './animal-detail.component.html',
})
export class AnimalDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private animalService = inject(AnimalService);
  private hospitalizationService = inject(HospitalizationService);
  private vaccinationService = inject(VaccinationService);
  private printService = inject(PrintService);
  private dialog = inject(SunuDialogService);

  animal = signal<AnimalDetail | null>(null);
  isLoading = signal(true);
  activeTab = signal<TabId>('identite');
  showEditModal = signal(false);
  editingAnimal = signal<Animal | null>(null);

  showConsultationModal = signal(false);
  showVaccinationModal = signal(false);
  editingVaccination = signal<Vaccination | null>(null);
  showHospitalizationModal = signal(false);
  dischargingHospitalization = signal<Hospitalization | null>(null);

  addingNoteFor = signal<number | null>(null);
  isSavingNote = signal(false);
  noteForm = new FormControl('', { nonNullable: true });

  vaccinationView = signal<'list' | 'calendar'>('list');

  consultations = computed(() => this.animal()?.consultations ?? []);
  vaccinations = computed(() => this.animal()?.vaccinations ?? []);
  hospitalizations = computed(() => this.animal()?.hospitalizations ?? []);

  private vaccinationsById = computed(() => {
    const map = new Map<number, Vaccination>();
    for (const v of this.vaccinations()) map.set(v.id, v);
    return map;
  });

  /** Événements FullCalendar pour le mini-calendrier (date d'administration de chaque vaccin). */
  vaccinationCalendarEvents = computed<CalendarEvent[]>(() =>
    this.vaccinations().map((v) => ({
      id: String(v.id),
      title: v.vaccine_type_name || v.vaccine_name || 'Vaccin',
      date: v.administered_at,
    }))
  );

  vaccinationFor(event: CalendarEvent): Vaccination | undefined {
    return this.vaccinationsById().get(Number(event.id));
  }

  /** Statistiques agrégées du carnet vaccinal, pour les cartes KPI et le graphique. */
  vaccinationStats = computed(() => {
    const list = this.vaccinations();
    const overdue = list.filter((v) => v.is_overdue).length;
    const dueSoon = list.filter((v) => !v.is_overdue && v.is_due_soon).length;
    const upToDate = list.length - overdue - dueSoon;
    const totalBilled = list.reduce((sum, v) => sum + (v.net_amount ?? 0), 0);
    return { total: list.length, overdue, dueSoon, upToDate, totalBilled };
  });

  vaccinationStatusChartData = computed(() => {
    const s = this.vaccinationStats();
    return {
      labels: ['À jour', 'Échéance proche', 'En retard'],
      datasets: [{
        data: [s.upToDate, s.dueSoon, s.overdue],
        backgroundColor: ['#059669', '#d97706', '#dc2626'],
        borderWidth: 0,
        hoverOffset: 6,
      }],
    };
  });

  vaccinationStatusChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: { legend: { display: true, position: 'bottom' as const, labels: { boxWidth: 10, font: { size: 11 } } } },
  };

  /** Fusion consultations + hospitalisations triée par date, pour l'onglet Facturation. */
  billingEntries = computed(() => {
    type Entry = { kind: 'consultation' | 'hospitalisation'; date: string; entry: Consultation | Hospitalization };
    const consultationEntries: Entry[] = this.consultations().map((c) => ({ kind: 'consultation', date: c.created_at, entry: c }));
    const hospitalizationEntries: Entry[] = this.hospitalizations().map((h) => ({ kind: 'hospitalisation', date: h.admitted_at, entry: h }));
    return [...consultationEntries, ...hospitalizationEntries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });

  tabs = computed<AnimalTab[]>(() => [
    { id: 'identite', label: 'Identité', icon: 'id' },
    { id: 'medical', label: 'Médical', icon: 'medical' },
    { id: 'consultations', label: 'Consultations', count: this.consultations().length, icon: 'consultation' },
    { id: 'vaccinations', label: 'Vaccinations', count: this.vaccinations().length, icon: 'vaccine' },
    { id: 'hospitalisations', label: 'Hospitalisations', count: this.hospitalizations().length, icon: 'hospital' },
    { id: 'facturation', label: 'Facturation', icon: 'billing' },
    { id: 'notes', label: 'Notes', icon: 'notes' },
  ]);

  getSpeciesEmoji(speciesName?: string | null): string {
    if (!speciesName) return '🐾';
    const s = speciesName.toLowerCase();
    if (s.includes('chien')) return '🐕';
    if (s.includes('chat')) return '🐈';
    if (s.includes('bovin') || s.includes('vache')) return '🐄';
    if (s.includes('ovin') || s.includes('mouton')) return '🐑';
    if (s.includes('caprin') || s.includes('chèvre')) return '🐐';
    if (s.includes('équin') || s.includes('cheval')) return '🐎';
    if (s.includes('âne')) return '🫏';
    if (s.includes('volaille') || s.includes('poule') || s.includes('coq')) return '🐓';
    if (s.includes('lapin')) return '🐇';
    if (s.includes('porc')) return '🐖';
    return '🐾';
  }

  openConsultationModal(): void {
    this.showConsultationModal.set(true);
  }

  closeConsultationModal(): void {
    this.showConsultationModal.set(false);
  }

  onConsultationSaved(c: Consultation): void {
    this.closeConsultationModal();
    if (this.animal()) {
      this.loadAnimal(this.animal()!.id);
      this.activeTab.set('consultations');
    }
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.isLoading.set(false);
      return;
    }
    this.loadAnimal(id);
  }

  loadAnimal(id: number): void {
    this.isLoading.set(true);
    this.animalService.getOne(id).subscribe({
      next: (res) => {
        this.animal.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  setTab(tab: TabId): void {
    this.activeTab.set(tab);
  }

  openEdit(): void {
    const a = this.animal();
    if (!a) return;
    this.editingAnimal.set(a);
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editingAnimal.set(null);
  }

  onAnimalSaved(saved: Animal): void {
    this.closeEditModal();
    this.loadAnimal(saved.id);
  }

  openVaccinationModal(): void {
    this.editingVaccination.set(null);
    this.showVaccinationModal.set(true);
  }

  editVaccination(v: Vaccination): void {
    this.editingVaccination.set(v);
    this.showVaccinationModal.set(true);
  }

  closeVaccinationModal(): void {
    this.showVaccinationModal.set(false);
    this.editingVaccination.set(null);
  }

  onVaccinationSaved(): void {
    this.closeVaccinationModal();
    this.loadAnimal(this.animal()!.id);
  }

  setVaccinationView(view: 'list' | 'calendar'): void {
    this.vaccinationView.set(view);
  }

  async deleteVaccination(v: Vaccination): Promise<void> {
    const label = v.vaccine_type_name || v.vaccine_name || 'ce vaccin';
    const confirmed = await this.dialog.confirm(`Supprimer ${label} du dossier ?`, {
      title: 'Supprimer ce vaccin ?',
      destructive: true,
      confirmText: 'Supprimer',
    });
    if (!confirmed) return;
    this.vaccinationService.delete(v.id).subscribe({
      next: () => this.loadAnimal(this.animal()!.id),
    });
  }

  openHospitalizationModal(): void {
    this.showHospitalizationModal.set(true);
  }

  closeHospitalizationModal(): void {
    this.showHospitalizationModal.set(false);
  }

  onHospitalizationSaved(): void {
    this.closeHospitalizationModal();
    this.loadAnimal(this.animal()!.id);
  }

  openDischargeModal(h: Hospitalization): void {
    this.dischargingHospitalization.set(h);
  }

  closeDischargeModal(): void {
    this.dischargingHospitalization.set(null);
  }

  onDischargeSaved(): void {
    this.closeDischargeModal();
    this.loadAnimal(this.animal()!.id);
  }

  startAddNote(hospitalizationId: number): void {
    this.noteForm.setValue('');
    this.addingNoteFor.set(hospitalizationId);
  }

  cancelAddNote(): void {
    this.addingNoteFor.set(null);
    this.noteForm.setValue('');
  }

  saveNote(hospitalizationId: number): void {
    const note = this.noteForm.value.trim();
    if (!note || this.isSavingNote()) return;

    this.isSavingNote.set(true);
    this.hospitalizationService.addNote(hospitalizationId, note).subscribe({
      next: () => {
        this.isSavingNote.set(false);
        this.addingNoteFor.set(null);
        this.noteForm.setValue('');
        this.loadAnimal(this.animal()!.id);
      },
      error: () => this.isSavingNote.set(false),
    });
  }

  async deleteAnimal(): Promise<void> {
    const a = this.animal();
    if (!a) return;
    const confirmed = await this.dialog.confirm(`Supprimer le dossier « ${animalDisplayName(a)} » ?`, {
      title: 'Supprimer ce dossier ?',
      destructive: true,
      confirmText: 'Supprimer',
    });
    if (!confirmed) return;
    this.animalService.delete(a.id).subscribe({
      next: () => this.router.navigate(['/business/clinique']),
    });
  }

  genderLabel(g: string): string {
    const map: Record<string, string> = {
      male: 'Mâle',
      female: 'Femelle',
      neutered_male: 'Mâle stérilisé',
      spayed_female: 'Femelle stérilisée',
      unknown: 'Non précisé',
    };
    return map[g] ?? g;
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      active: 'Actif',
      deceased: 'Décédé',
      transferred: 'Transféré',
      completed: 'Réglée',
      partial: 'Partiel',
      pending: 'En attente',
      cancelled: 'Annulée',
      discharged: 'Sortie',
    };
    return map[status] ?? status;
  }

  statusClass(status: string): string {
    switch (status) {
      case 'completed':
      case 'active':
      case 'discharged':
        return 'bg-green-100 text-green-700';
      case 'partial':
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'cancelled':
      case 'deceased':
        return 'bg-gray-100 text-gray-600';
      case 'transferred':
        return 'bg-primary-100 text-primary-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  displayName(a: AnimalDetail): string {
    return animalDisplayName({
      name: a.name,
      species_name: a.animal_species?.name || a.species_name,
      id: a.id,
    });
  }

  birthDisplay(a: AnimalDetail): string {
    if (a.date_of_birth) {
      const age = formatAgeFromBirthDate(a.date_of_birth);
      return age ? `${a.date_of_birth} (${age})` : a.date_of_birth;
    }
    return a.age_notes || '—';
  }

  isConsultation(entry: Consultation | Hospitalization): entry is Consultation {
    return !('admitted_at' in entry);
  }

  entryLabel(entry: Consultation | Hospitalization): string {
    return this.isConsultation(entry) ? (entry.reason_visit || 'Consultation') : `Hospitalisation${entry.location ? ' — ' + entry.location : ''}`;
  }

  entryDate(entry: Consultation | Hospitalization): string {
    return this.isConsultation(entry) ? entry.created_at : entry.admitted_at;
  }

  printBilling(): void {
    const a = this.animal();
    if (!a) return;
    this.printService.printAnimalBilling(a, this.billingEntries());
  }
}
