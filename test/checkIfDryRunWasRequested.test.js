const { describe, it } = require("node:test");
const assert = require("node:assert");

const checkIfDryRunWasRequested = require('../functions/checkIfDryRunWasRequested').default;

describe("Test suite: checkIfDryRunWasRequested", () => {
  const context = {
    dryRunParameter: 'dryRun'
  }

  it('Should return true when among the arguments we pass --dryRun', () => {
    const params = [
      '/Users/user/.nvm/versions/node/v18.12.1/bin/node',
      '/Users/user/Projects/kelsus/api-spot-package/bin/npx.js',
      '--dryRun'
    ];
    const dryRunWasRequested = checkIfDryRunWasRequested(context, params);

    assert.equal(dryRunWasRequested, true);
  });

  it('Should return true when among the arguments we pass --dryRun=', () => {
    const params = [
      '/Users/user/.nvm/versions/node/v18.12.1/bin/node',
      '/Users/user/Projects/kelsus/api-spot-package/bin/npx.js',
      '--dryRun=',
      '--serviceUrl=https://some.url.com'
    ];
    const dryRunWasRequested = checkIfDryRunWasRequested(context, params);

    assert.equal(dryRunWasRequested, true);
  });
  
  it('Should return true when among the arguments we pass --dryRun=true', () => {
    const params = [
      '/Users/user/.nvm/versions/node/v18.12.1/bin/node',
      '/Users/user/Projects/kelsus/api-spot-package/bin/npx.js',
      '--serviceUrl=https://some.url.com',
      '--dryRun=true'
    ];
    const dryRunWasRequested = checkIfDryRunWasRequested(context, params);

    assert.equal(dryRunWasRequested, true);
  });

  it('Should return false when among the arguments we pass --dry-run', () => {
    const params = [
      '/Users/user/.nvm/versions/node/v18.12.1/bin/node',
      '/Users/user/Projects/kelsus/api-spot-package/bin/npx.js',
      '--serviceUrl=https://some.url.com',
      '--dry-run=true'
    ];
    const dryRunWasRequested = checkIfDryRunWasRequested(context, params);

    assert.equal(dryRunWasRequested, false);
  });

  it('Should return false when among the arguments we do not pass --dryRun', () => {
    const params = [
      '/Users/user/.nvm/versions/node/v18.12.1/bin/node',
      '/Users/user/Projects/kelsus/api-spot-package/bin/npx.js',
      '--serviceUrl=https://some.url.com'
    ];
    const dryRunWasRequested = checkIfDryRunWasRequested(context, params);

    assert.equal(dryRunWasRequested, false);
  });

  it('Should return true when no args passed (therefore no --dryRun)', () => {
    const dryRunWasRequested = checkIfDryRunWasRequested(context, undefined);

    assert.equal(dryRunWasRequested, false);
  });

  it('Should return false when params passed explicitly as object (invoked from main) and with no dryRun', () => {
    const args = {
      environment: 'prod'
    }
    const dryRunWasRequested = checkIfDryRunWasRequested(context, args);

    assert.equal(dryRunWasRequested, false);
  });

  it('Should return true when params passed explicitly as object (invoked from main) and with dryRun in true', () => {
    const args = {
      environment: 'prod',
      dryRun: true
    }
    const dryRunWasRequested = checkIfDryRunWasRequested(context, args);

    assert.equal(dryRunWasRequested, true);
  });
});