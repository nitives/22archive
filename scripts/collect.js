/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "../src");
// Output file will be named with the collection time
const now = new Date();
const pad = (n) => n.toString().padStart(2, "0");
const timeString = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
const outputFile = path.join(__dirname, `./output/collected-${timeString}.txt`);

// Extensions to include
const extensions = [".ts", ".tsx", ".css"];

// Directories to ignore
const ignoredDirs = ["node_modules", ".next", ".git"];

function getAllFiles(dirPath, arrayOfFiles) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Directory not found: ${dirPath}`);
    return [];
  }

  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    const fullPath = path.join(dirPath, file);

    // Skip ignored directories
    if (ignoredDirs.includes(file)) return;

    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      if (extensions.some((ext) => file.endsWith(ext))) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

try {
  console.log("Scanning src directory...");
  const files = getAllFiles(srcDir);

  console.log(`Found ${files.length} files.`);

  const dateString = now.toLocaleString();
  let content = `<!-- Collection Date: ${dateString} -->\n`;
  content += `<!-- Output file is named with the collection time (hour-minute-second) -->\n`;
  content += `<!-- Example: collected-${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}.txt -->\n\n`;

  files.forEach((file) => {
    const relativePath = path.relative(__dirname, file);
    const fileContent = fs.readFileSync(file, "utf8");

    content += `\n<!-- ======================================================================= -->\n`;
    content += `<!-- File: ${relativePath} -->\n`;
    content += `<!-- ======================================================================= -->\n\n`;
    content += fileContent + "\n\n";
  });

  fs.writeFileSync(outputFile, content);
  console.log(`Successfully combined ${files.length} files into ${outputFile}`);
} catch (error) {
  console.error("An error occurred:", error);
}
