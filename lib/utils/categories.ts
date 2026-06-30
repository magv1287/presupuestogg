import { CategoryConfig } from '@/types';

export const CATEGORIES: Record<string, CategoryConfig> = {
  'Vivienda': { color: '#3B82F6', bg: '#3B82F620', icon: 'Home' },
  'Supermercado': { color: '#10B981', bg: '#10B98120', icon: 'ShoppingCart' },
  'Restaurantes': { color: '#F59E0B', bg: '#F59E0B20', icon: 'Utensils' },
  'Transporte': { color: '#8B5CF6', bg: '#8B5CF620', icon: 'Car' },
  'Salud': { color: '#EC4899', bg: '#EC489920', icon: 'Heart' },
  'Entretenimiento': { color: '#06B6D4', bg: '#06B6D420', icon: 'Gamepad2' },
  'Compras': { color: '#F97316', bg: '#F9731620', icon: 'Package' },
  'Viajes': { color: '#14B8A6', bg: '#14B8A620', icon: 'Plane' },
  'Ahorro/Inversión': { color: '#10B981', bg: '#10B98120', icon: 'TrendingUp' },
  'Servicios': { color: '#6366F1', bg: '#6366F120', icon: 'Wifi' },
  'Familia': { color: '#F43F5E', bg: '#F43F5E20', icon: 'Users' },
  'Ingreso': { color: '#10B981', bg: '#10B98120', icon: 'DollarSign' },
  'Otro': { color: '#6B7280', bg: '#6B728020', icon: 'MoreHorizontal' },
} as const;

export const CATEGORY_LIST = Object.keys(CATEGORIES);

export function getCategoryConfig(category: string): CategoryConfig {
  return CATEGORIES[category] || CATEGORIES['Otro'];
}
