#!/usr/bin/env node

// Development script that fetches data and starts dev server
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: true,
      ...options,
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
}

async function main() {
  try {
    console.log("🔄 Fetching latest data from Notion...");

    // Fetch data first
    await runCommand("node", [path.join(__dirname, "fetch-notion-data.js")]);

    console.log("🚀 Starting development server...");

    // Start dev server
    await runCommand("npm", ["run", "dev"]);
  } catch (error) {
    console.error("❌ Development setup failed:", error.message);
    process.exit(1);
  }
}

main();
