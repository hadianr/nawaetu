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
// ponytail: standalone functions eliminate class wrapper boilerplate
export function toLocalDate(date: Date | string): string {
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function today(): string {
  return toLocalDate(new Date());
}

export function yesterday(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return toLocalDate(date);
}

export function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toLocalDate(date);
}

export function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toLocalDate(date);
}

export function daysBetween(date1: string, date2: string): number {
  return Math.ceil(Math.abs(new Date(date2).getTime() - new Date(date1).getTime()) / (1000 * 60 * 60 * 24));
}

export function isAfter(date1: string, date2: string): boolean {
  return new Date(date1) > new Date(date2);
}

export function isBefore(date1: string, date2: string): boolean {
  return new Date(date1) < new Date(date2);
}

export function isSameDay(date1: string, date2: string): boolean {
  return date1 === date2;
}

export function formatDate(date: string, locale: string = 'id-ID'): string {
  return new Date(date).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatShort(date: string, locale: string = 'id-ID'): string {
  return new Date(date).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function timestamp(): number {
  return Date.now();
}

export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

export function isValidDate(dateString: string): boolean {
  return !isNaN(new Date(dateString).getTime());
}

export const DateUtils = {
  toLocalDate,
  today,
  yesterday,
  daysAgo,
  daysFromNow,
  daysBetween,
  isAfter,
  isBefore,
  isSameDay,
  format: formatDate,
  formatShort,
  timestamp,
  parse: parseDate,
  isValid: isValidDate,
};
