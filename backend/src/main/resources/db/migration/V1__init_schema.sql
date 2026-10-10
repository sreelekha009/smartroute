-- V1__init_schema.sql
-- Schema creation for SmartRoute Locations, Roads, and Route History

CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS roads (
    id UUID PRIMARY KEY,
    source_location_id UUID NOT NULL,
    destination_location_id UUID NOT NULL,
    distance_km DOUBLE PRECISION NOT NULL,
    duration_minutes DOUBLE PRECISION,
    bidirectional BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_roads_source FOREIGN KEY (source_location_id) REFERENCES locations(id) ON DELETE CASCADE,
    CONSTRAINT fk_roads_destination FOREIGN KEY (destination_location_id) REFERENCES locations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS route_history (
    id UUID PRIMARY KEY,
    algorithm VARCHAR(64) NOT NULL,
    source_name VARCHAR(120) NOT NULL,
    destination_name VARCHAR(120) NOT NULL,
    total_distance_km DOUBLE PRECISION NOT NULL,
    node_count INTEGER NOT NULL,
    path_json TEXT NOT NULL,
    execution_time_ms DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_roads_source ON roads(source_location_id);
CREATE INDEX IF NOT EXISTS idx_roads_dest ON roads(destination_location_id);
CREATE INDEX IF NOT EXISTS idx_route_history_created_at ON route_history(created_at DESC);
