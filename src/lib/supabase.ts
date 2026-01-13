// Cliente Supabase com conversão automática snake_case ↔ camelCase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==================== HELPER FUNCTIONS ====================

/**
 * Converte objeto de camelCase para snake_case (para enviar ao Supabase)
 */
export function toSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (typeof obj !== 'object') return obj;

  const result: any = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = toSnakeCase(obj[key]);
  }
  return result;
}

/**
 * Converte objeto de snake_case para camelCase (ao receber do Supabase)
 */
export function toCamelCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (typeof obj !== 'object') return obj;

  const result: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = toCamelCase(obj[key]);
  }
  return result;
}

/**
 * Verifica se Supabase está disponível
 */
export async function isSupabaseAvailable(): Promise<boolean> {
  try {
    const { error } = await supabase.from('usuarios').select('cpf').limit(1);
    return !error;
  } catch {
    return false;
  }
}
