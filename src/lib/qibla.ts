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

export function calculateQiblaDirection(latitude: number, longitude: number): number {
    const PI = Math.PI;
    const kaabaLat = 21.422487 * (PI / 180);
    const kaabaLng = 39.826206 * (PI / 180);

    const phi = latitude * (PI / 180);
    const lambda = longitude * (PI / 180);

    const y = Math.sin(kaabaLng - lambda);
    const x = Math.cos(phi) * Math.tan(kaabaLat) - Math.sin(phi) * Math.cos(kaabaLng - lambda);

    let qibla = Math.atan2(y, x) * (180 / PI);

    // Normalize to 0-360
    qibla = (qibla + 360) % 360;

    return qibla;
}

export function calculateDistanceToKaaba(latitude: number, longitude: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (21.422487 - latitude) * (Math.PI / 180);
    const dLon = (39.826206 - longitude) * (Math.PI / 180);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(latitude * (Math.PI / 180)) * Math.cos(21.422487 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km

    return Math.round(distance);
}
