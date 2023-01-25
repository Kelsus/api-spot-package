const { describe, it } = require("node:test");
const assert = require("node:assert");

const buildGitHubUrl = require('../functions/buildGitHubUrl').default;

describe("Test suite: buildGitHubUrl", () => {

  it('Should get the project URL from { name: api-spot-package, owner: Kelsus, server: github }', () => {
    const context = {
      repoData: {
        name: 'api-spot-package',
        owner: 'Kelsus',
        server: 'github',
      }
    };
    const actualReponse = buildGitHubUrl(context);
    const expectedResponse = "https://github.com/Kelsus/api-spot-package";
    assert.strictEqual(actualReponse, expectedResponse);
  });

  it('Should return null when no repoData is present on context', () => {
    const context = {};
    const actualReponse = buildGitHubUrl(context);
    const expectedResponse = null;
    assert.strictEqual(actualReponse, expectedResponse);
  });

})