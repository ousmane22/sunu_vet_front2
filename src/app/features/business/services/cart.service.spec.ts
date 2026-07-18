import { CartService, type CartItem } from './cart.service';
import type { PosProduct } from '../models';

function makeProduct(overrides: Partial<PosProduct> = {}): PosProduct {
  return {
    id: 1,
    name: 'Produit test',
    type: 'comprime',
    category: null,
    selling_price: 1000,
    stock_quantity: 10,
    unit: 'unité',
    allow_fractional_quantity: false,
    ...overrides,
  };
}

describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    service = new CartService();
  });

  it('should start empty', () => {
    expect(service.cart()).toEqual([]);
    expect(service.totalItems()).toBe(0);
    expect(service.totalAmount()).toBe(0);
  });

  it('should add a product to the cart', () => {
    const product = makeProduct({ id: 1, selling_price: 2000, stock_quantity: 5 });
    service.add(product, 2);

    expect(service.cart().length).toBe(1);
    expect(service.cart()[0].quantity).toBe(2);
    expect(service.cart()[0].lineTotal).toBe(4000);
    expect(service.totalAmount()).toBe(4000);
  });

  it('should not exceed available stock when adding', () => {
    const product = makeProduct({ id: 1, stock_quantity: 3, selling_price: 1000 });
    service.add(product, 10);

    expect(service.cart()[0].quantity).toBe(3);
  });

  it('should replaceAll for sale edit reload', () => {
    const items: CartItem[] = [
      {
        product: makeProduct({ id: 10, selling_price: 2500, stock_quantity: 8 }),
        quantity: 2,
        lineTotal: 5000,
      },
      {
        product: makeProduct({ id: 11, selling_price: 1000, stock_quantity: 5 }),
        quantity: 1,
        lineTotal: 1000,
      },
    ];

    service.replaceAll(items);

    expect(service.cart().length).toBe(2);
    expect(service.totalItems()).toBe(3);
    expect(service.totalAmount()).toBe(6000);
  });

  it('should clear the cart', () => {
    service.add(makeProduct({ id: 1 }), 1);
    service.clear();
    expect(service.cart()).toEqual([]);
  });
});
