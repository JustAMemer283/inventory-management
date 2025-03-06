const chokidar = require("chokidar");
const { exec } = require("child_process");
const path = require("path");

// ignore patterns for git
const ignorePatterns = [
  "node_modules/**",
  ".git/**",
  "build/**",
  "dist/**",
  "*.log",
];

// initialize watcher
const watcher = chokidar.watch(".", {
  ignored: ignorePatterns,
  persistent: true,
});

// debounce function to prevent multiple commits
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// commit changes
const commitChanges = (filePath) => {
  const relativePath = path.relative(process.cwd(), filePath);
  const commitMessage = `update: ${relativePath}`;

  exec(
    `git add . && git commit -m "${commitMessage}"`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`error: ${error}`);
        return;
      }
      console.log(`committed: ${relativePath}`);
    }
  );
};

// debounced commit function
const debouncedCommit = debounce(commitChanges, 1000);

// watch for changes
watcher
  .on("add", (path) => debouncedCommit(path))
  .on("change", (path) => debouncedCommit(path))
  .on("unlink", (path) => debouncedCommit(path));

console.log("watching for changes...");
