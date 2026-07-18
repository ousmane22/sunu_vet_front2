import { Pipe, PipeTransform } from '@angular/core';
import { formatPrice as formatPriceUtil } from '../utils/format.util';

@Pipe({ name: 'formatPrice', standalone: true })
export class FormatPricePipe implements PipeTransform {
    transform(value: number | null | undefined): string {
        return formatPriceUtil(value);
    }
}


