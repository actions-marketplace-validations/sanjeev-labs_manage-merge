const core = require("@actions/core");
const { octoKit } = require("@octokit/action");
const github = require('@actions/github')

async function processPullRequests() {

    const octokit = new octoKit();
    const repo = github.context.repo;
    const owner = github.context.owner;
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
        if(!IsItMergeDate(body)) continue;

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
   const stringLocale = new Date().toLocaleString("en-US", { timeZone: process.env.INPUT_TIME_ZONE });
   const currentDate = new Date(stringLocale);
   return (mergeOn < currentDate);
}

processPullRequests();