const core = require("@actions/core");
const { Octokit } = require("@octokit/action");

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

        if(core.getInput("target_branch") != currentRequest.base.ref) {
          core.info(`Skipping, branches are different ${currentRequest.base.ref}`);
          continue;
        } 

        if (currentRequest.labels !== undefined)
        {
          const labels = getLabels(currentRequest);
          if (labels.length == 0 )
          {
             core.info(`Skipping, label not found `);
             continue;
          }
        }

        if(!IsItMergeDate(body))
        {
          core.info(`Date did not match`);
          continue;
        } 

        core.info(`Request found`);

        await octokit.pulls.merge({
          owner,
          repo,
          pull_number: currentRequest.number,
          merge_method: mergeMethod,
        });
    }

}

function getLabels(currentRequest)
{
  const labelName = core.getInput("label_name");
  const labels = pullRequests.labels.filter((label) => {
    return (label.name == labelName);
  });
  return labels;
}

function IsItMergeDate(body)
{
   const mergeOn = new Date(body.match(/(^|\n)\/mergeon (.*)/).pop());
   const stringLocale = new Date().toLocaleString("en-US", { timeZone: core.getInput("time_zone") });
   const currentDate = new Date(stringLocale);
   return (mergeOn < currentDate);
}

processPullRequests();
