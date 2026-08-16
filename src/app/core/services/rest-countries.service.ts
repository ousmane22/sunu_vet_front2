import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface PhoneCountry {
    code: string;
    dialCode: string;
    flag: string;
    flagUrl: string;
    name: string;
}

const DEFAULT_COUNTRY_CODE = 'SN';
const FLAG_CDN = 'https://flagcdn.com/w40';

interface RawCountry {
    code: string;
    dialCode: string;
    name: string;
}

/**
 * Liste statique (indicatifs téléphoniques quasi immuables) — évite une dépendance
 * réseau vers une API tierce (restcountries.com, dépréciée et sujette au CORS).
 */
const RAW_COUNTRIES: RawCountry[] = [
    // Afrique de l'Ouest
    { code: 'SN', dialCode: '+221', name: 'Sénégal' },
    { code: 'ML', dialCode: '+223', name: 'Mali' },
    { code: 'MR', dialCode: '+222', name: 'Mauritanie' },
    { code: 'GM', dialCode: '+220', name: 'Gambie' },
    { code: 'GN', dialCode: '+224', name: 'Guinée' },
    { code: 'GW', dialCode: '+245', name: 'Guinée-Bissau' },
    { code: 'CI', dialCode: '+225', name: "Côte d'Ivoire" },
    { code: 'BF', dialCode: '+226', name: 'Burkina Faso' },
    { code: 'NE', dialCode: '+227', name: 'Niger' },
    { code: 'TG', dialCode: '+228', name: 'Togo' },
    { code: 'BJ', dialCode: '+229', name: 'Bénin' },
    { code: 'GH', dialCode: '+233', name: 'Ghana' },
    { code: 'NG', dialCode: '+234', name: 'Nigéria' },
    { code: 'LR', dialCode: '+231', name: 'Liberia' },
    { code: 'SL', dialCode: '+232', name: 'Sierra Leone' },
    { code: 'CV', dialCode: '+238', name: 'Cap-Vert' },
    // Afrique centrale
    { code: 'CM', dialCode: '+237', name: 'Cameroun' },
    { code: 'GA', dialCode: '+241', name: 'Gabon' },
    { code: 'CG', dialCode: '+242', name: 'Congo' },
    { code: 'CD', dialCode: '+243', name: 'RD Congo' },
    { code: 'TD', dialCode: '+235', name: 'Tchad' },
    { code: 'CF', dialCode: '+236', name: 'Centrafrique' },
    { code: 'GQ', dialCode: '+240', name: 'Guinée équatoriale' },
    // Afrique de l'Est
    { code: 'KE', dialCode: '+254', name: 'Kenya' },
    { code: 'ET', dialCode: '+251', name: 'Éthiopie' },
    { code: 'TZ', dialCode: '+255', name: 'Tanzanie' },
    { code: 'UG', dialCode: '+256', name: 'Ouganda' },
    { code: 'RW', dialCode: '+250', name: 'Rwanda' },
    { code: 'DJ', dialCode: '+253', name: 'Djibouti' },
    { code: 'SO', dialCode: '+252', name: 'Somalie' },
    { code: 'BI', dialCode: '+257', name: 'Burundi' },
    // Afrique du Nord
    { code: 'MA', dialCode: '+212', name: 'Maroc' },
    { code: 'DZ', dialCode: '+213', name: 'Algérie' },
    { code: 'TN', dialCode: '+216', name: 'Tunisie' },
    { code: 'LY', dialCode: '+218', name: 'Libye' },
    { code: 'EG', dialCode: '+20', name: 'Égypte' },
    { code: 'SD', dialCode: '+249', name: 'Soudan' },
    // Afrique australe
    { code: 'ZA', dialCode: '+27', name: 'Afrique du Sud' },
    { code: 'ZM', dialCode: '+260', name: 'Zambie' },
    { code: 'ZW', dialCode: '+263', name: 'Zimbabwe' },
    { code: 'MZ', dialCode: '+258', name: 'Mozambique' },
    { code: 'AO', dialCode: '+244', name: 'Angola' },
    { code: 'NA', dialCode: '+264', name: 'Namibie' },
    { code: 'BW', dialCode: '+267', name: 'Botswana' },
    { code: 'MG', dialCode: '+261', name: 'Madagascar' },
    { code: 'MU', dialCode: '+230', name: 'Maurice' },
    // Europe
    { code: 'FR', dialCode: '+33', name: 'France' },
    { code: 'BE', dialCode: '+32', name: 'Belgique' },
    { code: 'CH', dialCode: '+41', name: 'Suisse' },
    { code: 'LU', dialCode: '+352', name: 'Luxembourg' },
    { code: 'DE', dialCode: '+49', name: 'Allemagne' },
    { code: 'GB', dialCode: '+44', name: 'Royaume-Uni' },
    { code: 'ES', dialCode: '+34', name: 'Espagne' },
    { code: 'PT', dialCode: '+351', name: 'Portugal' },
    { code: 'IT', dialCode: '+39', name: 'Italie' },
    { code: 'NL', dialCode: '+31', name: 'Pays-Bas' },
    { code: 'IE', dialCode: '+353', name: 'Irlande' },
    // Amériques
    { code: 'US', dialCode: '+1', name: 'États-Unis' },
    { code: 'CA', dialCode: '+1', name: 'Canada' },
    { code: 'BR', dialCode: '+55', name: 'Brésil' },
    { code: 'MX', dialCode: '+52', name: 'Mexique' },
    // Moyen-Orient / Asie
    { code: 'SA', dialCode: '+966', name: 'Arabie Saoudite' },
    { code: 'AE', dialCode: '+971', name: 'Émirats arabes unis' },
    { code: 'QA', dialCode: '+974', name: 'Qatar' },
    { code: 'TR', dialCode: '+90', name: 'Turquie' },
    { code: 'LB', dialCode: '+961', name: 'Liban' },
    { code: 'CN', dialCode: '+86', name: 'Chine' },
    { code: 'IN', dialCode: '+91', name: 'Inde' },
    { code: 'JP', dialCode: '+81', name: 'Japon' },
];

function cca2ToFlagEmoji(cca2: string): string {
    if (!cca2 || cca2.length !== 2) return '🏳';
    const a = cca2.charCodeAt(0) - 65 + 0x1f1e6;
    const b = cca2.charCodeAt(1) - 65 + 0x1f1e6;
    return String.fromCodePoint(a, b);
}

const ALL_COUNTRIES: PhoneCountry[] = RAW_COUNTRIES.map((c) => ({
    code: c.code,
    dialCode: c.dialCode,
    flag: cca2ToFlagEmoji(c.code),
    flagUrl: `${FLAG_CDN}/${c.code.toLowerCase()}.png`,
    name: c.name,
}));

@Injectable({ providedIn: 'root' })
export class RestCountriesService {
    getPhoneCountries(defaultFirstCode: string = DEFAULT_COUNTRY_CODE): Observable<PhoneCountry[]> {
        const countries = [...ALL_COUNTRIES].sort((a, b) => {
            if (a.code === defaultFirstCode) return -1;
            if (b.code === defaultFirstCode) return 1;
            return a.name.localeCompare(b.name);
        });
        return of(countries);
    }
}
