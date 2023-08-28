const { describe, test } = require("node:test");
const assert = require("node:assert");

const resolveLocalGitInformation = require('../functions/resolveLocalGitInformation').default;

describe("Test suite: resolveLocalGitInformation", () => {
  test('Should return object with local git info resolved', (t) => {
    const mockedExecSyn = (arg) => `mocked-${arg}`;
    const fn = t.mock.method(require('child_process'),'execSync', mockedExecSyn);

    const actualReponse = resolveLocalGitInformation();
    const expectedResponse = {
      commitBranch: 'mocked-git rev-parse --abbrev-ref HEAD',
      commitDate: 'mocked-git show -s --format=%cd --date=iso',
      commitId: 'mocked-git rev-parse HEAD',
      commitMessage: 'mocked-git show -s --format=%s',
      remoteFromLocalGit: 'mocked-git config --get remote.origin.url'
    };
    assert.deepStrictEqual(actualReponse, expectedResponse);
  });

  test('When git rev-parse command fails, should return object without commit id and branch', (t) => {
    const mockedExecSyn = (arg) => {
      if (arg === 'git rev-parse HEAD') throw new Error('Some local git error');

      return `mocked-${arg}`;
    };
    const fn = t.mock.method(require('child_process'),'execSync', mockedExecSyn);

    const actualReponse = resolveLocalGitInformation();
    const expectedResponse = {
      commitDate: 'mocked-git show -s --format=%cd --date=iso',
      commitMessage: 'mocked-git show -s --format=%s',
      remoteFromLocalGit: 'mocked-git config --get remote.origin.url'
    };
    assert.deepStrictEqual(actualReponse, expectedResponse);
  });

  test('When git rev-parse command fails on getting date, should return object without date', (t) => {
    const mockedExecSyn = (arg) => {
      if (arg === 'git show -s --format=%cd --date=iso') throw new Error('Some local git error');

      return `mocked-${arg}`;
    };
    const fn = t.mock.method(require('child_process'),'execSync', mockedExecSyn);

    const actualReponse = resolveLocalGitInformation();
    const expectedResponse = {
      commitBranch: 'mocked-git rev-parse --abbrev-ref HEAD',
      commitId: 'mocked-git rev-parse HEAD',
      commitMessage: 'mocked-git show -s --format=%s',
      remoteFromLocalGit: 'mocked-git config --get remote.origin.url'
    };
    assert.deepStrictEqual(actualReponse, expectedResponse);
  });

  test('When git config --get remote.origin.url command fails on getting date, should use remote get-url origin and return object', (t) => {
    const mockedExecSyn = (arg) => {
      if (arg === 'git config --get remote.origin.url') throw new Error('Some local git error');

      return `mocked-${arg}`;
    };
    const fn = t.mock.method(require('child_process'),'execSync', mockedExecSyn);

    const actualReponse = resolveLocalGitInformation();
    const expectedResponse = {
      commitBranch: 'mocked-git rev-parse --abbrev-ref HEAD',
      commitDate: 'mocked-git show -s --format=%cd --date=iso',
      commitId: 'mocked-git rev-parse HEAD',
      commitMessage: 'mocked-git show -s --format=%s',
      remoteFromLocalGit: 'mocked-git remote get-url origin'
    };
    assert.deepStrictEqual(actualReponse, expectedResponse);
  });

  test('When both git commands to get remote repo url fails, should object without remote url', (t) => {
    const mockedExecSyn = (arg) => {
      if (arg === 'git config --get remote.origin.url') throw new Error('Some local git error');
      if (arg === 'git remote get-url origin') throw new Error('Some local git error');

      return `mocked-${arg}`;
    };
    const fn = t.mock.method(require('child_process'),'execSync', mockedExecSyn);

    const actualReponse = resolveLocalGitInformation();
    const expectedResponse = {
      commitBranch: 'mocked-git rev-parse --abbrev-ref HEAD',
      commitDate: 'mocked-git show -s --format=%cd --date=iso',
      commitId: 'mocked-git rev-parse HEAD',
      commitMessage: 'mocked-git show -s --format=%s'
    };
    assert.deepStrictEqual(actualReponse, expectedResponse);
  });
})