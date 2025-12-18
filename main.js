const { execSync } = require("child_process");

function nextSection() {
  const output = execSync("python main.py nextSection", { encoding: "utf-8" });
  return output.trim();
}

module.exports = { nextSection };
