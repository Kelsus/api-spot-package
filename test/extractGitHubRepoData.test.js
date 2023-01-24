const { describe, it } = require("node:test");
const assert = require("node:assert");

const extractGitHubRepoData = require('../functions/extractGitHubRepoData').default;

describe("Test suite: extractGitHubRepoData", () => {
  it('Should get repo name, owner and server from https://github.com/Kelsus/api-spot-package.git', () => {
    const actualReponse = extractGitHubRepoData("https://github.com/Kelsus/api-spot-package.git");
    const expectedResponse = {
      name: 'api-spot-package',
      owner: 'Kelsus',
      server: 'github',
    };
    assert.deepStrictEqual(actualReponse, expectedResponse);
  });

  it('Should get repo name, owner and server from https://gitlab.com/Kelsus/api-spot-package.git', () => {
    const actualReponse = extractGitHubRepoData("https://gitlab.com/Kelsus/api-spot-package.git");
    const expectedResponse = {
      name: 'api-spot-package',
      owner: 'Kelsus',
      server: 'gitlab',
    };
    assert.deepStrictEqual(actualReponse, expectedResponse);
  });

  it('Should get repo name, owner and server from https://www.github.com/Kelsus/api-spot-package.git', () => {
    const actualReponse = extractGitHubRepoData("https://www.github.com/Kelsus/api-spot-package.git");
    const expectedResponse = {
      name: 'api-spot-package',
      owner: 'Kelsus',
      server: 'github',
    };
    assert.deepStrictEqual(actualReponse, expectedResponse);
  });

  it('Should get repo name, owner and server from git@github.com:Kelsus/spot-api.git', () => {
    const actualReponse = extractGitHubRepoData("git@github.com:Kelsus/spot-api.git");
    const expectedResponse = {
      name: 'spot-api',
      owner: 'Kelsus',
      server: 'github',
    };
    assert.deepStrictEqual(actualReponse, expectedResponse);
  });

  it('Should get repo name, owner and server from git@gitlab.com:Kelsus/spot-api.git', () => {
    const actualReponse = extractGitHubRepoData("git@gitlab.com:Kelsus/spot-api.git");
    const expectedResponse = {
      name: 'spot-api',
      owner: 'Kelsus',
      server: 'gitlab',
    };
    assert.deepStrictEqual(actualReponse, expectedResponse);
  });

  it('Should get repo name, owner and server from https://x-access-token:ghs_93UJtklu2SvM6CB9kqKNbGT4Q8eGcj1jHkRj@github.com/Kelsus/spot-api.git', () => {
    const actualReponse = extractGitHubRepoData("https://x-access-token:ghs_93UJtklu2SvM6CB9kqKNbGT4Q8eGcj1jHkRj@github.com/Kelsus/spot-api.git");
    const expectedResponse = {
      name: 'spot-api',
      owner: 'Kelsus',
      server: 'github',
    };
    assert.deepStrictEqual(actualReponse, expectedResponse);
  });

  it('Should get repo name, owner and server from https://github.com/Kelsus/api-spot-package', () => {
    const actualReponse = extractGitHubRepoData("https://github.com/Kelsus/api-spot-package");
    const expectedResponse = {
      name: 'api-spot-package',
      owner: 'Kelsus',
      server: 'github',
    };
    assert.deepStrictEqual(actualReponse, expectedResponse);
  });

  it('Should get repo name, owner and server from git@github.com:Kelsus/spot-api', () => {
    const actualReponse = extractGitHubRepoData("git@github.com:Kelsus/spot-api");
    const expectedResponse = {
      name: 'spot-api',
      owner: 'Kelsus',
      server: 'github',
    };
    assert.deepStrictEqual(actualReponse, expectedResponse);
  });

  it('Should get repo name, owner and server from https://x-access-token:ghs_93UJtklu2SvM6CB9kqKNbGT4Q8eGcj1jHkRj@github.com/Kelsus/spot-api', () => {
    const actualReponse = extractGitHubRepoData("https://x-access-token:ghs_93UJtklu2SvM6CB9kqKNbGT4Q8eGcj1jHkRj@github.com/Kelsus/spot-api");
    const expectedResponse = {
      name: 'spot-api',
      owner: 'Kelsus',
      server: 'github',
    };
    assert.deepStrictEqual(actualReponse, expectedResponse);
  });
});