# Contributing

By participating to this project, you agree to abide our [code of conduct](https://github.com/goreleaser/goreleaser-azure-devops-extension/blob/master/CODE_OF_CONDUCT.md).

## Setup your machine

`goreleaser-azure-devops-extension` is written in [Typescript](https://www.typescriptlang.org/).

Prerequisites:

You must have the following permission and installations.

* You're an organization Owner. If you don't have an organization, you can [create an organization for free](https://app.vsaex.visualstudio.com/profile/account).
* Install [Node.js](https://nodejs.org).
* Install the extension packaging tool (TFX) by running `npm install -g tfx-cli` from a command prompt.


Clone `goreleaser-azure-devops-extension` in your workplace of choice:

```sh
git clone git@github.com:goreleaser/goreleaser-azure-devops-extension.git
```

`cd` into the directory and install the dependencies:

```sh
npm install
```


## Test your change

You can create a branch for your changes and try to build from the source as you go:

```sh
npm run compile 
```

## Create a commit

Commit messages should be well formatted, and to make that "standardized", we
are using Conventional Commits.

You can follow the documentation on
[their website](https://www.conventionalcommits.org).

## Submit a pull request

Push your branch to your `goreleaser` fork and open a pull request against the
master branch.

## Financial contributions

We also welcome financial contributions in full transparency on our [open collective](https://opencollective.com/goreleaser).
Anyone can file an expense. If the expense makes sense for the development of the community, it will be "merged" in the ledger of our open collective by the core contributors and the person who filed the expense will be reimbursed.
