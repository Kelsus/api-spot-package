const CI_DEPLOY_OPTIONS = {
  SEED_BUILD_ID: {
    service: "SEED_APP_NAME",
    environment: "SEED_STAGE_NAME",
    version: "SEED_BUILD_ID",
  },
  CIRCLECI: {
    service: "CIRCLE_PROJECT_REPONAME",
    environment: "CIRCLE_BRANCH", //<-- IS IT OK TO USE THIS?
    version: "CIRCLE_BUILD_NUM",
    repoUrl: "CIRCLE_REPOSITORY_URL"
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

const getActivityPropertiesFromCI = () => {
  const propertiesFromCI = {};
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
        propertiesFromCI[envVar] = process.env[envVarValue];
      }
    }
  }

  console.log(`Properties extracted from CI: ${JSON.stringify(propertiesFromCI)}`);

  return propertiesFromCI;
};

module.exports.default = getActivityPropertiesFromCI;