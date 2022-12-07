/* eslint @typescript-eslint/no-var-requires: "off" */
const https = require("https");

const DEPLOY_SPOT_API_URL = "zwdknc0wz3.execute-api.us-east-1.amazonaws.com";
const DEPLOY_SPOT_API_PATH = "/activity";
const MINIMUM_REQUIRED_PARAMETERS = ["service", "environment"];
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

const CI_DEPLOY_OPTIONS = {
  SEED_BUILD_ID: {
    application: "SEED_APP_NAME",
    service: "SEED_SERVICE_NAME",
    environment: "SEED_STAGE_NAME",
    version: "SEED_BUILD_ID",
  },
  CIRCLECI: {
    service: "CIRCLE_PROJECT_REPONAME",
    environment: "CIRCLE_BRANCH", //<-- IS IT OK TO USE THIS?
    version: "CIRCLE_BUILD_NUM",
  },
  NETLIFY: {
    url: "URL",
    application: "SITE_NAME",
    environment: "CONTEXT",
    version: "BUILD_ID",
  },
  AWS_JOB_ID: {
    environment: "AWS_BRANCH", //<-- IS IT OK TO USE THIS?
    version: "AWS_JOB_ID",
  },
  VERCEL: {
    environment: "VERCEL_ENV",
    url: "VERCEL_URL",
    service: "VERCEL_GIT_REPO_SLUG",
  },
};

