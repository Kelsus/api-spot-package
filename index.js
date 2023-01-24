const buildGitHubUrl              = require('./functions/buildGitHubUrl').default;
const checkIfDryRunWasRequested   = require('./functions/checkIfDryRunWasRequested').default;
const doRequest                   = require('./functions/doRequest').default;
const extractGitHubRepoData       = require('./functions/extractGitHubRepoData').default;
const generateChangelog           = require('./functions/generateChangelog').default;
const getActivityPropertiesFromCI = require('./functions/getActivityPropertiesFromCI').default;
const getVersionFromPackage       = require('./functions/getVersionFromPackage').default;
const resolveLocalGitInformation  = require('./functions/resolveLocalGitInformation').default;

const DEPLOY_SPOT_API_URL = "zwdknc0wz3.execute-api.us-east-1.amazonaws.com";
const DEPLOY_SPOT_API_PATH = "/activity";
const MINIMUM_REQUIRED_PARAMETERS = ["service", "environment"];
// Out of ALLOWED_PARAMETERS since it is an special one
const DRY_RUN_PARAMETER = "dryRun";
const ALLOWED_PARAMETERS = [
  "id",
  "eventType",
  "createdAt",
  "commitId",
  "commitBranch",
  "commitMessage",
  "commitDate",
  "application",
  "service",
  "organization",
  "status",
  "environment",
  "version",
  "serviceType",
  "runtime",
  "runtimeVersion",
  "serviceUrl",
  "repoUrl",
  "lastDeploy",
  "changelog",
];
const OPTIONAL_PARAMETERS = ["testURL"];

const ALTERNATIVE_ENV_VARIABLES = {
  application: "APP_NAME",
  service: "SERVICE_NAME",
  environment: "ENVIRONMENT_NAME",
  status: "BUILD_STATUS",
  version: "VERSION",
  url: "APP_URL",
};

const EVENT_TYPE = "COMMIT";
const ACTIVITY_STATUS = "OK";
const RUNTIME = "NodeJS";
module.exports = {
  /**
   * Read activity parameters in the shape of --param=value from script invocation
   * Includes only parameters with key within MINIMUM_REQUIRED_PARAMETERS list
   */
  parseActivityParameters: (params, actitivyProperties) => {
    if (typeof params === "object" && !Array.isArray(params)) {
      return params;
    } else {
      try {
        let activityParameters = actitivyProperties;

        activityParameters = {
          ...activityParameters,
          ...module.exports.getVariablesFromEnv(),
        };

        if (!!params) {
          const activityArgs = params.slice(2);
          console.log("Passed parameters:")
          console.log(activityArgs)

          activityArgs
            .filter((activityArg) => activityArg.indexOf("--") !== -1)
            .forEach((activityArg) => {
              // Getting 'param' from --param=value
              const argKey = activityArg.split("=")[0].slice(2);
              if (
                ALLOWED_PARAMETERS.includes(argKey) ||
                OPTIONAL_PARAMETERS.includes(argKey)
              ) {
                // Assigning 'value' from --param=value
                if (activityParameters[argKey]) {
                  console.log(
                    `Environment variable already exists. Overriding with process parameter "--${argKey}"`
                  );
                }
                activityParameters[argKey] = activityArg.split("=")[1];
              }
            });
        } else {
          console.log("No params received from command line (Tool not executed by CLI). Using inferred parameters")
        }

        return activityParameters;
      } catch (error) {
        console.log("Cannot parse activity parameters:", error);
      }
    }
  },

  /**
   * Builder for data to be sent as a body on the activity notification
   *
   * @param {Object} context Object containing execution details
   * @param {Object} Activity parameters pased from execution call
   */
  buildActivityBody: async (context, activityParameters) => {
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
    } = activityParameters;

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

  getVariablesFromEnv: () => {
    const altEnvVars = Object.values(ALTERNATIVE_ENV_VARIABLES);
    const alternativeParameters = {};

    console.log("** Checking SPOT Env variables **");
    console.log(`Deploy SPOT check for the variables: ${altEnvVars}`);
    for (const [envVar, envVarValue] of Object.entries(
      ALTERNATIVE_ENV_VARIABLES
    )) {
      if (process.env[envVarValue]) {
        console.log(`Found variable: ${envVarValue}`);
        alternativeParameters[envVar] = process.env[envVarValue];
      }
    }
    return alternativeParameters;
  },

  /**
   * Main functions responsible for performing deploy spot api activity notification
   */
  main: async (params) => {
    console.log("***************************************************************************");
    console.log("Notifying deploy spot API");
    console.log("***************************************************************************");

    console.log(process.env);
    console.log(params);
    
    let context = {
      dryRunParameter: DRY_RUN_PARAMETER,
      deploySpotAPIUrl: DEPLOY_SPOT_API_URL
    }

    context.dryRunRequested = checkIfDryRunWasRequested(context, params);

    if (context.dryRunRequested) console.log("[DRY RUN MODE]: Dry run requested (No API call will be executed).");
    
    try {
      if (process.env.SPOT_API_KEY || context.dryRunRequested) {
        context.activityParameters = getActivityPropertiesFromCI();
        context.activityParameters = {
          ...context.activityParameters,
          version: getVersionFromPackage()
        }

        const activityParameters = module.exports.parseActivityParameters(params, context.activityParameters);

        console.log("Parameters resolved from CI and passed arguments:");
        console.log(activityParameters);

        context.localGitInformation = resolveLocalGitInformation();

        context.repoData = extractGitHubRepoData(context);

        if (!context.activityParameters || !context.activityParameters.repoUrl) {
          context.resolvedRemoteGitURl = buildGitHubUrl(context);
        }

        context.changelog = await generateChangelog(context);

        const activityBody = await module.exports.buildActivityBody(
          context,
          activityParameters
        );

        const notFoundParameters = MINIMUM_REQUIRED_PARAMETERS.filter(
          (p) => !Object.keys(activityBody.activity).includes(p) || !activityBody.activity[p]
        );

        if (notFoundParameters && notFoundParameters.length > 0) {
          console.log("Notification not sent. Some activity parameters are missing");
          console.log(`Parameters missing: ${notFoundParameters}`);
          process.exit(9);
        }

        let apiURL = activityParameters.testURL
          ? activityParameters.testURL
          : context.deploySpotAPIUrl;

        console.log(`Sending HTTP POST to ${apiURL}`);

        const activity = JSON.stringify(activityBody);

        if (!context.dryRunRequested) {
          const options = module.exports.buildPOSTRequestOptions(
            apiURL,
            DEPLOY_SPOT_API_PATH,
            activity.length
          );

          let errorOnNotification;

          const activityNotificationResult = await doRequest(options, activity)
            .catch((error) => {
              errorOnNotification = error;
            });

            if (!errorOnNotification) {
              console.log(`Request successful: ${activityNotificationResult}`);
              console.log(`Notification successful for activity: ${activity}`);
            } else {
              console.log(`Notification failed for activity: ${activity}`);
              console.log(`Request status: ${activityNotificationResult}`);
              console.log(`${errorOnNotification}`);
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
