const doRequest = require('./doRequest').default;

/**
* Responsible for obtaining git information from the local directory using basic git actions
*/
const getLastActivityId = async (context, serviceId, environment) => {
 try {
   const options = {
     hostname: context.deploySpotAPIUrl,
     port: 443,
     path: `/services/${serviceId}/environments/${environment}/last`,
     headers: {
       "X-Api-Key": process.env.SPOT_API_KEY,
     },
     method: "GET",
   };
   
   const req = await doRequest(options, "");

   return req.responseBody;
 } catch (error) {
   console.log("--Cannot get last activity");
   console.log(error);
 }
}

const generateChangelog = async (context) => {
  const LATEST_COMMIT_COUNT = 20;

  const currentCommitId = context.localGitInformation.commitId;
  const service = context.activityParameters && context.activityParameters.service
    ? context.activityParameters.service 
    : context.repoData.name;
  const environment = context.activityParameters ? context.activityParameters.environment : null;

  try {
    let lastActivity;

    let organization = (context.activityParameters && context.activityParameters.organization)
      ? context.activityParameters.organization
      : null;

    if (!organization) {
      organization = (context.repoData && context.repoData.owner) ? context.repoData.owner : null;
    }

    if (!!organization) {
      if (!context.dryRunRequested) {
        const serviceId = `${organization}-${service}`;
        lastActivity = await getLastActivityId(
          context,
          serviceId,
          environment
        );
      } else {
        console.log(`[DRY RUN MODE]: No last activity (commit) will be requested. Generating changelog with last ${LATEST_COMMIT_COUNT} commits`);
      }
    }

    let lastActivityJSON;
    try {
      lastActivityJSON = JSON.parse(lastActivity);
    } catch (e) {
      lastActivityJSON = null;
    }
    const lastId = lastActivityJSON && lastActivityJSON.response
      ? lastActivityJSON.response.commitId
      : null;
    const changelog = require("child_process")
      .execSync(
        `git log --pretty=format:"%h %s" ${lastId ? lastId + ".." + currentCommitId : `-n ${LATEST_COMMIT_COUNT}`
        }`
      )
      .toString()
      .replace(/“/g, `"`)
      .trim()
      .split(/\r?\n/);

    if (!lastId && changelog.length > 15) {
      changelog.slice(0, 15);
      changelog.push("...");
    } else if (changelog.length == 1 && changelog[0] === "") {
      return [];
    }
    console.log("--Changelog generated: ", changelog);
    return changelog;
  } catch (error) {
    console.log("--Cannot generate changelog");
    console.log(error);
  }
}

module.exports.default = generateChangelog;