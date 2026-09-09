import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DateUtils,
  daysAgo,
  daysBetween,
  daysFromNow,
  formatDate,
  formatShort,
  isAfter,
  isBefore,
  isSameDay,
  isValidDate,
  parseDate,
  timestamp,
  toLocalDate,
  today,
  yesterday,
} from "./date";

describe("date utilities", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 15, 12, 0, 0));
  });

  it("formats local dates and preserves date-only strings", () => {
    expect(toLocalDate("2026-01-15")).toBe("2026-01-15");
    expect(toLocalDate(new Date(2026, 0, 15))).toBe("2026-01-15");
    expect(toLocalDate("2026-01-15T12:00:00")).toBe("2026-01-15");
  });

  it("calculates relative dates from today", () => {
    expect(today()).toBe("2026-01-15");
    expect(yesterday()).toBe("2026-01-14");
    expect(daysAgo(5)).toBe("2026-01-10");
    expect(daysFromNow(5)).toBe("2026-01-20");
  });

  it("compares dates and validates date input", () => {
    expect(daysBetween("2026-01-01", "2026-01-03")).toBe(2);
    expect(daysBetween("2026-01-03", "2026-01-01")).toBe(2);
    expect(isAfter("2026-01-03", "2026-01-01")).toBe(true);
    expect(isBefore("2026-01-01", "2026-01-03")).toBe(true);
    expect(isSameDay("2026-01-01", "2026-01-01")).toBe(true);
    expect(isValidDate("2026-01-01")).toBe(true);
    expect(isValidDate("not-a-date")).toBe(false);
  });

  it("formats and parses dates", () => {
    expect(formatDate("2026-01-15", "en-US")).toContain("January");
    expect(formatShort("2026-01-15", "en-US")).toContain("Jan");
    expect(parseDate("2026-01-15")).toBeInstanceOf(Date);
    expect(timestamp()).toBe(new Date(2026, 0, 15, 12, 0, 0).getTime());
  });

  it("exposes the same functions through DateUtils", () => {
    expect(DateUtils.toLocalDate("2026-01-15")).toBe("2026-01-15");
    expect(DateUtils.format("2026-01-15", "en-US")).toContain("January");
    expect(DateUtils.isValid("2026-01-15")).toBe(true);
  });
});
