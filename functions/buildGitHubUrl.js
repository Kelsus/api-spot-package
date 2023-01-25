/**
 * Format the given url (it can be with ssh or x-access-token format) to classic url like
 * 'https://${server}.com/${owner}/${name}'
 */
const buildGitHubUrl = (context) => {
  if (!context.repoData) return null;
  const { server, name, owner } = context.repoData;

  return `https://${server}.com/${owner}/${name}`;
}

module.exports.default = buildGitHubUrl;