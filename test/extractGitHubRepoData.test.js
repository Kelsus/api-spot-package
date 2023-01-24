const { describe, it } = require("node:test");
const assert = require("node:assert");

const extractGitHubRepoData = require('../functions/extractGitHubRepoData').default;

describe("Test suite: extractGitHubRepoData", () => {
  describe("When repo URL is present in activityParameters within context", () => {
    let context = {
      activityParameters: {}
    }

    it('Should get repo name, owner and server from https://github.com/Kelsus/api-spot-package.git', () => {
      context.activityParameters.repoUrl = "https://github.com/Kelsus/api-spot-package.git";
      const actualReponse = extractGitHubRepoData(context);
      const expectedResponse = {
        name: 'api-spot-package',
        owner: 'Kelsus',
        server: 'github',
      };
      assert.deepStrictEqual(actualReponse, expectedResponse);
    });

    it('Should get repo name, owner and server from https://gitlab.com/Kelsus/api-spot-package.git', () => {
      context.activityParameters.repoUrl = "https://gitlab.com/Kelsus/api-spot-package.git";
      const actualReponse = extractGitHubRepoData(context);
      const expectedResponse = {
        name: 'api-spot-package',
        owner: 'Kelsus',
        server: 'gitlab',
      };
      assert.deepStrictEqual(actualReponse, expectedResponse);
    });

    it('Should get repo name, owner and server from https://www.github.com/Kelsus/api-spot-package.git', () => {
      context.activityParameters.repoUrl = "https://www.github.com/Kelsus/api-spot-package.git";
      const actualReponse = extractGitHubRepoData(context);
      const expectedResponse = {
        name: 'api-spot-package',
        owner: 'Kelsus',
        server: 'github',
      };
      assert.deepStrictEqual(actualReponse, expectedResponse);
    });

    it('Should get repo name, owner and server from git@github.com:Kelsus/spot-api.git', () => {
      context.activityParameters.repoUrl = "git@github.com:Kelsus/spot-api.git";
      const actualReponse = extractGitHubRepoData(context);
      const expectedResponse = {
        name: 'spot-api',
        owner: 'Kelsus',
        server: 'github',
      };
      assert.deepStrictEqual(actualReponse, expectedResponse);
    });

    it('Should get repo name, owner and server from git@gitlab.com:Kelsus/spot-api.git', () => {
      context.activityParameters.repoUrl = "git@gitlab.com:Kelsus/spot-api.git";
      const actualReponse = extractGitHubRepoData(context);
      const expectedResponse = {
        name: 'spot-api',
        owner: 'Kelsus',
        server: 'gitlab',
      };
      assert.deepStrictEqual(actualReponse, expectedResponse);
    });

    it('Should get repo name, owner and server from https://x-access-token:ghs_93UJtklu2SvM6CB9kqKNbGT4Q8eGcj1jHkRj@github.com/Kelsus/spot-api.git', () => {
      context.activityParameters.repoUrl = "https://x-access-token:ghs_93UJtklu2SvM6CB9kqKNbGT4Q8eGcj1jHkRj@github.com/Kelsus/spot-api.git";
      const actualReponse = extractGitHubRepoData(context);
      const expectedResponse = {
        name: 'spot-api',
        owner: 'Kelsus',
        server: 'github',
      };
      assert.deepStrictEqual(actualReponse, expectedResponse);
    });

    it('Should get repo name, owner and server from https://github.com/Kelsus/api-spot-package', () => {
      context.activityParameters.repoUrl = "https://github.com/Kelsus/api-spot-package";
      const actualReponse = extractGitHubRepoData(context);
      const expectedResponse = {
        name: 'api-spot-package',
        owner: 'Kelsus',
        server: 'github',
      };
      assert.deepStrictEqual(actualReponse, expectedResponse);
    });

    it('Should get repo name, owner and server from git@github.com:Kelsus/spot-api', () => {
      context.activityParameters.repoUrl = "git@github.com:Kelsus/spot-api";
      const actualReponse = extractGitHubRepoData(context);
      const expectedResponse = {
        name: 'spot-api',
        owner: 'Kelsus',
        server: 'github',
      };
      assert.deepStrictEqual(actualReponse, expectedResponse);
    });

    it('Should get repo name, owner and server from https://x-access-token:ghs_93UJtklu2SvM6CB9kqKNbGT4Q8eGcj1jHkRj@github.com/Kelsus/spot-api', () => {
      context.activityParameters.repoUrl = "https://x-access-token:ghs_93UJtklu2SvM6CB9kqKNbGT4Q8eGcj1jHkRj@github.com/Kelsus/spot-api";
      const actualReponse = extractGitHubRepoData(context);
      const expectedResponse = {
        name: 'spot-api',
        owner: 'Kelsus',
        server: 'github',
      };
      assert.deepStrictEqual(actualReponse, expectedResponse);
    });
  });


  describe("When repo URL is present in localGitInformation within context", () => {
    let context = {
      localGitInformation: {}
    }

    it('Should get repo name, owner and server from https://github.com/Kelsus/api-spot-package.git', () => {
      context.localGitInformation.remoteFromLocalGit = "https://github.com/Kelsus/api-spot-package.git";
      const actualReponse = extractGitHubRepoData(context);
      const expectedResponse = {
        name: 'api-spot-package',
        owner: 'Kelsus',
        server: 'github',
      };
      assert.deepStrictEqual(actualReponse, expectedResponse);
    });
  });

  describe("When repo URL is not present context", () => {
    it('Should return an object with the three properties as string with undefined prefix', () => {
      const context = {
        localGitInformation: {}
      };
      const actualReponse = extractGitHubRepoData(context);
      const expectedResponse = {
        name: "undefined_name",
        server: "undefined_server",
        owner: "undefined_owner",
      };
      assert.deepStrictEqual(actualReponse, expectedResponse);
    });

    it('Should return an object with the three properties as string with undefined prefix', () => {
      const actualReponse = extractGitHubRepoData({});
      const expectedResponse = {
        name: "undefined_name",
        server: "undefined_server",
        owner: "undefined_owner",
      };
      assert.deepStrictEqual(actualReponse, expectedResponse);
    });
  });
});