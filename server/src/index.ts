import dotenv from "dotenv";

dotenv.config();

import { HTTPServer } from "./HTTPServer";

const server = new HTTPServer(+process.env.SERVER_PORT);