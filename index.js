const buildGitHubUrl             = require('./functions/buildGitHubUrl').default;
const checkIfDryRunWasRequested  = require('./functions/checkIfDryRunWasRequested').default;
const doRequest                  = require('./functions/doRequest').default;
const extractGitHubRepoData      = require('./functions/extractGitHubRepoData').default;
const generateChangelog          = require('./functions/generateChangelog').default;
const getPropertiesFromArguments = require('./functions/getPropertiesFromArguments').default;
const getPropertiesFromCI        = require('./functions/getPropertiesFromCI').default;
const getPropertiesFromEnv       = require('./functions/getPropertiesFromEnv').default;
const getVersionFromPackage      = require('./functions/getVersionFromPackage').default;
const resolveLocalGitInformation = require('./functions/resolveLocalGitInformation').default;

const DEPLOY_SPOT_API_URL = "zwdknc0wz3.execute-api.us-east-1.amazonaws.com";
const DEPLOY_SPOT_API_PATH = "/activity";

const MINIMUM_REQUIRED_PARAMETERS = ["service", "environment"];

// Out of ALLOWED_PARAMETERS since it is an special one
const DRY_RUN_PARAMETER = "dryRun";

const EVENT_TYPE = "COMMIT";
const ACTIVITY_STATUS = "OK";
const RUNTIME = "NodeJS";

module.exports = {
  /**
   * Builder for data to be sent as a body on the activity notification
   *
   * @param {Object} context Object containing execution details
   */
  buildActivityBody: (context) => {
    const { commitId, commitMessage, commitDate, commitBranch } = context.localGitInformation;

    const runtimeVersion = process.version;
    const {
      environment = null,
      service = null,
      application = null,
      serviceType = null,
      serviceUrl = null,
      version = null,
      status = null,
      runtime = null,
      eventType = null,
      repoUrl = null,
      organization = null,
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
        ...(serviceType && { serviceType }),
        ...(runtimeVersion && { runtimeVersion }),
        ...(serviceUrl && { serviceUrl }),
        ...(repositoryUrl && { repoUrl: repositoryUrl }),
      },
    };
    return activityBody;
  },

  /**
   * Build HTTP POST request options
   *
   * @param {string} URL to request POST
   * @param {string} path for the request
   * @param {number} contentLength size of the request body
   *
   * @return {Object} options for the POST request
   */
  buildPOSTRequestOptions: (URL, path, contentLength) => {
    const options = {
      hostname: URL,
      port: 443,
      path: path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": contentLength,
        "x-api-key": process.env.SPOT_API_KEY,
      },
    };
    return options;
  },

  /**
   * Main functions responsible for performing deploy spot api activity notification
   */
  main: async (args) => {
    console.log("***************************************************************************");
    console.log("Notifying deploy spot API");
    console.log("***************************************************************************");

    console.log(process.env);
    console.log(args);
    
    let context = {
      dryRunParameter: DRY_RUN_PARAMETER,
      deploySpotAPIUrl: DEPLOY_SPOT_API_URL
    }

    context.dryRunRequested = checkIfDryRunWasRequested(context, args);

    if (context.dryRunRequested) console.log("[DRY RUN MODE]: Dry run requested (No API call will be executed).");
    
    try {
      if (process.env.SPOT_API_KEY || context.dryRunRequested) {
        const propertiesFromCI = getPropertiesFromCI();

        const propertiesFromEnv = getPropertiesFromEnv();

        const propertiesFromArguments = getPropertiesFromArguments(args);

        const version = getVersionFromPackage();
        
        context.activityParameters = {
          ...propertiesFromCI,
          ...propertiesFromEnv,
          ...propertiesFromArguments,
          version: version
        }

        console.log(`Properties merge result: ${JSON.stringify(context.activityParameters, null, 2)}`);

        context.localGitInformation = resolveLocalGitInformation();

        context.repoData = extractGitHubRepoData(context);

        context.resolvedRemoteGitURl = buildGitHubUrl(context);

        context.changelog = await generateChangelog(context);

        const activityBody = module.exports.buildActivityBody(context);

        const notFoundParameters = MINIMUM_REQUIRED_PARAMETERS.filter(
          (p) => !Object.keys(activityBody.activity).includes(p) || !activityBody.activity[p]
        );

        if (notFoundParameters && notFoundParameters.length > 0) {
          console.log("Notification not sent. Some activity parameters are missing");
          console.log(`Parameters missing: ${notFoundParameters}`);
          process.exit(9);
        }

        const activity = JSON.stringify(activityBody);

        if (!context.dryRunRequested) {
          const apiURL = context.activityParameters.testURL
            ? activityParameters.testURL
            : context.deploySpotAPIUrl;

          const options = module.exports.buildPOSTRequestOptions(
            apiURL,
            DEPLOY_SPOT_API_PATH,
            activity.length
          );

          console.log(`Sending HTTP POST to ${apiURL} with body: ${activity}`);

          let errorOnNotification;

          const activityNotificationResult = await doRequest(options, activity)
            .catch((error) => {
              errorOnNotification = error;
            });

            if (!errorOnNotification) {
              console.log(`Request successful: ${activityNotificationResult}`);
            } else {
              console.log(`Request failed: ${activityNotificationResult}`);
              console.log(`Error: ${errorOnNotification}`);
            }
        } else {
          console.log(`[DRY RUN MODE]: Execution finished for activity: ${activity}`);
        }
        
      } else {
        console.log("SPOT_API_KEY Environment variable not found.");
      }
    } catch (error) {
      console.log(error);
    }
  },
};
