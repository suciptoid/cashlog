const path = require("path");
const fs = require("fs");
const cwd = process.cwd();

function build() {
  const packageJsonPath = path.join(cwd, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  Object.keys(packageJson).forEach((key) => {
    if (!["dependencies", "name", "version", "main"].includes(key)) {
      delete packageJson[key];
    }
  });

  // Append dependencies firebase-functions if not exists
  if (!packageJson.dependencies["firebase-functions"]) {
    packageJson.dependencies["firebase-functions"] = "^4.0.1";
  }

  // temporary downgrade firebase-admin
  // packageJson.dependencies["firebase-admin"] = "^10.3.0";

  copy(path.join(cwd, "build"), path.join(cwd, "functions", "remix"));

  fs.writeFileSync(
    path.join("functions", "package.json"),
    JSON.stringify(packageJson, null, 2)
  );
}

function copy(src, dst) {
  const dstDir = path.dirname(dst);
  if (!fs.existsSync(dstDir)) {
    fs.mkdirSync(dstDir, { recursive: true });
  }

  const stat = fs.lstatSync(src);
  if (stat.isDirectory()) {
    // Copy directory
    const files = fs.readdirSync(src);
    files.forEach((file) => {
      const sourcePath = path.join(src, file);
      copy(sourcePath, path.join(dst, file));
    });
  } else {
    if (stat.isSymbolicLink()) {
      // console.log("symlink", symlink);
      fs.symlinkSync(fs.readlinkSync(src), dst);
    } else {
      // Copy File
      fs.copyFileSync(src, dst);
    }
  }
}

build();
