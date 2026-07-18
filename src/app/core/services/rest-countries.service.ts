import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, shareReplay } from 'rxjs';

export interface PhoneCountry {
    code: string;
    dialCode: string;
    flag: string;
    flagUrl: string;
    name: string;
}

const API_URL = 'https://restcountries.com/v3.1';
const DEFAULT_COUNTRY_CODE = 'SN';

function cca2ToFlagEmoji(cca2: string): string {
    if (!cca2 || cca2.length !== 2) return '🏳';
    const a = cca2.charCodeAt(0) - 65 + 0x1f1e6;
    const b = cca2.charCodeAt(1) - 65 + 0x1f1e6;
    return String.fromCodePoint(a, b);
}

interface RestCountry {
    name: { common: string };
    cca2: string;
    idd?: { root: string; suffixes: string[] };
}

@Injectable({ providedIn: 'root' })
export class RestCountriesService {
    private http = inject(HttpClient);

    getPhoneCountries(defaultFirstCode: string = DEFAULT_COUNTRY_CODE): Observable<PhoneCountry[]> {
        return this.http
            .get<RestCountry[]>(`${API_URL}/all?fields=name,cca2,idd`)
            .pipe(
                map((list) => {
                    const countries: PhoneCountry[] = [];
                    for (const c of list) {
                        const root = c.idd?.root?.trim() ?? '';
                        const suffix = c.idd?.suffixes?.length ? c.idd.suffixes[0] : '';
                        const dialCode = (root + (suffix || '')).trim();
                        if (!dialCode || dialCode.length < 2) continue;
                        const code = c.cca2.toLowerCase();
                        countries.push({
                            code: c.cca2,
                            dialCode,
                            flag: cca2ToFlagEmoji(c.cca2),
                            flagUrl: `https://flagcdn.com/w40/${code}.png`,
                            name: c.name?.common ?? c.cca2,
                        });
                    }
                    countries.sort((a, b) => {
                        if (a.code === defaultFirstCode) return -1;
                        if (b.code === defaultFirstCode) return 1;
                        return a.name.localeCompare(b.name);
                    });
                    return countries;
                }),
                catchError(() => of([])),
                shareReplay(1)
            );
    }
}
