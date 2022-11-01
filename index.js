/* eslint @typescript-eslint/no-var-requires: "off" */
const https = require("https");
const DEPLOY_SPOT_API_URL = "api.spot.kelsus.com";
const DEPLOY_SPOT_API_PATH = "/activity";
const MINIMUM_REQUIRED_PARAMETERS = [
  "application",
  "environment",
  "type",
  "repository",
  "url",
  "version",
];
const OPTIONAL_PARAMETERS = ["testURL"];
const EVENT_TYPE = "COMMIT";
const ACTIVITY_STATUS = "OK";
const RUNTIME = "NodeJS";
module.exports = {
  /**
   * Read activity parameters in the shape of --param=value from script invocation
   * Includes only parameters with key within MINIMUM_REQUIRED_PARAMETERS list
   */
  extractGitHubRepoPath: (url) => {
    if (!url) return "undefined_name";
    const match = url.match(
      /^https?:\/\/(www\.)?github.com\/(?<owner>[\w.-]+)\/(?<name>[\w.-]+)/
    );
    if (!match || !(match.groups?.owner && match.groups?.name)) return null;
    return `${match.groups.name}`;
  },
  parseActivityParameters: (params) => {
    if (typeof params === "object" && !Array.isArray(params)) {
      return params;
    } else {
      const activityArgs = params.slice(2);
      let activityParameters = {};

      activityArgs
        .filter((activityArg) => activityArg.indexOf("--") !== -1)
        .forEach((activityArg) => {
          // Getting 'param' from --param=value
          const argKey = activityArg.split("=")[0].slice(2);

          if (
            MINIMUM_REQUIRED_PARAMETERS.includes(argKey) ||
            OPTIONAL_PARAMETERS.includes(argKey)
          ) {
            // Assigning 'value' from --param=value
            activityParameters[argKey] = activityArg.split("=")[1];
          }
        });

      return activityParameters;
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
        path: `/dev/services/${service}/environments/${environment}/last`,
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
      const lastActivityJSON = JSON.parse(lastActivity.response);
      const lastId = lastActivityJSON.commitId;
      const changelog = require("child_process")
        .execSync(
          `
      git log --pretty=format:"%h %s" ${lastId}..${currentCommitId}`
        )
        .toString()
        .trim()
        .split(/\r?\n/);
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
    return {
      commitId,
      commitMessage,
      commitDate,
      commitBranch,
    };
  },

  /**
   * Builder for data to be sent as a body on the activity notification
   *
   * @param {Object} Activity parameters pased from execution call
   */
  buildActivityBody: async (activityParameters) => {
    const { commitId, commitMessage, commitDate, commitBranch } =
      module.exports.resolveLocalGitInformation();
    const runtimeVersion = process.version;
    const { application, environment, type, repository, url, version } =
      activityParameters;

    const repoName = module.exports.extractGitHubRepoPath(repository);
    const changelog = await module.exports.generateChangelog(
      commitId,
      repoName,
      environment
    );
    const activityBody = JSON.stringify({
      activity: {
        id: commitId,
        service: repoName,
        eventType: EVENT_TYPE,
        createdAt: commitDate,
        commitId: commitId,
        commitMessage: commitMessage,
        commitDate: commitDate,
        commitBranch: commitBranch,
        application: application,
        status: ACTIVITY_STATUS,
        environment: environment,
        version: version,
        serviceType: type,
        runtime: RUNTIME,
        runtimeVersion: runtimeVersion,
        serviceUrl: url,
        repoUrl: repository,
        lastDeploy: commitDate,
        changelog: changelog,
      },
    });
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
      port: 4000,
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

  /**
   * Main functions responsible for performing deploy spot api activity notification
   */
  main: async (params) => {
    if (!process.env.SPOT_API_KEY) throw new Error("No Spot API Key");
    console.log(
      "***************************************************************************"
    );
    console.log("Notifying deploy spot API");
    console.log(
      "***************************************************************************"
    );
    const activityParameters = module.exports.parseActivityParameters(params);

    if (
      !MINIMUM_REQUIRED_PARAMETERS.every((p) =>
        Object.keys(activityParameters).includes(p)
      )
    ) {
      console.log(
        "Notification not sent. Some activity parameters are missing"
      );
      console.log(`Required parameters: ${MINIMUM_REQUIRED_PARAMETERS}`);
      process.exit(9);
    }

    let apiURL = activityParameters.testURL
      ? activityParameters.testURL
      : DEPLOY_SPOT_API_URL;

    console.log(`Sending HTTP POST to ${apiURL}`);

    const activityBody = await module.exports.buildActivityBody(
      activityParameters
    );
    const options = module.exports.buildPOSTRequestOptions(
      apiURL,
      DEPLOY_SPOT_API_PATH,
      activityBody.length
    );

    let errorOnNotification;

    const activityNotificationResult = await module.exports
      .doRequest(options, activityBody)
      .catch((error) => {
        errorOnNotification = error;
      });
    if (!errorOnNotification) {
      console.log(`Request successful: ${activityNotificationResult}`);
      console.log(`Notification successful for activity: ${activityBody}`);
    } else {
      console.log(`Notification failed for activity: ${activityBody}`);
      console.log(`Request status: ${activityNotificationResult}`);
      console.log(`${errorOnNotification}`);
    }
  },
};
