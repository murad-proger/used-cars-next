import { Pool } from "pg";

export const pg = new Pool({
  host: "127.0.0.1",
  port: 5432,
  user: "user",
  password: "123",
  database: "cars_postgres",
});