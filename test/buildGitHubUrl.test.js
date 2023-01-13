const { describe, it } = require("node:test");
const assert = require("node:assert");

const { buildGitHubUrl } = require("../index.js");

describe("Test suite: buildGitHubUrl", () => {
  it('Should get the project URL from https://github.com/Kelsus/api-spot-package.git', () => {
    const actualReponse = buildGitHubUrl("https://github.com/Kelsus/api-spot-package.git");
    const expectedResponse = "https://github.com/Kelsus/api-spot-package";
    assert.strictEqual(actualReponse, expectedResponse);
  });

  it('Should get the project URL from https://gitlab.com/Kelsus/api-spot-package.git', () => {
    const actualReponse = buildGitHubUrl("https://gitlab.com/Kelsus/api-spot-package.git");
    const expectedResponse = "https://gitlab.com/Kelsus/api-spot-package";
    assert.strictEqual(actualReponse, expectedResponse);
  });

  it('Should get the project URL from https://www.github.com/Kelsus/api-spot-package.git', () => {
    const actualReponse = buildGitHubUrl("https://www.github.com/Kelsus/api-spot-package.git");
    const expectedResponse = "https://github.com/Kelsus/api-spot-package";
    assert.strictEqual(actualReponse, expectedResponse);
  });

  it('Should get the project URL from git@github.com:Kelsus/spot-api.git', () => {
    const actualReponse = buildGitHubUrl("git@github.com:Kelsus/spot-api.git");
    const expectedResponse = "https://github.com/Kelsus/spot-api";
    assert.strictEqual(actualReponse, expectedResponse);
  });

  it('Should get the project URL from git@gitlab.com:Kelsus/spot-api.git', () => {
    const actualReponse = buildGitHubUrl("git@gitlab.com:Kelsus/spot-api.git");
    const expectedResponse = "https://gitlab.com/Kelsus/spot-api";
    assert.strictEqual(actualReponse, expectedResponse);
  });

  it('Should get the project URL from https://x-access-token:ghs_93UJtklu2SvM6CB9kqKNbGT4Q8eGcj1jHkRj@github.com/Kelsus/spot-api.git', () => {
    const actualReponse = buildGitHubUrl("https://x-access-token:ghs_93UJtklu2SvM6CB9kqKNbGT4Q8eGcj1jHkRj@github.com/Kelsus/spot-api.git");
    const expectedResponse = "https://github.com/Kelsus/spot-api";
    assert.strictEqual(actualReponse, expectedResponse);
  });

})