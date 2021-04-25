# manage-merge Action

> Merge pull request on given date and target branch

## How to Use

- Add any future date in pull request body in yyy-mm-dd format

```
/mergeon 2021-01-01

```

- Add yaml file in your .github/workflows like .github/workflows/manage-merge.yaml

```yml
- name: Manage Merge
on:
  pull_request:
    types:
      - opened
      - edited
  schedule:
    # https://crontab.guru/every-hour
    - cron: 0 * * * *

jobs:
  merge_schedule:
    runs-on: ubuntu-latest
    steps:
      - uses: sanjeev-labs/manage-merge@v1.0
        with:
          # Merge method, use one of possible values merge, squash or
          # rebase. Default is merge.
          merge_method: "merge"
          # Name here target branch. Default is main
          target_branch: "main"
          #  Time zone to use. Default is UTC.
          time_zone: "America/Los_Angeles"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
