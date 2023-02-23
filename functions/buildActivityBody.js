const EVENT_TYPE = "COMMIT";
const ACTIVITY_STATUS = "OK";
const RUNTIME = "NodeJS";

/**
 * Builder for data to be sent as a body on the activity notification
 *
 * @param {Object} context Object containing execution details
 */
const buildActivityBody = (context) => {
  const { commitId, commitMessage, commitDate, commitBranch } = context.localGitInformation;

  const runtimeVersion = context.activityParameters && context.activityParameters.runtimeVersion
    ? context.activityParameters.runtimeVersion
    : process.version;

  const {
    environment = null,
    service = null,
    application = null,
    serviceType = null,
    serviceUrl = null,
    version = null,
    dependencies = null,
    devDependencies = null,
    status = null,
    runtime = null,
    eventType = null,
    repoUrl = null,
    organization = null,
    ciRuntime = null,
    ciRuntimeVersion = null,
  } = context.activityParameters;

  const repositoryUrl = repoUrl ? repoUrl : context.resolvedRemoteGitURl;
  const repoData = context.repoData;
  const repoName = (repoData && repoData.name) ? repoData.name : null;
  const repoOrganization = (repoData && repoData.owner) ? repoData.owner : null;

  const changelog = context.changelog;

  const activityBody = {
    activity: {
      id: commitId,
      service: service ? service : repoName,
      organization: organization ? organization : repoOrganization,
      environment: environment,
      commitId: commitId,
      commitBranch: commitBranch,
      commitDate: commitDate,
      commitMessage: commitMessage,
      createdAt: commitDate,
      status: status ? status : ACTIVITY_STATUS,
      runtime: runtime ? runtime : RUNTIME,
      eventType: eventType ? eventType : EVENT_TYPE,
      lastDeploy: commitDate,
      changelog: changelog,
      ...(application && { application }),
      ...(version && { version }),
      ...(dependencies && { dependencies }),
      ...(devDependencies && { devDependencies }),
      ...(serviceType && { serviceType }),
      ...(runtimeVersion && { runtimeVersion }),
      ...(ciRuntime && { ciRuntime }),
      ...(ciRuntimeVersion && { ciRuntimeVersion }),
      ...(serviceUrl && { serviceUrl }),
      ...(repositoryUrl && { repoUrl: repositoryUrl }),
    },
  };
  return activityBody;
}

module.exports.default = buildActivityBody;