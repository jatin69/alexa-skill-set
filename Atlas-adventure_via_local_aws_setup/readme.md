# Local setup of aws environment


### This env is used for dev of Atlas Adventure


### publish-to-Lambda automation 

- [Install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/installing.html). Verify using `aws --version`
- [Configure](https://developer.amazon.com/blogs/post/Tx1UE9W1NQ0GYII/publishing-your-skill-code-to-lambda-via-the-command-line-interface) and verify using `aws lambda list-functions`. This should list your available lambda functions.
- write `publish.bat` automation script
- test configuration steps on a hello world skill. The skill should be published and be working fine in testing.

## Setting up a skill

- `mkdir <skill-name> && cd <skill-name>`
- `git init` for the skill if you wanna version control it. Don't forget to add node_modules/ to .gitignore file.
- `subl publish.bat`
- `mkdir lambda && cd lambda` 
- `npm init -y`
- `npm install --save alexa-sdk`
- `npm install --save request`
- `subl index.js`


## future scope

- Setup a new custom “publish” button within your favorite text editor or IDE that calls your script.
- Check in and manage your local code with a source code control service such as git or GitHub.
- Add your script to a Continuous Integration workflow.  For example, a Jenkins job that checks code out of GitHub, uses publish.sh to deploy to a test lambda function, and runs a suite of unit tests.
- Review the excellent series of blog posts by [Big Nerd Ranch](https://developer.amazon.com/blogs/post/Tx3DV6ANE5HTG9H/Big-Nerd-Ranch-Series-Developing-Alexa-Skills-Locally-with-Node-js-Setting-Up-Yo) on setting up a robust local development environment, complete with a Node.js test server and test framework.

## Big nerd Ranch Series

[Developing Alexa Skills Locally with Node.js: Setting Up Your Local Environment](https://developer.amazon.com/blogs/post/Tx3DV6ANE5HTG9H/Big-Nerd-Ranch-Series-Developing-Alexa-Skills-Locally-with-Node-js-Setting-Up-Yo)
