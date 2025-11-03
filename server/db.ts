import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@shared/schema";

const connection = mysql.createPool({
  host: process.env.DB_HOST_REMOTE || "138.199.140.167",
  port: parseInt(process.env.DB_PORT_REMOTE || "10003"),
  user: process.env.DB_USERNAME || "mariadb",
  password: process.env.DB_PASSWORD || "d08807f7ff3394a00433",
  database: process.env.DB_DATABASE || "beartshare",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = drizzle(connection, { schema, mode: "default" });
