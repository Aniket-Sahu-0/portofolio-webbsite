console.log("Node.js is working!");
console.log("Current directory:", process.cwd());
console.log("Node version:", process.version);

// Try to require express
let express;
try {
  express = require('express');
  console.log("Express is installed correctly!");
} catch (err) {
  console.error("Error requiring express:", err);
}

process.exit(0);
