import { Component, inject, signal, OnInit, HostListener, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AnimalService } from '../../services/animal.service';
import { AnimalSpeciesService } from '../../services/animal-species.service';
import { AnimalFormModalComponent } from './components/animal-form-modal.component';
import type { Animal, AnimalSpecies } from '../../models';
import { SunuDialogService } from '../../../../shared/services/sunu-dialog.service';
import { animalDisplayName } from '../../utils/animal-display.util';

@Component({
  selector: 'app-animals-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AnimalFormModalComponent],
  templateUrl: './animals-list.component.html',
})
export class AnimalsListComponent implements OnInit {
  private animalService = inject(AnimalService);
  private speciesService = inject(AnimalSpeciesService);
  private dialog = inject(SunuDialogService);

  animals = signal<Animal[]>([]);
  species = signal<AnimalSpecies[]>([]);
  selectedSpecies = signal<string>('all');
  isLoading = signal(true);
  searchControl = new FormControl('', { nonNullable: true });
  showFormModal = signal(false);
  editingAnimal = signal<Animal | null>(null);
  openMenuId = signal<number | null>(null);

  totalCount = computed(() => this.animals().length);
  activeCount = computed(() => this.animals().filter(a => a.status === 'active').length);

  filteredAnimals = computed(() => {
    const list = this.animals();
    const spec = this.selectedSpecies();
    if (spec === 'all') return list;
    return list.filter(a => (a.species_name || '').toLowerCase() === spec.toLowerCase());
  });

  ngOnInit(): void {
    this.loadSpecies();
    this.loadAnimals();
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.loadAnimals());
  }

  loadSpecies(): void {
    this.speciesService.getAll().subscribe({
      next: res => this.species.set(res.data),
      error: () => this.species.set([]),
    });
  }

  setSpeciesFilter(name: string): void {
    this.selectedSpecies.set(name);
  }

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

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      active: 'Actif',
      deceased: 'Décédé',
      transferred: 'Transféré',
    };
    return map[status] ?? status;
  }

  statusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'deceased':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'transferred':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  }

  loadAnimals(): void {
    this.isLoading.set(true);
    this.animalService.getAll({ search: this.searchControl.value || undefined }).subscribe({
      next: (res) => {
        this.animals.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  @HostListener('document:click')
  closeMenu(): void {
    this.openMenuId.set(null);
  }

  toggleMenu(id: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.openMenuId.update((current) => (current === id ? null : id));
  }

  openCreate(): void {
    this.editingAnimal.set(null);
    this.showFormModal.set(true);
  }

  openEdit(a: Animal, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.openMenuId.set(null);
    this.editingAnimal.set(a);
    this.showFormModal.set(true);
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
    this.editingAnimal.set(null);
  }

  onAnimalSaved(animal: Animal): void {
    this.closeFormModal();
    const list = this.animals();
    const idx = list.findIndex((a) => a.id === animal.id);
    if (idx >= 0) {
      const next = [...list];
      next[idx] = animal;
      this.animals.set(next);
    } else {
      this.animals.set([animal, ...list]);
    }
  }

  async deleteAnimal(a: Animal, event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    this.openMenuId.set(null);
    const confirmed = await this.dialog.confirm(`Supprimer le dossier « ${animalDisplayName(a)} » ?`, {
      title: 'Supprimer ce dossier ?',
      destructive: true,
      confirmText: 'Supprimer',
    });
    if (!confirmed) return;
    this.animalService.delete(a.id).subscribe({
      next: () => this.animals.set(this.animals().filter((x) => x.id !== a.id)),
    });
  }

  genderLabel(g: string): string {
    const map: Record<string, string> = {
      male: 'Mâle',
      female: 'Femelle',
      neutered_male: 'Mâle stérilisé',
      spayed_female: 'Femelle stérilisée',
      unknown: '—',
    };
    return map[g] ?? g;
  }

  displayName(a: Animal): string {
    return animalDisplayName(a);
  }
}
