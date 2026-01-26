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