const EVENT_TYPE = "COMMIT";
const ACTIVITY_STATUS = "OK";
const RUNTIME = "NodeJS";
module.exports = {
  /**
   * Read activity parameters in the shape of --param=value from script invocation
   * Includes only parameters with key within MINIMUM_REQUIRED_PARAMETERS list
   */
  extractGitHubRepoPath: (url, returnUrl = false) => {
    if (!url) return "undefined_name";
    const match = url.match(
      /https?:\/\/(www\.)?github.com\/(?<owner>[\w.-]+)\/(?<name>[\w.-]+)\.git*/
    );
    if (!match || !(match.groups?.owner && match.groups?.name)) return null;
    return !returnUrl ? `${match.groups.name}` : `${match[0]}`;
  },

  parseActivityParameters: (params) => {
    if (typeof params === "object" && !Array.isArray(params)) {
      return params;
    } else {
      try {

        const { version } = require("./package.json") || null;

        let activityParameters = module.exports.checkForCIDeploy();

        if(version){
          console.log(`Got 'version' ${version} from package.json. (It might be replaced with an Env variable)`)
        }

        activityParameters = {
          ...activityParameters,
          ...(version && { version }),
          ...module.exports.getVariablesFromEnv(),
        };

        const activityArgs = params.slice(2);

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

        return activityParameters;
      } catch (error) {
        console.log("Cannot parse activity parameters:", error);
      }
    }
  },

  /**
   * Responsible for obtaining git information from the local directory using basic git actions
   */
  getLastActivityId: async (service, environment) => {
    try {
      const options = {
        hostname: DEPLOY_SPOT_API_URL,
        port: 443,
        path: `/prod/services/${service}/environments/${environment}/last`,
        headers: {
          "X-Api-Key": process.env.SPOT_API_KEY,
        },
        method: "GET",
      };
      const req = await module.exports.doRequest(options, "");
      return req;
    } catch (error) {
      console.log("--Cannot get last activity");
      console.log(error);
    }
  },

  generateChangelog: async (currentCommitId, service, environment) => {
    try {
      const lastActivity = await module.exports.getLastActivityId(
        service,
        environment
      );
      let lastActivityJSON;
      try {
        lastActivityJSON = JSON.parse(lastActivity);
      } catch (e) {
        lastActivityJSON = null;
      }
      const lastId = lastActivityJSON ? lastActivityJSON.response.commitId : null;
      const changelog = require("child_process")
        .execSync(
          `git log --pretty=format:"%h %s" ${
            lastId ? lastId + ".." : ""
          }${currentCommitId}`
        )
        .toString()
        .trim()
        .split(/\r?\n/);

      if (!lastId && changelog.length > 15) {
        changelog.slice(0, 15);
        changelog.push("...");
      }else if(changelog.length == 1 && changelog[0] === ''){
        return [];
      }
      return changelog;
    } catch (error) {
      console.log("--Cannot generate changelog");
      console.log(error);
    }
  },

  resolveLocalGitInformation: () => {
    console.log("--Getting git repo info");
    const commitId = require("child_process")
      .execSync("git rev-parse HEAD")
      .toString()
      .trim();
    const commitMessage = require("child_process")
      .execSync("git show -s --format=%s")
      .toString()
      .trim();
    const commitDate = require("child_process")
      .execSync("git show -s --format=%cd --date=iso")
      .toString()
      .trim();
    const commitBranch = require("child_process")
      .execSync("git rev-parse --abbrev-ref HEAD")
      .toString()
      .trim();
    let _repository = require("child_process")
      .execSync("git remote -v")
      .toString()
      .trim();

    if ((!_repository || _repository == "") && process.env.VERCEL) {
      _repository = `https://www.github.com./${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}.git`;
    }

    const repository = module.exports.extractGitHubRepoPath(_repository, true);

    return {
      commitId,
      commitMessage,
      commitDate,
      commitBranch,
      repository,
    };
  },

  /**
   * Builder for data to be sent as a body on the activity notification
   *
   * @param {Object} Activity parameters pased from execution call
   */
  buildActivityBody: async (activityParameters) => {
    const { commitId, commitMessage, commitDate, commitBranch, repository } =
      module.exports.resolveLocalGitInformation();
    const runtimeVersion = process.version;
    const {
      environment,
      service = null,
      application = null,
      serviceType = null,
      serviceUrl = null,
      version = null,
      status = null,
      runtime = null,
      eventType = null,
      repoUrl = null,
    } = activityParameters;

    const repoName = module.exports.extractGitHubRepoPath(repository);
    const changelog = await module.exports.generateChangelog(
      commitId,
      service ?? repoName,
      environment
    );
    const activityBody = {
      activity: {
        id: commitId,
        service: service ?? repoName,
        environment: environment,
        commitId: commitId,
        commitBranch: commitBranch,
        commitDate: commitDate,
        commitMessage: commitMessage,
        createdAt: commitDate,
        status: status ?? ACTIVITY_STATUS,
        runtime: runtime ?? RUNTIME,
        eventType: eventType ?? EVENT_TYPE,
        lastDeploy: commitDate,
        changelog: changelog,
        ...(application && { application }),
        ...(version && { version }),
        ...(serviceType && { serviceType }),
        ...(runtimeVersion && { runtimeVersion }),
        ...(serviceUrl && { serviceUrl }),
        ...((repository || repoUrl) && { repoUrl: repoUrl ?? repository }),
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
        "X-Api-Key": process.env.SPOT_API_KEY,
      },
    };
    return options;
  },
  /**
   * Do a request with options provided.
   *
   * @param {Object} options
   * @param {Object} data
   *
   * @return {Promise} a promise of request
   */
  doRequest: (options, data) => {
    try {
      return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          res.setEncoding("utf8");
          let responseBody = "";

          res.on("data", (chunk) => {
            responseBody += chunk;
          });

          res.on("end", () => {
            resolve(responseBody);
          });
        });

        req.on("error", (err) => {
          reject(err);
        });

        req.write(data);
        req.end();
      });
    } catch (error) {
      console.log("-- Cannot do a request");
      console.log(error);
    }
  },

  checkForCIDeploy: () => {
    const variablesFromCI = {};
    const deployOptionVars = Object.keys(CI_DEPLOY_OPTIONS);
    const usedCI = deployOptionVars.find((key) => key in process.env);

    if (usedCI) {
      const CIVars = Object.values(CI_DEPLOY_OPTIONS[usedCI]);
      console.log("-- Found a CI env variable --");
      console.log(`Checking for CI variables: ${CIVars}`);

      for (const [envVar, envVarValue] of Object.entries(
        CI_DEPLOY_OPTIONS[usedCI]
      )) {
        if (process.env[envVarValue]) {
          console.log(`Found variable: ${envVarValue}`);
          variablesFromCI[envVar] = process.env[envVarValue];
        }
      }
    }
    return variablesFromCI;
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
    try {
      console.log(
        "***************************************************************************"
      );
      console.log("Notifying deploy spot API");
      console.log(
        "***************************************************************************"
      );
      if (process.env.SPOT_API_KEY) {
        const activityParameters =
          module.exports.parseActivityParameters(params);

        const activityBody = await module.exports.buildActivityBody(
          activityParameters
        );

        const notFoundParameters = MINIMUM_REQUIRED_PARAMETERS.filter(
          (p) => !Object.keys(activityBody.activity).includes(p)
        );

        if (notFoundParameters && notFoundParameters.length > 0) {
          console.log(
            "Notification not sent. Some activity parameters are missing"
          );
          console.log(`Parameters missing: ${notFoundParameters}`);
          process.exit(9);
        }

        let apiURL = activityParameters.testURL
          ? activityParameters.testURL
          : DEPLOY_SPOT_API_URL;

        console.log(`Sending HTTP POST to ${apiURL}`);

        const activity = JSON.stringify(activityBody);

        const options = module.exports.buildPOSTRequestOptions(
          apiURL,
          DEPLOY_SPOT_API_PATH,
          activity.length
        );

        let errorOnNotification;
        const activityNotificationResult = await module.exports
          .doRequest(options, activity)
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
        console.log("SPOT_API_KEY Environment variable  not found.");
      }
    } catch (error) {
      console.log(error);
    }
  },
};
