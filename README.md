# Kelsus Spot API Package

## Description
Post deploy script for [Kelsus Spot](https://spot.kelsus.com/)

[Spot Repository](https://github.com/Kelsus/deploy-spot-webapp)
- Once the script is executed, it will send a POST request to the [Spot API](https://github.com/Kelsus/deploy-spot-api)
- This request will generate a new service/application with an activity.
- On the app you will be able to assign the service to a client, and on each deploy it will trigger the script again, generatin a new activity.
- The script supports differents environments for the same app.
# Installing

```
npm install -g @kelsus/api-spot-package
```
## Execute
Run the npx command with args to execute the post deploy script.

```
npx spot-package --environment=dev --application=deploy-spot-webapp --type=UI --repository=https://github.com/Kelsus/deploy-spot-webapp --url=https://develop-spot.kelsus.com --version=0.0.1
```
You can invoke the main() function with require('@kelsus/api-spot-package') and pass the parameters through the function.
- The script will print in console if the request was succesful or failed.


## Attributes
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
    }
```

# Environment Variables
Make sure that SPOT_API_KEY is available on build with a valid value.
```
SPOT_API_KEY
```
# Push a new version
- Publish is automated via CircleCI, so please if you want to add a new version of it, merge it on master branch and change the version.

- After pushing a new version, update the Version History below.
## CircleCI Environment Variables
```
NPM_TOKEN: NPM personal access token.
```
## Version History
* 1.0.0
    * Initial Release

* 1.0.1
    * Spot API Key
* 1.0.2
    * NPX Executable
* 1.0.3
    * NPX Run process arguments
* 1.0.4
    * Activity POST - Git repository data
* 1.0.5
* 1.0.6
    * API Key and Parameters fix