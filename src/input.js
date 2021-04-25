const core = require("@actions/core");
const { Octokit } = require("@octokit/action");
const github = require('@actions/github')

async function processPullRequests() {

    const octokit = new Octokit();
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
    const mergeMethod = core.getInput("merge_method");

    const openedRequests = await octokit.paginate(
    "GET /repos/:owner/:repo/pulls",
    {
      owner,
      repo,
      state: "open",
    },
    (response) => {
      return response.data;
    }
  );

  if (openedRequests.length === 0) {
    return;
  }

  for await (const currentRequest of openedRequests) {
        let body = currentRequest.body;
        core.info(`${body}`);

        if(core.getInput("target_branch") != currentRequest.base_ref) {
          core.info(`Skipping, branches are different ${currentRequest.base_ref}`);
          continue;
        } 

        if(!IsItMergeDate(body))
        {
          core.info(`Date did not match`);
          continue;
        } 

        core.info(`${currentRequest.labels}`);

        await octokit.pulls.merge({
          owner,
          repo,
          pull_number: currentRequest.number,
          merge_method: mergeMethod,
        });
    }

}


function IsItMergeDate(body)
{
   const mergeOn = new Date(body.match(/(^|\n)\/mergeon (.*)/).pop());
   const stringLocale = new Date().toLocaleString("en-US", { timeZone: core.getInput("time_zone") });
   const currentDate = new Date(stringLocale);
   return (mergeOn < currentDate);
}

processPullRequests();