module.exports = {
    sanitizeCommit: (commitMessage) => {
        return commitMessage.replace(/“/g, ``).replace(/”/g, ``).trim();
    }
}