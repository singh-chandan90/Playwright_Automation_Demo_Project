import { config } from "./config";
import mysql from "mysql2/promise";

export async function getUserTestDataFromMySQL(
  query: string
): Promise<Record<string, unknown>[]> {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: config.sqlDbUser, // fetch user from config
    password: config.sqlDbPwd || "", // fetch password from config
    database: "testdb",
  });
  const [rows] = await connection.execute(query);
  await connection.end();
  return rows as Record<string, unknown>[];
}
