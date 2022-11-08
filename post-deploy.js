const { version } = require("./package.json");
const spot = require("@kelsus/api-spot-package");
spot.main({
  application: null,
  environment: "prod",
  type: "package",
  service: "api-spot-package",
  repository: "https://github.com/Kelsus/api-spot-package",
  url: "https://www.npmjs.com/package/@kelsus/api-spot-package",
  version: version,
});
