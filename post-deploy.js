const { version } = require("./package.json");
const spot = require('./index');
spot.main({
  environment: "prod",
  type: "package",
  service: "api-spot-package",
  repository: "https://github.com/Kelsus/api-spot-package",
  url: "https://www.npmjs.com/package/@kelsus/api-spot-package",
  version: version,
});