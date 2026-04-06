export type OrderStatus = 'Processing' | 'In Transit' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export const NIGERIA_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", 
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", 
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateat", "Rivers", "Sokoto", 
  "Taraba", "Yobe", "Zamfara"
];

export const SPECIAL_MOQ_CITIES = ["Abuja", "Owerri"];

export const PRICING_LOGIC = {
  basePrice: 1250, // NGN per Liter
  stateMultipliers: {
    "Lagos": 1.0,
    "FCT - Abuja": 1.05,
    "Rivers": 1.02,
    "Kano": 1.1,
    // Default multiplier will be 1.08 for others
  }
};
