DROP TABLE IF EXISTS inventory;

CREATE TABLE inventory (
    sku VARCHAR,
    name VARCHAR,
    lat FLOAT,
    lon FLOAT,
    status VARCHAR,
    last_maintained TIMESTAMP,
    next_scheduled_maintenance TIMESTAMP,
    metadata JSONB,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (sku, updated_at)
)
