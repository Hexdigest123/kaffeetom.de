import { browser } from '$app/environment';

export interface CartItem {
	productId: number;
	name: string;
	nameEn?: string;
	price: number;
	quantity: number;
	image: string;
}

const STORAGE_KEY = 'kaffeetom_cart';

function loadCart(): CartItem[] {
	if (!browser) return [];
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		return saved ? (JSON.parse(saved) as CartItem[]) : [];
	} catch {
		return [];
	}
}

function saveCart(items: CartItem[]): void {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

let items = $state<CartItem[]>(loadCart());

export const cart = {
	get items() {
		return items;
	},
	get totalItems() {
		return items.reduce((sum, item) => sum + item.quantity, 0);
	},
	get totalPrice() {
		return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
	},
	get isEmpty() {
		return items.length === 0;
	},

	addItem(item: Omit<CartItem, 'quantity'>) {
		const existingIndex = items.findIndex((current) => current.productId === item.productId);

		if (existingIndex >= 0) {
			items = items.map((current, i) =>
				i === existingIndex ? { ...current, quantity: current.quantity + 1 } : current
			);
		} else {
			items = [...items, { ...item, quantity: 1 }];
		}

		saveCart(items);
	},

	removeItem(index: number) {
		items = items.filter((_, i) => i !== index);
		saveCart(items);
	},

	updateQuantity(index: number, quantity: number) {
		if (quantity <= 0) {
			items = items.filter((_, i) => i !== index);
		} else {
			items = items.map((item, i) => (i === index ? { ...item, quantity } : item));
		}
		saveCart(items);
	},

	clear() {
		items = [];
		saveCart(items);
	}
};
