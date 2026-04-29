#!/usr/bin/env bash
set -u

/usr/local/bin/node -e '
const ALLOW = { permission: "allow" };
let payload = {};
try {
  const raw = require("fs").readFileSync(0, "utf8");
  payload = raw ? JSON.parse(raw) : {};
} catch {
  console.log(JSON.stringify(ALLOW));
  process.exit(0);
}

const commandText = typeof payload.command === "string" ? payload.command.trim() : "";
if (!commandText) {
  console.log(JSON.stringify(ALLOW));
  process.exit(0);
}

// Reference: https://conventional-branch.github.io/#specification
const pattern = /^(main|develop|staging|((feature|feat|bugfix|fix|hotfix|release|chore)\/[a-z0-9]+(\.[a-z0-9]+)*(-[a-z0-9]+(\.[a-z0-9]+)*)*))$/;

let branchName = "";

const checkout = commandText.match(/\bgit checkout -b\s+(\S+)/);
const sw = commandText.match(/\bgit switch -c\s+(\S+)/);
const branch = commandText.match(/\bgit branch\s+(?:-f\s+|--force\s+)?((?!-)\S+)/);
const gh = commandText.match(/\bgh issue develop\b.*\s--name\s+(\S+)/);

if (checkout) branchName = checkout[1];
else if (sw) branchName = sw[1];
else if (branch) branchName = branch[1];
else if (gh) branchName = gh[1];

branchName = branchName.replace(/^["'\''`]+|["'\''`]+$/g, "");

if (!branchName) {
  console.log(JSON.stringify(ALLOW));
  process.exit(0);
}

if (pattern.test(branchName)) {
  console.log(JSON.stringify(ALLOW));
  process.exit(0);
}

console.log(
  JSON.stringify({
    permission: "deny",
    user_message: `ブランチ名が規約外です: ${branchName}`,
    agent_message:
      "Conventional Branch ルール違反。許可: main|develop|staging または <type>/<description>。type は feature|feat|bugfix|fix|hotfix|release|chore。",
  })
);
'
