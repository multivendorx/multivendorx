
# MultiVendorX Monorepo

<img src="https://multivendorx.com/wp-content/themes/multivendorx/assets/frontend/img/multivendorx-header-logo.svg" alt="MultiVendorX" width="200" height="auto" />

Welcome to the MultiVendorX Monorepo on GitHub. Here you can find all of the plugins, packages, and tools used in the development of the core MultiVendorX plugin as well as MultiVendorX extensions. You can browse the source, look at open issues, contribute code, and keep tracking of ongoing development.

We recommend all developers to follow the [MultiVendorX development blog](https://multivendorx.com/get-help/code-snippet/) to stay up to date about everything happening in the project. You can also [follow @DevelopWC](https://twitter.com/{ourhandle}) on Twitter for the latest development updates.

## Getting Started

To get up and running within the MultiVendorX Monorepo, you will need to make sure that you have installed all of the prerequisites.

### Prerequisites

-   [NVM](https://github.com/nvm-sh/nvm#installing-and-updating): While you can always install Node through other means, we recommend using NVM to ensure you're aligned with the version used by our development teams.
-   [PNPM](https://pnpm.io/installation): Our repository utilizes PNPM to manage project dependencies and run various scripts involved in building and testing projects.
-   [PHP 8.0+](https://www.php.net/manual/en/install.php): MultiVendorX Core currently features a minimum PHP version of 8.0. It is also needed to run Composer and various project build scripts.
-   [Composer](https://getcomposer.org/doc/00-intro.md): We use Composer to manage all of the dependencies for PHP packages and plugins.
-   [Docker](https://docs.docker.com/engine/install/): We use Docker for runnig wp-env to manage all of plugins for testing

Note: Recomended System is Linux system

Once you've installed all of the prerequisites, the following will prepare all of the build outputs necessary for development:
# Starting the project
```bash
    # For downloading node_modules in every workspage ( where package.json is present )
    pnpm i or pnpm install

    # Build all the project present in monorepo
    pnpm build or pnpm run build
```
- Note : For Better Understand see `DEVELOPER_DOC.md` in this monorepo

## Repository Structure

Each plugin, packages has its own `package.json` file containing project-specific dependencies and scripts. Most projects also contain a `README.md` file with any project-specific setup instructions and documentation.

-   [**Plugins**](plugins): Our repository contains plugins that relate to or otherwise aid in the development of MultiVendorX.
-   [**Packages**](packages): Contained within the packages directory are all of the [PHP](packages/php) and [JavaScript](packages/js) provided for the community. These are internal dependencies .
-   [**Tools**](tools): We also have a growing number of tools within our repository. Many of these are intended to be utilities and scripts for use in the monorepo, but, this directory may also contain external tools.

## Support
