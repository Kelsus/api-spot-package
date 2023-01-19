const { describe, it } = require("node:test");
const assert = require("node:assert");

const { checkIfDryRunWasRequested } = require("../index.js");

describe("Test suite: checkIfDryRunWasRequested", () => {
  it('Should return true when among the arguments we pass --dryRun', () => {
    const params = [
      '/Users/user/.nvm/versions/node/v18.12.1/bin/node',
      '/Users/user/Projects/kelsus/api-spot-package/bin/npx.js',
      '--dryRun'
    ];
    const dryRunWasRequested = checkIfDryRunWasRequested(params);

    assert.equal(dryRunWasRequested, true);
  });

  it('Should return true when among the arguments we pass --dryRun=', () => {
    const params = [
      '/Users/user/.nvm/versions/node/v18.12.1/bin/node',
      '/Users/user/Projects/kelsus/api-spot-package/bin/npx.js',
      '--dryRun=',
      '--serviceUrl=https://some.url.com'
    ];
    const dryRunWasRequested = checkIfDryRunWasRequested(params);

    assert.equal(dryRunWasRequested, true);
  });
  
  it('Should return true when among the arguments we pass --dryRun=true', () => {
    const params = [
      '/Users/user/.nvm/versions/node/v18.12.1/bin/node',
      '/Users/user/Projects/kelsus/api-spot-package/bin/npx.js',
      '--serviceUrl=https://some.url.com',
      '--dryRun=true'
    ];
    const dryRunWasRequested = checkIfDryRunWasRequested(params);

    assert.equal(dryRunWasRequested, true);
  });

  it('Should return false when among the arguments we pass --dry-run', () => {
    const params = [
      '/Users/user/.nvm/versions/node/v18.12.1/bin/node',
      '/Users/user/Projects/kelsus/api-spot-package/bin/npx.js',
      '--serviceUrl=https://some.url.com',
      '--dry-run=true'
    ];
    const dryRunWasRequested = checkIfDryRunWasRequested(params);

    assert.equal(dryRunWasRequested, false);
  });

  it('Should return false when among the arguments we do not pass --dryRun', () => {
    const params = [
      '/Users/user/.nvm/versions/node/v18.12.1/bin/node',
      '/Users/user/Projects/kelsus/api-spot-package/bin/npx.js',
      '--serviceUrl=https://some.url.com'
    ];
    const dryRunWasRequested = checkIfDryRunWasRequested(params);

    assert.equal(dryRunWasRequested, false);
  });
});