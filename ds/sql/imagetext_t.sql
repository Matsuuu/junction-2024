DROP TABLE IF EXISTS imagetext;

CREATE TABLE imagetext (
    name VARCHAR,
    text JSONB,
    path VARCHAR,
    updated_at TIMESTAMP DEFAULT CURRENT_TIME,
    PRIMARY KEY (name)
)
