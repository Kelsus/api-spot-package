const resolveLocalGitInformation = () => {
  console.log("--Getting git repo info");
  const commitId = require("child_process")
    .execSync("git rev-parse HEAD")
    .toString()
    .trim();
  const commitMessage = require("child_process")
    .execSync("git show -s --format=%s")
    .toString()
    .trim();
  const commitDate = require("child_process")
    .execSync("git show -s --format=%cd --date=iso")
    .toString()
    .trim();
  const commitBranch = require("child_process")
    .execSync("git rev-parse --abbrev-ref HEAD")
    .toString()
    .trim();

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

  console.log("Parameters extrated from local git:");
  console.log({
    commitId,
    commitMessage,
    commitDate,
    commitBranch,
    remoteFromLocalGit
  });

  return {
    commitId,
    commitMessage,
    commitDate,
    commitBranch,
    remoteFromLocalGit
  };
}

module.exports.default = resolveLocalGitInformation;