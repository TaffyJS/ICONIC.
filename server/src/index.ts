import { createApp } from "./app.js";
import { getConfig } from "./config/env.js";
import { bootstrapDatabase } from "./db/bootstrap.js";
import { createDbClient } from "./db/connection.js";

const config = getConfig();
const db = createDbClient(config);
bootstrapDatabase(db);
const server = createApp(config, db);

server.listen(config.port, config.host, () => {
  console.log(`ICONIC API listening at http://${config.host}:${config.port}`);
});
