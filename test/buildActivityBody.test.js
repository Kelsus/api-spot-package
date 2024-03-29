const { describe, test } = require("node:test");
const assert = require("node:assert");
const buildActivityBody = require("../functions/buildActivityBody").default;

describe("Test suite: buildActivityBody", () => {
  test("Should return object with activity body", (t) => {
    const mockedDate = () => "2023-02-16 18:53:24 +0000";
    const fn = t.mock.method(Date.prototype, "toISOString", mockedDate);

    const mockedContext = {
      localGitInformation: {
        commitId: "mocked-commit-id",
        commitMessage: "mocked-commit-message",
        commitDate: "mocked-commit-date",
        commitBranch: "mocked-commit-branch",
      },
      activityParameters: {
        environment: "mocked-environment",
        service: "mocked-service",
        application: "mocked-application",
        serviceType: "mocked-service-type",
        serviceUrl: "mocked-service-url",
        version: "mocked-version",
        // dependencies: "mocked-dependencies",
        // devDependencies: "mocked-dev-dependencies",
        status: "mocked-status",
        runtime: "mocked-runtime",
        eventType: "mocked-event-type",
        repoUrl: "mocked-repo-url",
        organization: "mocked-organization",
        ciRuntime: "mocked-ci-runtime",
        ciRuntimeVersion: "mocked-ci-runtime-version",
      },
      resolvedRemoteGitURl: "mocked-resolved-remote-git-url",
      repoData: {
        name: "mocked-repo-name",
        owner: "mocked-repo-owner",
      },
      changelog: "mocked-changelog",
    };
    const actualReponse = buildActivityBody(mockedContext);
    const expectedResponse = {
      activity: {
        id: "mocked-commit-id",
        service: "mocked-service",
        organization: "mocked-organization",
        environment: "mocked-environment",
        commitId: "mocked-commit-id",
        commitBranch: "mocked-commit-branch",
        commitDate: "mocked-commit-date",
        commitMessage: "mocked-commit-message",
        createdAt: "mocked-commit-date",
        status: "mocked-status",
        runtime: "mocked-runtime",
        eventType: "mocked-event-type",
        lastDeploy: "2023-02-16 18:53:24 +0000",
        changelog: "mocked-changelog",
        application: "mocked-application",
        version: "mocked-version",
        // dependencies: "mocked-dependencies",
        // devDependencies: "mocked-dev-dependencies",
        serviceType: "mocked-service-type",
        runtimeVersion: "v19.5.0",
        ciRuntime: "mocked-ci-runtime",
        ciRuntimeVersion: "mocked-ci-runtime-version",
        serviceUrl: "mocked-service-url",
        repoUrl: "mocked-repo-url",
      },
    };
    assert.deepStrictEqual(actualReponse, expectedResponse);
  });

  test("Should return object with activity body with default values", (t) => {
    const mockedDate = () => "2023-02-16 18:53:24 +0000";
    const fn = t.mock.method(Date.prototype, "toISOString", mockedDate);
    const mockedContext = {
      localGitInformation: {
        commitId: "mocked-commit-id",
        commitMessage: "mocked-commit-message",
        commitDate: "mocked-commit-date",
        commitBranch: "mocked-commit-branch",
      },
      activityParameters: {},
      resolvedRemoteGitURl: "mocked-resolved-remote-git-url",
      repoData: {
        name: "mocked-repo-name",
        owner: "mocked-repo-owner",
      },
      changelog: "mocked-changelog",
    };
    const actualReponse = buildActivityBody(mockedContext);
    const expectedResponse = {
      activity: {
        id: "mocked-commit-id",
        service: "mocked-repo-name",
        organization: "mocked-repo-owner",
        environment: null,
        commitId: "mocked-commit-id",
        commitBranch: "mocked-commit-branch",
        commitDate: "mocked-commit-date",
        commitMessage: "mocked-commit-message",
        createdAt: "mocked-commit-date",
        status: "OK",
        runtime: "NodeJS",
        eventType: "COMMIT",
        lastDeploy: "2023-02-16 18:53:24 +0000",
        changelog: "mocked-changelog",
        runtimeVersion: "v19.5.0",
        repoUrl: "mocked-resolved-remote-git-url",
      },
    };
    assert.deepStrictEqual(actualReponse, expectedResponse);
  });
});
