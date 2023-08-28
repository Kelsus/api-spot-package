const buildActivityBody          = require('./functions/buildActivityBody').default;
const buildGitHubUrl             = require('./functions/buildGitHubUrl').default;
const checkIfDryRunWasRequested  = require('./functions/checkIfDryRunWasRequested').default;
const doRequest                  = require('./functions/doRequest').default;
const extractGitHubRepoData      = require('./functions/extractGitHubRepoData').default;
const generateChangelog          = require('./functions/generateChangelog').default;
const getPropertiesFromArguments = require('./functions/getPropertiesFromArguments').default;
const getPropertiesFromCI        = require('./functions/getPropertiesFromCI').default;
const getPropertiesFromEnv       = require('./functions/getPropertiesFromEnv').default;
const getInfoFromPackage         = require('./functions/getInfoFromPackage').default;
const resolveLocalGitInformation = require('./functions/resolveLocalGitInformation').default;

const DEPLOY_SPOT_API_URL = "sdhrf8ktji.execute-api.us-east-1.amazonaws.com";
const DEPLOY_SPOT_API_PATH = "/activity";

const MINIMUM_REQUIRED_PARAMETERS = ["service", "environment"];

// Out of ALLOWED_PARAMETERS since it is an special one
const DRY_RUN_PARAMETER = "dryRun";

module.exports = {
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

        const packageInfo = getInfoFromPackage();
        
        context.activityParameters = {
          ...propertiesFromCI,
          ...propertiesFromEnv,
          ...propertiesFromArguments,
          version: packageInfo ? packageInfo.version : null,
          // dependencies: packageInfo ? packageInfo.dependencies : null,
          // devDependencies: packageInfo ? packageInfo.devDependencies : null
        }

        console.log(`Properties merge result: ${JSON.stringify(context.activityParameters, null, 2)}`);

        context.localGitInformation = resolveLocalGitInformation();

        context.repoData = extractGitHubRepoData(context);

        context.resolvedRemoteGitURl = buildGitHubUrl(context);

        context.changelog = await generateChangelog(context);

        const activityBody = buildActivityBody(context);

        const notFoundParameters = MINIMUM_REQUIRED_PARAMETERS.filter(
          (p) => !Object.keys(activityBody.activity).includes(p) || !activityBody.activity[p]
        );

        if (notFoundParameters && notFoundParameters.length > 0) {
          console.log("Notification not sent. Some activity parameters are missing");
          console.log(`Parameters missing: ${notFoundParameters}`);
          throw new Error("Some activity parameters are missing");
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
              console.log(`Request successful: ${JSON.stringify(activityNotificationResult)}`);
            } else {
              console.log("Request failed:");
              console.log(errorOnNotification);
            }
        } else {
          console.log(`[DRY RUN MODE]: Execution finished for activity: ${JSON.stringify(activity)}`);
        }
        
      } else {
        console.log("SPOT_API_KEY Environment variable not found.");
      }
    } catch (error) {
      console.log(error);
    }
  },
};
