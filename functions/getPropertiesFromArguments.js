const ALLOWED_ARGS = [
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
const OPTIONAL_ARGS = ["testURL"];

/**
 * Read activity arguments in the shape of --param=value from script invocation
 */
const getPropertiesFromArguments = (arguments) => {
  if (typeof arguments === "object" && !Array.isArray(arguments)) {
    return arguments;
  }

  try {
    let propertiesFromArguments = {};

    if (!!arguments) {
      const activityArgs = arguments.slice(2);
      console.log("Passed parameters:")
      console.log(activityArgs)

      activityArgs
        .filter((activityArg) => activityArg.indexOf("--") !== -1)
        .forEach((activityArg) => {
          // Getting 'param' from --param=value
          const argKey = activityArg.split("=")[0].slice(2);

          if (ALLOWED_ARGS.includes(argKey) || OPTIONAL_ARGS.includes(argKey)) {
            // Assigning 'value' from --param=value
            propertiesFromArguments[argKey] = activityArg.split("=")[1];
          }
        });
    } else {
      console.log("No args received from command line (Tool not executed by CLI). Using inferred parameters")
    }

    console.log(`Properties received from args: ${JSON.stringify(propertiesFromArguments)}`);

    return propertiesFromArguments;
  } catch (error) {
    console.log(`Cannot parse activity args: ${error}`);
  }
}

module.exports.default = getPropertiesFromArguments;