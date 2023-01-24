const https = require("https");

/**
 * Do a request with options provided.
 *
 * @param {Object} options
 * @param {Object} data
 *
 * @return {Promise} a promise of request
 */
const doRequest = (options, data) => {
  console.log(`HTTP call fired with options: ${JSON.stringify(options)}`);
  try {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        res.setEncoding("utf8");
        let responseBody = "";

        res.on("data", (chunk) => {
          responseBody += chunk;
        });

        res.on("end", () => {
          resolve(responseBody);
        });
      });

      req.on("error", (err) => {
        reject(err);
      });

      req.write(data);
      req.end();
    });
  } catch (error) {
    console.log("-- Cannot do a request");
    console.log(error);
  }
}
module.exports.default = doRequest;