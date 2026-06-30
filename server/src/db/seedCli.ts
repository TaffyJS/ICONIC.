import { getConfig } from "../config/env.js";
import { createDbClient } from "./connection.js";
import { runMigrations } from "./migrations.js";
import { seedDatabase } from "./seed.js";

const config = getConfig();
const db = createDbClient(config);

runMigrations(db);
seedDatabase(db);
console.log("Database seed complete");
