import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";

export const PG_OPTIONS = {
    host: "datanautti",
    database: "postgres",
    user: "postgres",
    password: "hughmungus",
    port: 5432,
    max: 10,
    ssl: process.env.NODE_ENV === "production",
};

const int8TypeId = 20;

pg.types.setTypeParser(int8TypeId, val => {
    return parseInt(val, 10);
});

const dialect = new PostgresDialect({
    pool: new pg.Pool(PG_OPTIONS),
});

export const db = new Kysely<any>({
    dialect,
});
