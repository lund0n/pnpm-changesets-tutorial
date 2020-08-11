# Examples for PNPM and Changesets Tooling

## Quick Start

Start the private registry for the demo:

```bash
docker run -it --rm --name verdaccio -p 4873:4873 verdaccio/verdaccio
```

Install `pnpm`:

```bash
npm i -g pnpm
```

## Simple Module

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

## About Changesets

Changesets are a way to record a summary of what changes on a collection of files are supposed to do, as well as the potential impact on the project.

Add changesets to the project

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
