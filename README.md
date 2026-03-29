![ado_goreleaser](images/title.png)

# GoReleaser: Azure DevOps Extension
[![Release](https://img.shields.io/github/release/goreleaser/goreleaser-azure-devops-extension.svg?style=for-the-badge)](https://github.com/goreleaser/goreleaser-azure-devops-extension/releases/latest)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=for-the-badge)](LICENSE)
[![Build status](https://img.shields.io/github/actions/workflow/status/goreleaser/goreleaser-azure-devops-extension/ci.yaml?style=for-the-badge&branch=main)](https://github.com/goreleaser/goreleaser-azure-devops-extension/actions?workflow=build)

![Azure DevOps](https://img.shields.io/badge/azure_devops-0078D7?style=for-the-badge&logo=azuredevops&logoColor=white)

[![Join Discord](https://img.shields.io/badge/Join_our_Discord_server-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/RGEBtg8vQ6)
[![x.com](https://img.shields.io/badge/-@goreleaser-000000?style=for-the-badge&logo=X&logoColor=ffffff)](https://x.com/goreleaser)

[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/dirien/minectl/badge?style=for-the-badge)](https://api.securityscorecards.dev/projects/github.com/goreleaser/goreleaser-azure-devops-extension)

## Overview

This task allows you to easily run GoReleaser within your Azure Pipeline jobs.

## Howto

See the blog article [Use GoReleaser With Azure DevOps](https://blog.goreleaser.com/use-goreleaser-with-azure-devops-c2212d3996ca)
for a detailed explanation of how to use this extension in your Azure Pipeline jobs.

## QuickStart

![quickstart_1](images/ado.png)

## Customizing

Add the plugin via Azure Pipeline Editor

![quickstart_2](images/ado_2.png)

or directly into your `azure-pipeline.yaml`

![quickstart_3](images/ado_3.png)

````yaml
- task: goreleaser@0
  inputs:
    version: 'latest'
    distribution: 'goreleaser'
    args: ''
    workdir: '$(Build.SourcesDirectory)'
````

### Inputs

Following inputs can be used

| Name           | Type   | Default                     | Description                                                      |
|----------------|--------|-----------------------------|------------------------------------------------------------------|
| `distribution` | String | `goreleaser`                | GoReleaser distribution, either `goreleaser` or `goreleaser-pro` |
| `version`      | String | `latest`                    | GoReleaser version (see below)                                   |
| `args`         | String |                             | Arguments to pass to GoReleaser                                  |
| `workdir`      | String | `$(Build.SourcesDirectory)` | Working directory (below repository root)                        |
| `installOnly`  | Bool   | `false`                     | Just install GoReleaser                                          |

### Version input

The `version` input accepts:

- `latest` (default) — grabs the most recent release
- An exact version like `v2.6.1`
- A semver range like `~> 2.6`, which resolves to the highest matching release (e.g. the latest `2.6.x` patch)

For GoReleaser Pro, append `-pro` to the version (e.g. `v2.6.1-pro`).

#### Examples

```yaml
# Latest version
- task: goreleaser@0
  inputs:
    version: 'latest'
    distribution: 'goreleaser'
    args: 'release --clean'

# Exact version
- task: goreleaser@0
  inputs:
    version: 'v2.6.1'
    distribution: 'goreleaser'
    args: 'release --clean'

# Semver range — gets latest 2.6.x
- task: goreleaser@0
  inputs:
    version: '~> 2.6'
    distribution: 'goreleaser'
    args: 'release --clean'

# GoReleaser Pro
- task: goreleaser@0
  inputs:
    version: 'v2.6.1-pro'
    distribution: 'goreleaser-pro'
    args: 'release --clean'
```

### Environment variables

Following environment variables can be used, as environment variable.

| Name             | Description                                                                                                                                            |
|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| `GITHUB_TOKEN`   | [GITHUB_TOKEN](https://help.github.com/en/actions/configuring-and-managing-workflows/authenticating-with-the-github_token) for e.g. `brew` or `gofish` |
| `GORELEASER_KEY` | Your [GoReleaser Pro](https://goreleaser.com/pro) License Key, in case you are using the `goreleaser-pro` distribution                                 |

## Limitation

I think, you should either disable the [release step](https://goreleaser.com/customization/release/). Or create a "
dummy" repo in GitHub, so you can still use your own `homebrew tap` or `gofish` repo.

GoReleaser is not supporting Azure Artifacts currently.

You need to use `Publish Pipeline Artifacts` to publish the artifact inside Azure DevOps.

## Tutorials 

- [Use GoReleaser With Azure DevOps](https://blog.goreleaser.com/use-goreleaser-with-azure-devops-c2212d3996ca)
- [Releasing multi-platform container images with GoReleaser in Azure DevOps
  ](https://blog.goreleaser.com/releasing-multi-platform-container-images-with-goreleaser-in-azure-devops-d8916df4250a)

## Documentation

Please refer to [https://goreleaser.com/intro/](https://goreleaser.com/intro/) for more documentation on using
GoReleaser.

# Links

- Follow the progress on the [GitHub repository](https://github.com/goreleaser/goreleaser)
- Follow [@goreleaser](https://twitter.com/goreleaser) on Twitter for updates
- Join our [Discord server](https://discord.gg/RGEBtg8vQ6)
- Ask questions on [StackOverflow](https://stackoverflow.com/questions/tagged/goreleaser)
- For questions, support and general discussion, please use
  [GitHub Discussions](https://github.com/goreleaser/goreleaser/discussions);
- [Contributing Guidelines](https://github.com/goreleaser/goreleaser/blob/master/CONTRIBUTING.md)

# License

MIT

see [LICENSE](https://github.com/goreleaser/goreleaser-azure-devops-extension/blob/master/LICENSE) for details.
