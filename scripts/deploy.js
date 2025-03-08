/**
 * Deployment helper script
 *
 * This script helps prepare the application for deployment to Vercel
 * It performs the following tasks:
 * 1. Builds the React frontend
 * 2. Ensures all necessary files are included
 * 3. Validates the Vercel configuration
 * 4. Checks for backend dependencies
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

console.log(`${colors.cyan}Starting deployment preparation...${colors.reset}`);

// Check if vercel.json exists
if (!fs.existsSync(path.join(__dirname, "..", "vercel.json"))) {
  console.error(`${colors.red}Error: vercel.json not found!${colors.reset}`);
  console.log(
    `${colors.yellow}Please create a vercel.json file in the root directory.${colors.reset}`
  );
  process.exit(1);
}

// Check if .env.production exists
if (!fs.existsSync(path.join(__dirname, "..", ".env.production"))) {
  console.warn(
    `${colors.yellow}Warning: .env.production not found!${colors.reset}`
  );
  console.log(
    `${colors.yellow}Make sure to set environment variables in Vercel dashboard.${colors.reset}`
  );
}

// Check for required backend dependencies
const requiredBackendDeps = [
  "express",
  "mongoose",
  "cors",
  "dotenv",
  "express-session",
  "bcryptjs",
  "jsonwebtoken",
];

try {
  console.log(`${colors.blue}Checking backend dependencies...${colors.reset}`);
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8")
  );
  const missingDeps = [];

  for (const dep of requiredBackendDeps) {
    if (!packageJson.dependencies[dep]) {
      missingDeps.push(dep);
    }
  }

  if (missingDeps.length > 0) {
    console.warn(
      `${
        colors.yellow
      }Warning: Missing backend dependencies: ${missingDeps.join(", ")}${
        colors.reset
      }`
    );
    console.log(
      `${colors.yellow}Installing missing dependencies...${colors.reset}`
    );
    execSync(`npm install --save ${missingDeps.join(" ")}`, {
      stdio: "inherit",
    });
    console.log(
      `${colors.green}Dependencies installed successfully!${colors.reset}`
    );
  } else {
    console.log(
      `${colors.green}All backend dependencies are installed.${colors.reset}`
    );
  }
} catch (error) {
  console.error(
    `${colors.red}Error checking dependencies:${colors.reset}`,
    error
  );
}

// Build the React frontend
try {
  console.log(`${colors.blue}Building React frontend...${colors.reset}`);
  execSync("npm run build", { stdio: "inherit" });
  console.log(`${colors.green}Frontend build successful!${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Error building frontend:${colors.reset}`, error);
  process.exit(1);
}

console.log(`${colors.green}Deployment preparation complete!${colors.reset}`);
console.log(`${colors.cyan}You can now deploy to Vercel with:${colors.reset}`);
console.log(
  `${colors.yellow}vercel${colors.reset} or ${colors.yellow}vercel --prod${colors.reset}`
);
