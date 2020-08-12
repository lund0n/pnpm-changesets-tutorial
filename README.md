# Examples for PNPM and Changesets Tooling

We'll be using three tools for this tutorial:

- pnpm: an alternative npm client - [site][pnpm]
- changesets: a way to manage versioning and changelogs - [site][changesets-cli]
- Verdaccio: a private npm registry - [site][verdaccio-home]

## Starting the tutorial

Start the private registry for the demo:

```bash
docker run -it --rm --name verdaccio -p 4873:4873 verdaccio/verdaccio
```

We're using a private npm registry called [Verdaccio][verdaccio-home]. More information can be found [here][verdaccio-docs].

Add a user for publishing modules:

```bash
npm adduser --registry http://localhost:4873
```

Install `pnpm`:

```bash
npm i -g pnpm
```

## Simple Module

Switch the "simple" module directory:

```bash
cd simple
```

Adding a dependency:

```bash
pnpm add lodash
```

This should create a `pnpm-lock.yaml` file for the project. This is similar to npm's `package-lock.json` and yarn's `yarn.lock` file.

Adding a dev dependency:

```bash
pnpm add --save-dev prettier
```

Looking at the `node_modules` directory, you will see:

- The `.bin` directory (for executables, like `prettier`, `webpack`, or `eslint`)
- A somewhat flat directory of modules the project depends upon. Observe that the references to the packages are symbolic links. There is only one copy of each version of your module stored. They are stored in the pnpm store.

Similar to npm's `npx` command, `pnpm` provides the `pnpx` command. Let's use it to run prettier:

```bash
pnpx prettier --write \"**/*\"
```

### Advantages of `pnpm`

- Installs modules least as fast as yarn, and faster than npm.
- Monorepo friendly, without using an additional tool (like Lerna).
- Disk friendly. Only one copy of each installed version of each module will exist on disk (uses links to tie everything to the correct locations).
- `pnpmfile.js`, a mechanism for hooking into the install process.

### About Changesets

Changesets are a way to record a summary of what changes on a collection of files are supposed to do, as well as the potential impact on the project. Although there is a tool, they also provide a detailed explanation about how they arrived on this particular solution(see the details [here][changesets-details]). I imagine it could be implemented for other ecosystems. They can be used to version a release of your project, as well as to automate the changelog. It has some advantages over `standard-version` and "Conventional Commits", which is what I have used previously.

We'll talk about the advantages in a bit, but let's first see how to work with changesets.

Add changesets to the project:

```bash
pnpm add @changesets/cli
```

Initialize changesets for this project:

```bash
pnpx changeset init
```

The command will create a `.changeset` directory, which you'll want to include in your repository, along with a couple of files:

- `config.json`: how changesets should be applied (the default is usually good).
- `README.md`: information about the `.changeset` directory, and what it's for.

Now that we have changsets installed in the project, let's add a changeset note to accompany our changes:

```bash
pnpx changeset
```

Select the impact level of the changes (patch, minor, major), and enter a brief description, and a changeset file will be created. Let's take a look at the file that was created. The file is a markdown file with a randomly generated name.

```md
---
"@bridge/simple": patch
---

More changes
```

Since this is Markdown, you can edit this file after it's created. I usually do this to update the patchset summary, added a "breaking changes" section, etc.

You should commit the changeset with the changed code.

Let's create another changeset, one that implements the method:

```js
// index.js
const lodash = require("lodash");

module.exports = function (value) {
  return lodash.camelCase(value);
};
```

```bash
git add .
pnpx changeset
```

Let's make the new changeset a major change this time. Commit the changes (and changeset).

Now, suppose we want to cut a release:

```bash
pnpx changeset version
```

This will:

- Create (or update) the changelog, using the contents of each changeset.
- Delete the changeset files.
- Bump the package version, using the total impact of all changesets.

Commit these changes:

```bash
git add .
git commit -m "chore: release"
```

Then, publish the library:

```bash
pnpm publish
```

