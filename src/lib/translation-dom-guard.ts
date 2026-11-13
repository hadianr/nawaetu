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
 * Browser translators (Chrome Translate and similar) replace text nodes with their own
 * <font> elements. When React later removes or inserts next to a node it created, that
 * node is no longer where React left it and the DOM call throws, crashing the page
 * (Sentry JAVASCRIPT-NEXTJS-2Q, -2H). These guards skip only those impossible calls,
 * so translation keeps working instead of the app showing its error screen.
 * Workaround from https://github.com/facebook/react/issues/11538.
 */
export function installTranslationDomGuard(): void {
    if (typeof Node === "undefined") return;
    const proto = Node.prototype as Node & { __nawaetuTranslationGuard?: boolean };
    if (proto.__nawaetuTranslationGuard) return;
    proto.__nawaetuTranslationGuard = true;

    const removeChild = proto.removeChild;
    proto.removeChild = function <T extends Node>(this: Node, child: T): T {
        if (child.parentNode !== this) return child;
        return removeChild.call(this, child) as T;
    };

    const insertBefore = proto.insertBefore;
    proto.insertBefore = function <T extends Node>(this: Node, node: T, reference: Node | null): T {
        if (reference && reference.parentNode !== this) return node;
        return insertBefore.call(this, node, reference) as T;
    };
}
