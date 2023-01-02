const assert = require('assert');
const main = require('./index.js');

const it = (desc, fn) => {
  try {
    fn();
    console.log('\x1b[32m%s\x1b[0m', `${desc} \u2714`);
  } catch (error) {
    console.log('\n');
    console.log('\x1b[31m%s\x1b[0m', `${desc} \u2718`);
    console.error(error);
  }
};

const desc = (desc, tests) => {
  console.log('\x1b[32m%s\x1b[0m', desc);
  tests();
}

desc("Test suite: extractGitHubRepoPath", () => {
  it('Should get the project name from https://github.com/Kelsus/api-spot-package.git', () => {
    assert.strictEqual(main.extractGitHubRepoPath("https://github.com/Kelsus/api-spot-package.git"), "api-spot-package");
  });

  it('Should get the project URL from https://github.com/Kelsus/api-spot-package.git', () => {
    assert.strictEqual(main.extractGitHubRepoPath("https://github.com/Kelsus/api-spot-package.git", true), "https://github.com/Kelsus/api-spot-package.git");
  });

  it('Should get the project name from https://gitlab.com/Kelsus/api-spot-package.git', () => {
    assert.strictEqual(main.extractGitHubRepoPath("https://gitlab.com/Kelsus/api-spot-package.git"), "api-spot-package");
  });

  it('Should get the project URL from https://gitlab.com/Kelsus/api-spot-package.git', () => {
    assert.strictEqual(main.extractGitHubRepoPath("https://gitlab.com/Kelsus/api-spot-package.git", true), "https://gitlab.com/Kelsus/api-spot-package.git");
  });

  it('Should get the project name from https://wwww.github.com/Kelsus/api-spot-package.git', () => {
    assert.strictEqual(main.extractGitHubRepoPath("https://www.github.com/Kelsus/api-spot-package.git"), "api-spot-package");
  });

  it('Should get the project URL from https://www.github.com/Kelsus/api-spot-package.git', () => {
    assert.strictEqual(main.extractGitHubRepoPath("https://www.github.com/Kelsus/api-spot-package.git", true), "https://www.github.com/Kelsus/api-spot-package.git");
  });

  it('Should get the project name from git@github.com:Kelsus/spot-api.git', () => {
    assert.strictEqual(main.extractGitHubRepoPath("git@github.com:Kelsus/spot-api.git"), "spot-api");
  });

  it('Should get the project URL from git@github.com:Kelsus/spot-api.git', () => {
    assert.strictEqual(main.extractGitHubRepoPath("git@github.com:Kelsus/spot-api.git", true), "https://github.com/Kelsus/spot-api.git");
  });

  it('Should get the project name from git@gitlab.com:Kelsus/spot-api.git', () => {
    assert.strictEqual(main.extractGitHubRepoPath("git@gitlab.com:Kelsus/spot-api.git"), "spot-api");
  });

  it('Should get the project URL git@gitlab.com:Kelsus/spot-api.git', () => {
    assert.strictEqual(main.extractGitHubRepoPath("git@gitlab.com:Kelsus/spot-api.git", true), "https://gitlab.com/Kelsus/spot-api.git");
  });
});


