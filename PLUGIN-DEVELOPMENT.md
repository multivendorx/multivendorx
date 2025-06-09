# This is documentation for developing a plugin in this multivendorx monorepo

### Prerequisites

-   [NVM](https://github.com/nvm-sh/nvm#installing-and-updating): While you can always install Node through other means, we recommend using NVM to ensure you're aligned with the version used by our development teams.
-   [PNPM](https://pnpm.io/installation): Our repository utilizes PNPM to manage project dependencies and run various scripts involved in building and testing projects.
-   [PHP 8.0+](https://www.php.net/manual/en/install.php): MultiVendorX Core currently features a minimum PHP version of 8.0. It is also needed to run Composer and various project build scripts.
-   [Composer](https://getcomposer.org/doc/00-intro.md): We use Composer to manage all of the dependencies for PHP packages and plugins.
-   [Docker](https://docs.docker.com/engine/install/): We use Docker for runnig wp-env to manage all of plugins for testing

Note: Recomended System is Linux system

## Step 1 : Project location

If you want to build a wordpress plugin then start code into the [**plugins**](plugins) folder .
>```bash
>cd plugins
>```
And if you want to build any package library then start development in `js` or `php` then open [**packages**](packages) folder .

- Note : For js package development go to [**packages/js**](packages/js) folder .
>```bash
>cd packages/js
>```

- Note : For php packages use [**packages/php**](packages/php) folder .
>```bash
>cd packages/php
>```

## Step 2 : Project Initialization
For Starting a project create a project folder .
>```bash
>mkdir custom-plugin-name
>```
Next
>```bash
>cd custom-plugin-name
>```
Initialize Project with pnpm
>```bash
>pnpm init
>```

## Step 3 : Add Scripts into `package.json`
Go to `package.json` and paste this scripts into the scripts section .
>```json
>"scripts": {
>       "build": "echo \"${npm_package_name}\" && pnpm --if-present --workspace-concurrency=Infinity --stream --filter \"${npm_package_name}\" \"/^build:project:.*$/\"",
>        "build:zip": "pnpm install && pnpm run readme && pnpm --if-present \"/^build:project:.*$/\" && pnpm run makepot && node bin/release.mjs",
>        "build:project": "pnpm --if-present \"/^build:project:.*$/\"",
>        "build:project:bundle": "wireit",
>        "build:project:translation:domains": "wireit",
>        "watch:build": "pnpm --if-present run \"/>^watch:build:project:.*$/\"",
>        "watch:build:project:bandle": "wireit",
>        "lint": "pnpm --if-present \"/^lint:lang:.*$/\"",
>        "lint:fix": "pnpm --if-present \"/^lint:fix:.*$/\"",
>        "lint:lang:js": "eslint . --ext .js,.jsx,.ts,.tsx",
>        "lint:lang:php": "composer run-script phpcs",
>        "lint:lang:css": "wp-scripts lint-style",
>        "lint:fix:css": "stylelint '**/*.{css,scss}' --fix",
>        "lint:fix:js": "wp-scripts format",
>        "lint:fix:php": "composer run-script phpfix",
>        "test": "pnpm test:unit",
>        "test:unit": "pnpm test:php",
>        "test:php": "./vendor/bin/phpunit -c ./phpunit.xml.>dist",
>        "env:start": "pnpm wp-env start && pnpm run >env:start:database",
>        "env:start:database": "node bin/create-docker-compose.>mjs && docker compose up -d",
>        "env:dev": "pnpm wp-env start --update && pnpm run >env:start:database && pnpm --if-present --filter >storybook run watch:build:storybook",
>        "env:stop": "pnpm wp-env stop && docker compose down",
>        "env:clean": "pnpm wp-env clean",
>        "env:restart": "pnpm wp-env restart",
>        "env:destroy": "pnpm wp-env destroy && rimraf >docker-compose.yml",
>        "readme": "wp-readme-to-md",
>        "composer": "composer dump-autoload && composer >update",
>        "preinstall": "npx only-allow pnpm",
>        "postinstall": "rimraf -g vendor release .wireit >composer.lock languages && composer install",
>        "clean": "node bin/clean-files.mjs",
>        "minify": "node bin/minify.mjs",
>        "changelog": "composer install --quiet && composer >exec -- changelogger",
>        "makepot": "wp i18n make-pot --domain='notifima' >--include='assets/js,classes,templates,config.php,>product_stock_alert.php' . --headers='>{\"Report-Msgid-Bugs-To\":\"https://notifima.com/>contact/\"}' --file-comment=\"Copyright (c) $(date >+'%Y') Notifima Inc. All Rights Reserved.\" languages/>notifima.pot"
>    },
>```

## Step 3 : Add Files
### 1. Folder Structure for your project

custom-plugin-name/

├── assets/

│   └── js/               [ normal logics are written here ]

│   └── styles/           [ normal styles are written here ]

├── bin/                  [ extra works done by js ]

├── classes/              [ Php logics are written here ]

├── log/                  [ Conrains log files ]

├── src/                  [ React/TS source code ]

│   └── assets/           [ React assets are present here like images ]

│   └── block/            [ Gutenbarg blogs are written here ]

│   └── components/         [ react components and their styles are written here ]

│   └── contexts/         [ contexts file copied from another project ]

│   └── services/         [ react services are loaded here ]

│   └── stories/          [ write components stories here ]

│   └── index.tsx         [ react entry point ]

├── templates/            [ php templates are written here ]

├── tests/                [ automation tests are witten here ]

│   └── php/              [ php unit tests folder ]

│   │   └── unit-test-files.php              [ php unit tests are written like this ]

│   └── bootstrap.php              [ this is needed for unit testing ]

│   └── phpunit-wp-config.php              [ this is needed for unit testing database connection ]

├── my-custom-plugin.php    [ Main plugin file ]

├── config.php              [ global configuration for project in php ]

├── composer.json           [ php manager ]

├── package.json 

├── tsconfig.json

├── webpack.config.js     # or vite.config.js

└── .gitignore


### 2. Add `composer.json` file in your project

- Initialize composer
>```bash
>composer init \
>  --name="multivendorx/custom-plugin-name[change it]" \
>  --description="Write description for your project .["chage it"]" \
>  --author="MultiVendorX <contact@multivendorx.com>" \
>  --type="wordpress-plugin" \
>  --homepage="https://custom-plugin-name.com[change it]" \
>  --stability="dev" \
>  --license="GPL-2.0-or-later"
>```
- add autoloader manually in your `composer.json` ( for reference explore any existing composer.json file)

>```json
>"autoload": {
>        "psr-4": {
>            "Cunstom-plugin-name\\": "classes/"
>        }
>    },
>```

- setup composer
>```bash
>composer dump-autoload
>```

- add latest php version
>```bash
>composer config platform.php 8.0
>```

- set php required for run this project
>```bash
>composer require php
>```

- PHP_CodeSniffer rules for checking if your PHP code follows the official WordPress coding standards . ( eg. indentation, naming conventions, escaping, etc.)
    - first download dependencies
>```bash
>composer require --dev wp-coding-standards/wpcs:dev-develop
>```

>```bash
>composer require --dev dealerdirect/phpcodesniffer-composer-installer:^0.7.2
>```

>```bash
>composer require --dev phpcompatibility/phpcompatibility
>```

- add script for runnig PHP_CondeSniffer ( add this into the composer.json scripts)
>```json
>"phpcs": [
>          "vendor/bin/phpcs -p -s"
>      ]
>"phpfix": [
>    "vendor/bin/phpcbf -p"
>  ]
>```
Note : `phpcs` run for checking php standerds and `phpfix` for beautify php code .


- Setup for unit test
    - download dependencies

>```bash
>composer require --dev phpunit/phpunit
>```
Note : The main testing framework (PHPUnit) for writing unit tests.

>```bash
>composer require --dev wp-phpunit/wp-phpunit
>```
Note : Makes it easy to test WordPress-specific code (like plugins) using PHPUnit.

>```bash
>composer require --dev yoast/phpunit-polyfills
>```
Note : Provides polyfills for PHPUnit features across multiple versions.

>```bash
>composer require --dev brain/monkey
>```
Note : A powerful mocking framework for WordPress functions (which are normally not mockable).

- install wp unit test installer run ( it create a install-wp-tests.sh file into bin folder )
>```bash
>curl -o ./bin/install-wp-tests.sh https://raw.githubusercontent.com/wp-cli/scaffold-command/master/templates/install-wp-tests.sh
>```

- Run unit tests
>```bash
>bash bin/install-wp-tests.sh wordpress_test root '' localhost latest
>```

>```bash
>./vendor/bin/phpunit
>```
