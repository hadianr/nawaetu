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
