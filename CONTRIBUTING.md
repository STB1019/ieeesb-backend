# How to contribute?

To contribute simply create a branch from `main` with a speaking name that describes the feature you're adding or the issue you're solving. Now you can start submitting commits to that branch and working on your code.

If you're working on an issue please reference it's number in the PR and assign yourself to it.

Once the code is working and compiles please open a Pull Request and wait until all the checks are passed. Even if you can merge to the `main` branch don't do it unless all checks have passed.

# Commit Style

The project uses semantic versioning and semantic releases. Whenever something gets merged into `main` it triggers a release pipeline that checks all the commits inside the PR. This means that **all commits should follow [the conventional commits specification](https://www.conventionalcommits.org/en/v1.0.0/)**. We have a linter that will reject all commits not following the conventions.

# Advice on pull requests

Pull requests are the easiest way to contribute changes to git repos at Github.
They are the preferred contribution method, as they offer a nice way for
commenting and amending the proposed changes.

- You need a local "fork" of the Github repo.

- Use a "feature branch" for your changes. That separates the changes in the
  pull request from your other changes and makes it easy to edit/amend commits
  in the pull request. Workflow using "feature_x" as the example:
  - Update your local git fork to the tip (of the master, usually)
  - Create the feature branch with `git checkout -b feature_x`
  - Edit changes and commit them locally
  - Push them to your Github fork by `git push -u origin feature_x`. That
    creates the "feature_x" branch at your Github fork and sets it as the
    remote of this branch
  - When you now visit Github, you should see a proposal to create a pull
    request

- If you later need to add new commits to the pull request, you can simply
  commit the changes to the local branch and then use `git push` to
  automatically update the pull request.

- If you need to change something in the existing pull request (e.g. to add a
  missing signed-off-by line to the commit message), you can use `git push -f`
  to overwrite the original commits. That is easy and safe when using a feature
  branch. Example workflow:
  - Checkout the feature branch by `git checkout feature_x`
  - Edit changes and commit them locally. If you are just updating the commit
    message in the last commit, you can use `git commit --amend` to do that
  - If you added several new commits or made other changes that require
    cleaning up, you can use `git rebase -i HEAD~X` (X = number of commits to
    edit) to possibly squash some commits
  - Push the changed commits to Github with `git push -f` to overwrite the
    original commits in the "feature_x" branch with the new ones. The pull
    request gets automatically updated

## If you have commit access

- Do NOT use git push --force.
- Do NOT commit to other maintainer's packages without their consent.
- Use Pull Requests if you are unsure and to suggest changes to other
  maintainers.
