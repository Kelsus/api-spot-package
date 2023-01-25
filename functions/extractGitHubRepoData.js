/**
 * Extracts github repo owner, name and server.
 * Must be a Github repository: Gitlab, Bitbucket, etc will not work properly
 */
const extractGitHubRepoData = (context) => {
  let url;

  if (context.activityParameters && context.activityParameters.repoUrl) {
    url = context.activityParameters.repoUrl;
  } else if (context.localGitInformation) {
    url = context.localGitInformation.remoteFromLocalGit
  }

  if (!url) return {
    name: "undefined_name",
    server: "undefined_server",
    owner: "undefined_owner",
  };

  const urlRegularExpressions = {
    // https based repo url
    'https': /https?:\/\/(www\.)?(?<server>[\w.-]+).com\/(?<owner>[\w.-]+)\/(?<name>(?:[\w.-]+(?=\.git)|(?:[\w.-]+)))/,

    // ssh based repo url
    'ssh': /git@(?<server>[\w.-]+).com:(?<owner>[\w.-]+)\/(?<name>(?:[\w.-]+(?=\.git)|(?:[\w.-]+)))/,

    // x-access-token refeers to http based git access
    // Ref: https://docs.github.com/en/developers/apps/building-github-apps/authenticating-with-github-apps#http-based-git-access-by-an-installation
    'x-access-token': /https?:\/\/x\-access\-token\:(?<token>[\w.-]+)@(?<server>[\w.-]+).com\/(?<owner>[\w.-]+)\/(?<name>(?:[\w.-]+(?=\.git)|(?:[\w.-]+)))/,
  };

  for (const regularExpression of Object.values(urlRegularExpressions)) {
    const match = url.match(regularExpression);
    if (!match || !match.groups) continue;
    const { name, server, owner } = match.groups;
    if (!name || !server || !owner) continue;

    return { name, server, owner };
  }

  return null;
}

module.exports.default = extractGitHubRepoData;