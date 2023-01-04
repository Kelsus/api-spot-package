const { describe, it } = require("node:test");
const assert = require("node:assert");

const index = require("./index.js");

describe("Test suite: extractGitHubRepoPath", () => {
  it('Should get the project name from https://github.com/Kelsus/api-spot-package.git', () => {
    assert.strictEqual(index.extractGitHubRepoPath("https://github.com/Kelsus/api-spot-package.git"), "api-spot-package");
  });

  it('Should get the project URL from https://github.com/Kelsus/api-spot-package.git', () => {
    assert.strictEqual(index.extractGitHubRepoPath("https://github.com/Kelsus/api-spot-package.git", true), "https://github.com/Kelsus/api-spot-package.git");
  });

  it('Should get the project name from https://gitlab.com/Kelsus/api-spot-package.git', () => {
    assert.strictEqual(index.extractGitHubRepoPath("https://gitlab.com/Kelsus/api-spot-package.git"), "api-spot-package");
  });

  it('Should get the project URL from https://gitlab.com/Kelsus/api-spot-package.git', () => {
    assert.strictEqual(index.extractGitHubRepoPath("https://gitlab.com/Kelsus/api-spot-package.git", true), "https://gitlab.com/Kelsus/api-spot-package.git");
  });

  it('Should get the project name from https://wwww.github.com/Kelsus/api-spot-package.git', () => {
    assert.strictEqual(index.extractGitHubRepoPath("https://www.github.com/Kelsus/api-spot-package.git"), "api-spot-package");
  });

  it('Should get the project URL from https://www.github.com/Kelsus/api-spot-package.git', () => {
    assert.strictEqual(index.extractGitHubRepoPath("https://www.github.com/Kelsus/api-spot-package.git", true), "https://www.github.com/Kelsus/api-spot-package.git");
  });

  it('Should get the project name from git@github.com:Kelsus/spot-api.git', () => {
    assert.strictEqual(index.extractGitHubRepoPath("git@github.com:Kelsus/spot-api.git"), "spot-api");
  });

  it('Should get the project URL from git@github.com:Kelsus/spot-api.git', () => {
    assert.strictEqual(index.extractGitHubRepoPath("git@github.com:Kelsus/spot-api.git", true), "https://github.com/Kelsus/spot-api.git");
  });

  it('Should get the project name from git@gitlab.com:Kelsus/spot-api.git', () => {
    assert.strictEqual(index.extractGitHubRepoPath("git@gitlab.com:Kelsus/spot-api.git"), "spot-api");
  });

  it('Should get the project URL from git@gitlab.com:Kelsus/spot-api.git', () => {
    assert.strictEqual(index.extractGitHubRepoPath("git@gitlab.com:Kelsus/spot-api.git", true), "https://gitlab.com/Kelsus/spot-api.git");
  });

  it('Should get the project name from https://x-access-token:ghs_93UJtklu2SvM6CB9kqKNbGT4Q8eGcj1jHkRj@github.com/Kelsus/spot-api.git', () => {
    assert.strictEqual(index.extractGitHubRepoPath("https://x-access-token:ghs_93UJtklu2SvM6CB9kqKNbGT4Q8eGcj1jHkRj@github.com/Kelsus/spot-api.git"), "spot-api");
  });

  it('Should get the project URL from https://x-access-token:ghs_93UJtklu2SvM6CB9kqKNbGT4Q8eGcj1jHkRj@github.com/Kelsus/spot-api.git', () => {
    assert.strictEqual(index.extractGitHubRepoPath("https://x-access-token:ghs_93UJtklu2SvM6CB9kqKNbGT4Q8eGcj1jHkRj@github.com/Kelsus/spot-api.git", true), "https://github.com/Kelsus/spot-api.git");
  });
});



