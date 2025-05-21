import { Client } from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  ssl: {
    ca: fs.readFileSync(path.resolve(__dirname, "../../certs/digitalOcean-ca-certificate.crt")).toString(),
  },
});

client.connect()
  .then(() => console.log("Conexión exitosa a PostgreSQL"))
  .catch((err) => console.error("Error de conexión:", err));

console.log('DB envs:', {
  user: process.env.DB_USER,
  pass: process.env.DB_PASSWORD,
});

export default client;
