#!/usr/bin/env node

const path = require("node:path");

const cliPath = path.join(__dirname, "..", "dist", "cli.js");

require(cliPath);
