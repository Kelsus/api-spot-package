# Kelsus Spot API Package

## Description
Post deploy script for [Kelsus Spot](https://spot.kelsus.com/)

[Spot Repository](https://github.com/Kelsus/deploy-spot-webapp)
- Once the script is executed, it will send a POST request to the [Spot API](https://github.com/Kelsus/spot-api)
- This request will generate a new service/application with an activity.
- On the app you will be able to assign the service to a client, and on each deploy it will trigger the script again, generating a new activity.
- The script supports differents environments for the same app.
- Support for different CIs

## How to use it
Set the ***`SPOT_API_KEY`*** environment variable. (Ask Spot team members to provide it).

#### Call the service either by

1. Using NPX from a CLI, passing arguments if needed:

```
npx @kelsus/api-spot-package
```


2.  Or installing this package on you deployer and then invoking main():
```
const SPOT = require('@kelsus/api-spot-package')

SPOT.main(args)
```

## Execute
Run the npx command with optional args to execute the post deploy script.
```
npx @kelsus/api-spot-package
```
## Parameters

## For CI
The Spot script takes variables from differents CIs in order to fill the data that will be sent to the API.

* SEED:
    - application: "SEED_APP_NAME",
    - service: "SEED_SERVICE_NAME",
    - environment: "SEED_STAGE_NAME",
    - version: "SEED_BUILD_ID",
* CircleCI:
    - service: "CIRCLE_PROJECT_REPONAME",
    - environment: "CIRCLE_BRANCH",
    - version: "CIRCLE_BUILD_NUM",
    - repoUrl: "CIRCLE_REPOSITORY_URL"
* Netlify:
    - url: "URL",
    - application: "SITE_NAME",
    - environment: "CONTEXT",
    - version: "BUILD_ID",
* Amplify:
    - environment: "AWS_BRANCH",
    - version: "AWS_JOB_ID"


## Allowed args parameters
You can still customize parameters calling them on the npx execution.

e.g: 
```
npx @kelsus/api-spot-package --service=api-spot-package
```
```
--id
--eventType
--createdAt
--commitId
--commitBranch
--commitMessage
--commitDate
--application
--service
--status
--environment
--version
--serviceType
--runtime
--runtimeVersion
--serviceUrl
--repoUrl
--lastDeploy
--changelog
--organization
```

## Alternative Env Variables
In case that you want to overwrite data, Spot will look for these Env Variables
```
- application = "APP_NAME"
- service = "SERVICE_NAME"
- environment = "ENVIRONMENT_NAME"
- status = "BUILD_STATUS"
- version = "VERSION"
- url = "APP_URL"
```

## Call the function
- ```npm install @kelsus/api-spot-package```
- When configuring the installation on the CI, it is recomended to set the flag `engine-strict true` so it will be installed only when Node engine version is supported. Ref: https://docs.npmjs.com/cli/v9/using-npm/config#engine-strict
- You can invoke the main() function with require('@kelsus/api-spot-package') and pass the parameters through the function.
- E.g:
```
// Require package
const SPOT = require('@kelsus/api-spot-package');

//Call the function an pass parameters as an object
SPOT.main({application: 'api-spot-package', env: 'develop'});
```


## Request body
```
activity: 
    {
        id,
        service,
        eventType,
        createdAt,
        commitId,
        commitMessage,
        commitDate,
        commitBranch,
        application,
        status,
        environment,
        version,
        serviceType,
        runtime,
        runtimeVersion,
        serviceUrl,
        repoUrl,
        lastDeploy,
        changelog,
        organization,
    }
```


## Publish a new version
- Publishing is automated via CircleCI as well as versioning: everytime a commit is merged into `main` branch auto version bump will be executed (patch semver bump).

- After pushing a new version, you can check the changelog on https://spot.kelsus.com/

## CircleCI Environment Variables
Circle is used as the Continuous Integration service: Running test, build, publish on npm and notifying to spot: https://app.circleci.com/pipelines/github/Kelsus/api-spot-package

```
NPM_TOKEN: NPM personal access token.
SSH_KEY_FINGERPRINT: fingerprint generated with github ssh deploy key
SPOT_API_KEY: used to notify spot
```