/**
 * Centralized Date Utilities
 * Eliminates 15+ duplicate date formatting implementations
 */
export class DateUtils {
  /**
   * Get today's date in YYYY-MM-DD format
   */
  static today(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Get yesterday's date in YYYY-MM-DD format
   */
  static yesterday(): string {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  }

  /**
   * Get date N days ago
   */
  static daysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  /**
   * Get date N days from now
   */
  static daysFromNow(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  /**
   * Calculate days between two dates
   */
  static daysBetween(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if date1 is after date2
   */
  static isAfter(date1: string, date2: string): boolean {
    return new Date(date1) > new Date(date2);
  }

  /**
   * Check if date1 is before date2
   */
  static isBefore(date1: string, date2: string): boolean {
    return new Date(date1) < new Date(date2);
  }

  /**
   * Check if two dates are the same day
   */
  static isSameDay(date1: string, date2: string): boolean {
    return date1 === date2;
  }

  /**
   * Format date for display
   */
  static format(date: string, locale: string = 'id-ID'): string {
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Format date for short display
   */
  static formatShort(date: string, locale: string = 'id-ID'): string {
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Get current timestamp
   */
  static timestamp(): number {
    return Date.now();
  }

  /**
   * Parse date string to Date object
   */
  static parse(dateString: string): Date {
    return new Date(dateString);
  }

  /**
   * Check if date string is valid
   */
  static isValid(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }
}
