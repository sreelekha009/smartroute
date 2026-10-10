package com.smartroute.algorithm;

/**
 * Utility for computing great-circle distances on Earth's surface using the Haversine formula.
 *
 * Mathematical Admissibility:
 * In A* pathfinding, an admissible heuristic h(n) never overestimates the actual cost to reach the goal.
 * Because the Haversine distance represents the geodesic (great-circle) lower-bound distance between
 * two geographical coordinates, any physical road network distance d(u, v) satisfies:
 *   d(u, v) >= haversine(u, v)
 *
 * This ensures h(n) <= h*(n), guaranteeing that A* finds an optimal shortest path without overestimating.
 */
public final class HaversineDistanceCalculator {

    // Earth's volumetric mean radius in kilometers (IUGG recommendation)
    public static final double EARTH_RADIUS_KM = 6371.0088;

    private HaversineDistanceCalculator() {
        // Utility class
    }

    /**
     * Calculates the great-circle distance between two points in kilometers.
     *
     * @param lat1 Latitude of point 1 in decimal degrees
     * @param lon1 Longitude of point 1 in decimal degrees
     * @param lat2 Latitude of point 2 in decimal degrees
     * @param lon2 Longitude of point 2 in decimal degrees
     * @return Distance in kilometers
     */
    public static double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        if (Double.compare(lat1, lat2) == 0 && Double.compare(lon1, lon2) == 0) {
            return 0.0;
        }

        double phi1 = Math.toRadians(lat1);
        double phi2 = Math.toRadians(lat2);
        double deltaPhi = Math.toRadians(lat2 - lat1);
        double deltaLambda = Math.toRadians(lon2 - lon1);

        double sinHalfPhi = Math.sin(deltaPhi / 2.0);
        double sinHalfLambda = Math.sin(deltaLambda / 2.0);

        double a = sinHalfPhi * sinHalfPhi
                + Math.cos(phi1) * Math.cos(phi2) * sinHalfLambda * sinHalfLambda;

        // Numerical safety clamp against rounding errors slightly exceeding 1.0
        double clampedA = Math.max(0.0, Math.min(1.0, a));
        double c = 2.0 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1.0 - clampedA));

        return EARTH_RADIUS_KM * c;
    }
}
