# Kelsus Spot API Package

## Description
Kelsus Spot API


### Installing

```
npm install -g @kelsus/api-spot-package
```
### Execute
Run the npx command with args to execute the post deploy script.

```
npx spot-package --environment=dev --application=deploy-spot-webapp --type=UI --repository=https://github.com/Kelsus/deploy-spot-webapp --url=https://develop-spot.kelsus.com --version=0.0.1
```
You can invoke the main() function with require('@kelsus/api-spot-package') and pass the parameters through the function.

## Environment Variables
Make sure that process.env.SPOT_API_KEY is defined.
## Push a new version
Publish is automated via CircleCI, so please if you want to add a new version of it, merge it on master branch.
After pushing a new version, update the Version History below.
## CircleCI Environment Variables
```
NPM_TOKEN: GitHub personal access token.
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