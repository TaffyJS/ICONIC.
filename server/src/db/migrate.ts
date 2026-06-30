import { getConfig } from "../config/env.js";
import { createDbClient } from "./connection.js";
import { runMigrations } from "./migrations.js";

const config = getConfig();
const db = createDbClient(config);

runMigrations(db);
console.log(`Database migrations applied for ${config.database.provider}`);
