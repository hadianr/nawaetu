/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Centralized Date Utilities
 * Eliminates 15+ duplicate date formatting implementations
 */
export class DateUtils {
  /**
   * Helper to format date as YYYY-MM-DD in local time
   */
  static toLocalDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /**
   * Get today's date in YYYY-MM-DD format (local time)
   */
  static today(): string {
    return this.toLocalDate(new Date());
  }

  /**
   * Get yesterday's date in YYYY-MM-DD format (local time)
   */
  static yesterday(): string {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return this.toLocalDate(date);
  }

  /**
   * Get date N days ago (local time)
   */
  static daysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return this.toLocalDate(date);
  }

  /**
   * Get date N days from now (local time)
   */
  static daysFromNow(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return this.toLocalDate(date);
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
