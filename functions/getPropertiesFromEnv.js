const ALTERNATIVE_ENV_VARIABLES = {
  application: "APP_NAME",
  service: "SERVICE_NAME",
  environment: "ENVIRONMENT_NAME",
  status: "BUILD_STATUS",
  version: "VERSION",
  url: "APP_URL",
};

const getPropertiesFromEnv = () => {
  const altEnvVars = Object.values(ALTERNATIVE_ENV_VARIABLES);
  const propertiesFromEnvironment = {};

  console.log("** Checking SPOT Env variables **");
  console.log(`Deploy SPOT check for the variables: ${altEnvVars}`);
  for (const [envVar, envVarValue] of Object.entries(
    ALTERNATIVE_ENV_VARIABLES
  )) {
    if (process.env[envVarValue]) {
      console.log(`Found variable: ${envVarValue}`);
      propertiesFromEnvironment[envVar] = process.env[envVarValue];
    }
  }

  console.log(`Properties extracted from environment: ${JSON.stringify(propertiesFromEnvironment)}`);

  return propertiesFromEnvironment;
}

module.exports.default = getPropertiesFromEnv;