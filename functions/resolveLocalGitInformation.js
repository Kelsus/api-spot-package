const resolveLocalGitInformation = () => {
  console.log("--Getting git repo info");

  let commitId, commitBranch;

  try {
    commitId = require("child_process")
      .execSync("git rev-parse HEAD")
      .toString()
      .trim();
    commitBranch = require("child_process")
      .execSync("git rev-parse --abbrev-ref HEAD")
      .toString()
      .trim();
  } catch {
    console.log('An error occurred while executing git rev-parse command');
  }

  let commitMessage, commitDate;

  try {
    commitMessage = require("child_process")
      .execSync("git show -s --format=%s")
      .toString()
      .trim();
    commitDate = require("child_process")
      .execSync("git show -s --format=%cd --date=iso")
      .toString()
      .trim();
  } catch {
    console.log('An error occurred while executing git show command');
  }

  let remoteFromLocalGit;
  try {
    remoteFromLocalGit = require("child_process")
      .execSync("git config --get remote.origin.url")
      .toString()
      .trim();
  } catch {
    console.log(`Could not call 'git config --get remote.origin.url' trying with 'git remote get-url origin'`)
    try {
      remoteFromLocalGit = require("child_process")
        .execSync("git remote get-url origin")
        .toString()
        .trim();
    } catch {
      console.log('Git URL could not be extrated');
    }
  }

  if ((!remoteFromLocalGit || remoteFromLocalGit == "") && process.env.VERCEL) {
    remoteFromLocalGit = `https://www.github.com./${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}.git`;
  }

  let localGitInfoResolved = {};
  if (commitId) localGitInfoResolved.commitId = commitId;
  if (commitMessage) localGitInfoResolved.commitMessage = commitMessage;
  if (commitDate) localGitInfoResolved.commitDate = commitDate;
  if (commitBranch) localGitInfoResolved.commitBranch = commitBranch;
  if (remoteFromLocalGit) localGitInfoResolved.remoteFromLocalGit = remoteFromLocalGit;

  console.log(`Parameters extrated from local git: ${JSON.stringify(localGitInfoResolved, null, 2)}`);

  return localGitInfoResolved;
}

module.exports.default = resolveLocalGitInformation;