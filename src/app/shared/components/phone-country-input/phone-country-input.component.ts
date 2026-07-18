import {
    Component,
    forwardRef,
    signal,
    Input,
    ChangeDetectorRef,
    OnInit,
    inject,
    HostListener,
    ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { RestCountriesService, type PhoneCountry } from '../../../core/services/rest-countries.service';

const FLAG_CDN = 'https://flagcdn.com/w40';
const FALLBACK_COUNTRIES: PhoneCountry[] = [
    { code: 'SN', dialCode: '+221', flag: '🇸🇳', flagUrl: `${FLAG_CDN}/sn.png`, name: 'Sénégal' },
    { code: 'ML', dialCode: '+223', flag: '🇲🇱', flagUrl: `${FLAG_CDN}/ml.png`, name: 'Mali' },
    { code: 'MR', dialCode: '+222', flag: '🇲🇷', flagUrl: `${FLAG_CDN}/mr.png`, name: 'Mauritanie' },
    { code: 'GM', dialCode: '+220', flag: '🇬🇲', flagUrl: `${FLAG_CDN}/gm.png`, name: 'Gambie' },
    { code: 'GN', dialCode: '+224', flag: '🇬🇳', flagUrl: `${FLAG_CDN}/gn.png`, name: 'Guinée' },
    { code: 'CI', dialCode: '+225', flag: '🇨🇮', flagUrl: `${FLAG_CDN}/ci.png`, name: "Côte d'Ivoire" },
    { code: 'BF', dialCode: '+226', flag: '🇧🇫', flagUrl: `${FLAG_CDN}/bf.png`, name: 'Burkina Faso' },
    { code: 'FR', dialCode: '+33', flag: '🇫🇷', flagUrl: `${FLAG_CDN}/fr.png`, name: 'France' },
];

const DEFAULT_COUNTRY = FALLBACK_COUNTRIES[0];

@Component({
    selector: 'app-phone-country-input',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PhoneCountryInputComponent),
            multi: true,
        },
    ],
    template: `
        <div class="flex rounded-xl border border-slate-200 bg-slate-50 overflow-visible focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all relative" [class.border-red-300]="hasError">
            <button
                type="button"
                (click)="dropdownOpen.set(!dropdownOpen())"
                class="flex items-center gap-2 bg-slate-100 border-r border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none cursor-pointer min-w-[100px] hover:bg-slate-200 transition-colors"
                [title]="selectedCountry().name">
                <img [src]="selectedCountry().flagUrl" [alt]="selectedCountry().name" class="w-6 h-4 object-cover rounded shrink-0" loading="lazy" />
                <span>{{ selectedCountry().dialCode }}</span>
            </button>
            @if (dropdownOpen()) {
                <div class="absolute left-0 top-full z-50 mt-1 max-h-56 w-72 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg py-1">
                    @for (c of getCountriesList(); track c.code) {
                        <button
                            type="button"
                            (click)="selectCountry(c)"
                            class="flex items-center gap-3 w-full px-3 py-2 text-left text-sm hover:bg-slate-100 transition-colors">
                            <img [src]="c.flagUrl" [alt]="c.name" class="w-6 h-4 object-cover rounded shrink-0" loading="lazy" />
                            <span class="font-medium text-slate-700">{{ c.dialCode }}</span>
                            <span class="text-slate-500 truncate">{{ c.name }}</span>
                        </button>
                    }
                </div>
            }
            <input
                type="tel"
                [value]="nationalNumber()"
                (input)="onNationalInput($event)"
                (blur)="notifyTouched()"
                [placeholder]="placeholder"
                class="flex-1 min-w-0 bg-transparent border-none px-4 py-2.5 text-slate-900 placeholder-slate-400 outline-none text-sm font-medium" />
        </div>
    `,
})
export class PhoneCountryInputComponent implements ControlValueAccessor, OnInit {
    @Input() placeholder = '33 123 45 67';
    @Input() hasError = false;

    private restCountries = inject(RestCountriesService);
    private cdr = inject(ChangeDetectorRef);
    private el = inject(ElementRef);

    dropdownOpen = signal(false);
    countries = signal<PhoneCountry[]>(FALLBACK_COUNTRIES);
    selectedCountry = signal<PhoneCountry>(DEFAULT_COUNTRY);
    nationalNumber = signal('');

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event): void {
        const target = event.target as HTMLElement;
        if (this.dropdownOpen() && !this.el.nativeElement.contains(target)) {
            this.dropdownOpen.set(false);
        }
    }

    private onChange: (value: string) => void = () => {};
    private _onTouched: () => void = () => {};

    ngOnInit(): void {
        this.restCountries.getPhoneCountries('SN').subscribe((list: PhoneCountry[]) => {
            if (list.length > 0) {
                this.countries.set(list);
                this.selectedCountry.set(list[0]);
                this.cdr.markForCheck();
            }
        });
    }

    getCountriesList(): PhoneCountry[] {
        return this.countries().length > 0 ? this.countries() : FALLBACK_COUNTRIES;
    }

    static parseFullNumber(full: string | null | undefined, countriesList: PhoneCountry[] = FALLBACK_COUNTRIES): { dialCode: string; national: string } {
        if (!full || typeof full !== 'string') return { dialCode: DEFAULT_COUNTRY.dialCode, national: '' };
        const trimmed = full.trim();
        const match = trimmed.match(/^(\+\d{1,4})\s*(.*)$/);
        if (match) {
            const dialCode = match[1];
            const national = (match[2] || '').replace(/\s+/g, ' ').trim();
            const country = countriesList.find(c => c.dialCode === dialCode);
            return { dialCode: country ? dialCode : DEFAULT_COUNTRY.dialCode, national };
        }
        if (trimmed.startsWith('+')) {
            const firstSpace = trimmed.indexOf(' ');
            const dial = firstSpace > 0 ? trimmed.slice(0, firstSpace) : trimmed.slice(0, 5);
            const country = countriesList.find(c => c.dialCode === dial) ?? DEFAULT_COUNTRY;
            const national = firstSpace > 0 ? trimmed.slice(firstSpace).replace(/\s+/g, ' ').trim() : '';
            return { dialCode: country.dialCode, national };
        }
        return { dialCode: DEFAULT_COUNTRY.dialCode, national: trimmed.replace(/\s+/g, ' ').trim() };
    }

    private emitValue(): void {
        const national = this.nationalNumber().replace(/\s+/g, ' ').trim();
        const dial = this.selectedCountry().dialCode;
        const full = national ? `${dial} ${national}` : '';
        this.onChange(full);
    }

    selectCountry(c: PhoneCountry): void {
        this.selectedCountry.set(c);
        this.dropdownOpen.set(false);
        this.emitValue();
        this.cdr.markForCheck();
    }

    onNationalInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        let v = input.value.replace(/[^\d\s]/g, '');
        this.nationalNumber.set(v);
        this.emitValue();
    }

    notifyTouched(): void {
        this._onTouched();
    }

    writeValue(value: string | null | undefined): void {
        const list = this.getCountriesList();
        const { dialCode, national } = PhoneCountryInputComponent.parseFullNumber(value, list);
        const country = list.find(c => c.dialCode === dialCode) ?? DEFAULT_COUNTRY;
        this.selectedCountry.set(country);
        this.nationalNumber.set(national);
        this.cdr.markForCheck();
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this._onTouched = fn;
    }
}
