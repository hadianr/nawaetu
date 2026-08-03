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

import * as Sentry from "@sentry/nextjs";

export type LogLevel = "info" | "warn" | "error" | "fatal";

export interface LogContext {
  userId?: string;
  route?: string;
  action?: string;
  durationMs?: number;
  [key: string]: unknown;
}

export interface StandardLogPayload {
  timestamp: string;
  level: LogLevel;
  service: string;
  environment: string;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private serviceName = "nawaetu";

  private buildPayload(
    level: LogLevel,
    message: string,
    error?: unknown,
    context?: LogContext
  ): StandardLogPayload {
    const payload: StandardLogPayload = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      environment: process.env.NODE_ENV || "development",
      message,
    };

    if (context && Object.keys(context).length > 0) {
      payload.context = context;
    }

    if (error instanceof Error) {
      payload.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (error) {
      payload.error = {
        name: "UnknownError",
        message: String(error),
      };
    }

    return payload;
  }

  private serialize(payload: StandardLogPayload): string {
    return JSON.stringify(payload);
  }

  /**
   * Log essential business events (e.g. payment creation, webhook received).
   * In Production (server-side): Uses console.warn to bypass SWC removeConsole
   * and emit structured JSON to Vercel Runtime Logs for free.
   * In Development: Outputs clean formatted text.
   */
  info(message: string, context?: LogContext): void {
    try {
      const payload = this.buildPayload("info", message, undefined, context);
      if (process.env.NODE_ENV !== "production") {
        console.log(`[INFO] ${message}`, context ?? "");
      } else if (typeof window === "undefined") {
        // server-side production: console.warn passes SWC removeConsole filter
        console.warn(this.serialize(payload));
      }
    } catch {
      // Fail-safe: logging failure will never break main application execution
    }
  }

  /**
   * Log expected anomalies or fallback activations (e.g. Gemini → Groq failover).
   */
  warn(message: string, context?: LogContext): void {
    try {
      const payload = this.buildPayload("warn", message, undefined, context);
      console.warn(this.serialize(payload));
    } catch {
      // Fail-safe
    }
  }

  /**
   * Log operational errors requiring investigation.
   * Emits JSON to Vercel logs and reports to Sentry automatically.
   */
  error(message: string, error?: unknown, context?: LogContext): void {
    try {
      const payload = this.buildPayload("error", message, error, context);
      console.error(this.serialize(payload));

      if (process.env.NODE_ENV === "production") {
        Sentry.captureException(error || new Error(message), {
          level: "error",
          extra: { message, ...context },
        });
      }
    } catch {
      // Fail-safe
    }
  }

  /**
   * Log critical crashes causing service downtime.
   * Emits JSON to Vercel logs and triggers Sentry fatal alert (webhook / email).
   */
  fatal(message: string, error?: unknown, context?: LogContext): void {
    try {
      const payload = this.buildPayload("fatal", message, error, context);
      console.error(this.serialize(payload));

      if (process.env.NODE_ENV === "production") {
        Sentry.withScope((scope) => {
          scope.setLevel("fatal");
          scope.setTag("critical_crash", "true");
          Sentry.captureException(error || new Error(message), {
            extra: { message, ...context },
          });
        });
      }
    } catch {
      // Fail-safe
    }
  }
}

export const logger = new Logger();
