// modules imports
import express from "express";
import { config } from 'dotenv';
// files imports
import { intiateApp } from "./src/initiate-app.js";

config({ path: 'config/dev.config.env' });

const app = express();

intiateApp(app, express);


