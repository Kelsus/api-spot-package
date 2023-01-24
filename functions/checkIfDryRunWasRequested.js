/**
 * Utility function to determine if a dry run was requested by passing a parameter.
 * Will be truthy for all cases where parameter --dryRun was passed, no matter the suffix.
 * For example, will be true for: --dryRun; --dryRun=true; --dryRun=whatever; --dryRun=
 */
const checkIfDryRunWasRequested = (context, params) => {
  return params
    .filter((param) => param.indexOf("--") !== -1)
    .some((param) => param.split("=")[0].slice(2) === context.dryRunParameter);
}

module.exports.default = checkIfDryRunWasRequested;