Open the Verdaccio UI (http://localhost:4873/) to view your module.

For future releases, the flow is basically the same:

- Make your code changes, adding a changeset to accompany each group of changes.
- Cut a version using `pnpx changeset version`
- Once everything is merged, `pnpm publish` to publish the new module.

_NOTE_: Regardless of whether you work on code that is published as a npm module or not should not matter. Using a changeset to help create a versioned changelog of what you've changed in the codebase can be valuable. Just omit the last step in the flow.

### Advantages of changesets over other solutions:

- No imposed commit message formatting conventions.
- Requires one dependency (`@changesets/cli`).
- Works flawlessly with monorepos (more on this later).
- No imposed workflow.
- Changeset files can be updated, tweaked, etc. anymore before a version.

## Working with Monorepos

As I mentioned, pnpm works great with monorepos. If you're unfamiliar with the term, a monorepo contains the code for several modules within a single git repository. While there are benefits when using a monorepo to organize closely-related packages, other tooling that I have used has been cumbersome, slow, or felt like bolt-on functionality. pnpm was built with monorepos in mind. Let's a look at the `monorepo` directory to see how a monorepo is organized.

There are a few things that you will notice about the monorepo:

- The root has a `package.json`, even though it doesn't represent a single module. This `package.json` exists primarily to host scripts that you would like to run at the root level, as well as dependencies that you would like to use on the entire repository (like `prettier`, `eslint`, `husky`, `lint-staged`, and `changesets`)
- The root `package.json` file is marked `"private": true`. The root package should never be published.
- There is a new file called `pnpm-workspace.yaml`. It contains configuration for what's called a "workspace". A workspace is the collection of one or more projects within the monorepo. We can configure where to find the projects that comprise the workspace. I have indicated that all directories within the `packages/` directory will be treated as projects. You can use whatever directory structure you would prefer, even specifying paths to include and exclude (much like a `.gitignore`-style file).

Let's run `install` and see what we get:

```bash
cd monorepo
pnpm install
```

What do we end up with?

- a single `pnpm-lock.yaml` file for the entire monorepo. Nice!
- `node_modules` directories under each project directory. Notice that, like in the simple directory, the `node_modules` are symlinked to a shared, single version in the pnpm store.

Notice also the results reported from pnpm (something similar to this):

```bash
➜ pnpm install
Scope: all 2 workspace projects
Packages: +762
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Packages are hard linked from the content-addressable store to the virtual store.
  Content-addressable store is at: /Users/jrlund/.pnpm-store/v3
  Virtual store is at:             node_modules/.pnpm
Resolving: total 762, reused 664, downloaded 98, done

devDependencies:
+ @changesets/cli 2.10.0
+ babel-eslint 10.1.0
+ eslint 7.6.0
+ eslint-config-prettier 6.11.0
+ eslint-plugin-import 2.22.0
+ eslint-plugin-prettier 3.1.4
+ prettier 2.0.5
```

It only had to download about 15% of the modules it needed. You'll find the more you work on projects using similar modules, like Prettier, ESlint, Babel, Webpack, or React, there's a likelihood that the module you require will already be in the pnpm store.

### Running scripts

Let's see some of the things that we can do:

- `pnpm run lint`: runs the root linting script.
- `pnpm run format`: formats the entire code base.

Now, let's try `pnpm test`, since we see that there are `test` scripts in each package. It fails.

It turns out that we need to add "recursive" to specify that we want to run a specific script inside of each project.

```bash
pnpm recursive run test
```

If we want to target a subset of projects, we can use the `--filter` parameter:

```bash
pnpm --filter @bridge/bridge-prettier-config run test
```

Note that it provides autocomplete support on the filter parameter.

You could also just navigate to the project directory and run `pnpm test` from there:

```bash
cd packages/prettier-config
pnpm test # also npm test works here
```

### Changeset differences

Since we just created this project, and have some modules to publish, let's create a changeset:

```
pnpx changeset
```

Notice that there's a difference here. It asks which packages we want to include in the changeset, and how to treat each one. The changeset also looks a little different:

```md
---
"@bridge/bridge-prettier-config": major
"@bridge/change-case": minor
---

Initial release of all packages.
```

It includes all package(s) that are part of the changeset. If you had a change that modified multiple projects, you could represent them in a single changeset.

Let's version and publish the changes (after commiting our last changes):

```bash
pnpx changeset version
```

You'll notice the following:

- It deleted any changeset files, as before.
- It correctly versioned each package in the changeset.
- It created a `CHANGELOG.md` file for each project. How convenient.

Let's commit the versions, then publish:

```bash
git add .
git commit -m "chore: release"
pnpm recursive publish
```

It will publish each of the modules that isn't already published.

### Adding dependencies

Let's implement the function in the `change-case` project:

```bash
pnpm --filter @bridge/change-case add lodash
```

It will add the dependency just to the `change-case` project.

Now, implement the function, something simple like:

```js
// packages/change-case/src/index.js
const lodash = require("lodash");

module.exports = function (val) {
  return lodash.camelCase(val);
};
```

Let's add one more changeset, then commit and version it:

```bash
pnpx changeset
```

_NOTE_: Usually, it knows which packages have changed. I think that it's a bug in doing all of the changesets locally.

```bash
git add .
git commit -m "feat: add change-case implementation"
pnpx changeset version
```

Notice that it only updated the packages that have been impacted by the current set of changesets.

Finally, let's commit the new version and publish it:

```bash
git add .
git commit -m "chore: release"
pnpm recursive publish
```

That's it! 🎉

[changesets-cli]: https://github.com/atlassian/changesets/blob/master/packages/cli/README.md
[changesets-details]: https://github.com/atlassian/changesets/blob/master/docs/detailed-explanation.md
[pnpm]: https://pnpm.js.org/en/
[verdaccio-home]: https://verdaccio.org/
[verdaccio-docs]: https://verdaccio.org/docs/en/what-is-verdaccio.html
