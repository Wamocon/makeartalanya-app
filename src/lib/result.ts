// Type-safe Result pattern for Server Actions
// Never throw from actions — return structured results

export type Result<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

export function ok<T>(data: T): Result<T> {
  return { success: true, data }
}

export function err(error: string, code?: string): Result<never> {
  return { success: false, error, code }
}
