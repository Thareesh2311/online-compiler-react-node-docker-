const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const util = require('util');
const execp = util.promisify(require('child_process').exec);
const { makeTempDir } = require('./utils');

const app = express();

const cors = require("cors");
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

// Language configurations
const LANGUAGE_CONFIG = {
  c: {
    filename: 'main.c',
    image: 'gcc:latest',
    compileCmd: 'gcc main.c -o main',
    runCmd: './main'
  },
  cpp: {
    filename: 'main.cpp',
    image: 'gcc:latest',
    compileCmd: 'g++ main.cpp -o main',
    runCmd: './main'
  },
  python: {
    filename: 'main.py',
    image: 'python:3.11-slim',
    compileCmd: null,
    runCmd: 'python3 main.py'
  },
  java: {
    filename: 'Main.java',
    image: 'eclipse-temurin:17-jdk',
    compileCmd: 'javac Main.java',
    runCmd: 'java Main'
  },
  node: {
    filename: 'main.js',
    image: 'node:18-slim',
    compileCmd: null,
    runCmd: 'node main.js'
  }
};


// Compile API
app.post('/api/compile', async (req, res) => {
  try {
    const { language, code, stdin } = req.body;

    if (!language || !code) {
      return res.status(400).json({ error: "Language and code required" });
    }

    const config = LANGUAGE_CONFIG[language];
    if (!config) {
      return res.status(400).json({ error: "Unsupported language" });
    }

    // Create temp directory
    const { dir } = await makeTempDir();
    const filePath = path.join(dir, config.filename);

    // Write user code to temp file
    await fs.writeFile(filePath, code);

    // Base Docker command
    const containerPath = "/work";
    const baseDocker = `docker run --rm -v "${dir}:${containerPath}" -w ${containerPath} ${config.image}`;

    let compileOutput = "";

    // Compilation (if needed)
    if (config.compileCmd) {
      try {
        const { stdout, stderr } = await execp(`${baseDocker} /bin/sh -c "${config.compileCmd}"`);
        compileOutput = stdout + stderr;
      } catch (err) {
        return res.json({
          success: false,
          compileError: (err.stdout || "") + (err.stderr || "") + err.message
        });
      }
    }

    // Runtime execution
    let runCommand = `${baseDocker} /bin/sh -c "timeout 5s ${config.runCmd}"`;

    // Add stdin if provided
    if (stdin && stdin.trim() !== "") {
      const safeStdin = stdin.replace(/"/g, '\\"');
      runCommand = `${baseDocker} /bin/sh -c "printf \\"${safeStdin}\\" | timeout 5s ${config.runCmd}"`;
    }

    // Runtime execution using Node.js timeout instead of Linux timeout
try {
  let runCmd = `${baseDocker} /bin/sh -c "${config.runCmd}"`;

  // Add stdin if provided
  if (stdin && stdin.trim() !== "") {
    const safeStdin = stdin.replace(/"/g, '\\"');
    runCmd = `${baseDocker} /bin/sh -c "printf \\"${safeStdin}\\" | ${config.runCmd}"`;
  }

  // Execute with Node.js timeout (5 seconds)
  const { stdout, stderr } = await execp(runCmd, {
    timeout: 5000,          // Node kills the process after 5 seconds
    maxBuffer: 1024 * 1024
  });

  res.json({
    success: true,
    compileOutput,
    stdout,
    stderr
  });

} catch (err) {
  res.json({
    success: false,
    runError: (err.stdout || "") + (err.stderr || "") + err.message
  });
}

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "internal server error" });
  }
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Compiler backend running on port ${PORT}`));
