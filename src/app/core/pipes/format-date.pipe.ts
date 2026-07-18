import { Pipe, PipeTransform } from '@angular/core';
import { formatDate as formatDateUtil } from '../utils/format.util';

@Pipe({ name: 'formatDate', standalone: true })
export class FormatDatePipe implements PipeTransform {
    transform(value: string | null | undefined, includeTime: boolean = true): string {
        return formatDateUtil(value, includeTime);
    }
}


