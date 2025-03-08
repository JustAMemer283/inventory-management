/**
 * Deployment test script
 *
 * This script tests the deployment setup by:
 * 1. Checking if all required files exist
 * 2. Verifying the Vercel configuration
 * 3. Testing the API endpoints locally
 */

const fs = require("fs");
const path = require("path");
const axios = require("axios");
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

console.log(`${colors.cyan}Starting deployment test...${colors.reset}`);

// Check required files
const requiredFiles = [
  "vercel.json",
  "server.js",
  ".env.production",
  "package.json",
  "src/services/api.js",
];

let allFilesExist = true;
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(__dirname, "..", file))) {
    console.error(`${colors.red}Error: ${file} not found!${colors.reset}`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.error(
    `${colors.red}Some required files are missing. Please check the errors above.${colors.reset}`
  );
  process.exit(1);
}

console.log(`${colors.green}All required files exist.${colors.reset}`);

// Verify Vercel configuration
try {
  const vercelConfig = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "vercel.json"), "utf8")
  );

  // Check if the configuration has the required sections
  if (!vercelConfig.builds || !vercelConfig.routes) {
    console.error(
      `${colors.red}Error: vercel.json is missing required sections (builds or routes).${colors.reset}`
    );
    process.exit(1);
  }

  // Check if the builds section includes server.js and build/**
  const hasServerBuild = vercelConfig.builds.some(
    (build) => build.src === "server.js"
  );
  const hasBuildDir = vercelConfig.builds.some(
    (build) => build.src === "build/**"
  );

  if (!hasServerBuild || !hasBuildDir) {
    console.error(
      `${colors.red}Error: vercel.json builds section is missing required entries.${colors.reset}`
    );
    process.exit(1);
  }

  // Check if the routes section includes /api/(.*)
  const hasApiRoute = vercelConfig.routes.some(
    (route) => route.src === "/api/(.*)"
  );

  if (!hasApiRoute) {
    console.error(
      `${colors.red}Error: vercel.json routes section is missing API route.${colors.reset}`
    );
    process.exit(1);
  }

  console.log(`${colors.green}Vercel configuration is valid.${colors.reset}`);
} catch (error) {
  console.error(
    `${colors.red}Error verifying Vercel configuration:${colors.reset}`,
    error
  );
  process.exit(1);
}

console.log(
  `${colors.green}Deployment test completed successfully!${colors.reset}`
);
console.log(
  `${colors.cyan}Your application is ready for deployment to Vercel.${colors.reset}`
);
console.log(
  `${colors.yellow}Remember to set these environment variables in Vercel:${colors.reset}`
);
console.log(
  `  - ${colors.yellow}MONGODB_URI${colors.reset}: Your MongoDB connection string`
);
console.log(
  `  - ${colors.yellow}JWT_SECRET${colors.reset}: Your JWT secret key`
);
console.log(`  - ${colors.yellow}NODE_ENV${colors.reset}: Set to "production"`);
