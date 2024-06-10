# dev notes

The token used to publish the extension expires every 1 year.

To make a new one, go to https://dev.azure.com/caarlos0/
Then create a new full access token and make it valid for 1 year (which is the
max time).
Then set it in GH secrets:

```sh
gh secret set AZURE_DEVOPS_EXT_PAT_DEV -b abcde...
```
