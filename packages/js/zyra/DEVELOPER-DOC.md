# Developer Documentation

## 📦 Project Overview
`Zyra` is a scalable and customizable `React + TypeScript` UI component library built for faster wordpress plugin development. Designed with performance and flexibility in mind, Zyra provides a collection of reusable components, utility styles, and icon font support to accelerate frontend development across projects.

## 📁 Folder Structure
This section helps new developers understand the layout of the project. Each folder serves a specific purpose to ensure maintainability, scalability, and clarity.


| Folder           | Purpose                                                                 |
|------------------|-------------------------------------------------------------------------|
| `src/components/`| Houses individual component files. Each component has its `.tsx` .      |
| `src/styles/web` | Contains base SCSS `(.scss)` files for each component.                  |
| `src/styles/common.scss` | Contains common scss logic which is common and used many components files. |
| `src/styles/fonts.scss` | Contains fonts styles and icons styles .                         |
| `src/assets/fonts/`     | Stores `.eot`, `.woff`, `.ttf` and `.svg` font files.            |
| `stories/`       | Contains Storybook `.stories.tsx` files to showcase and test each component. |
| `build/`         | Compiled output folder (generated after build)                          |
| `.eslintrc.js`   | ESLint configuration (e.g., using WordPress style guide)                |
| `.eslintrcignore`| Files/folders to ignore during linting ( e.g., build/, node_modules/ )  |
| `.gitignore`     | Files/folders to ignore during git push ( e.g., build/, node_modules/ ) |
| `.npmignore`     | Specifies files/folders to exclude from the published npm package       |
| `.prettierignore`| Files/folders to exclude from Prettier formatting                       |
| `.prettierrc`    | Prettier configuration file ( js code formatting rules )                |
| `package.json`   | Package metadata and dependencies                                       |
| `tsconfig.json`  | TypeScript config                                                       |
| `webpack.config.js`| Webpack config for bundling                                           |
| `README.md`      | User documentation                                                      |
| `DEVELOPERDOC.md`| Developer documentation                                                 |

## 🚀 Getting Started

- Start development in zyra

### 1. Prerequisites
-   [PNPM](https://pnpm.io/installation): To run Zyra, make sure pnpm is installed on your system.
 
💡 Install pnpm globally using: ( This is for first time if you dont have pnpm installed )
> ```bash
> npm install -g pnpm
> ```

### 2. Install Dependencies
> ```bash
> pnpm i
> ```
### 3. Build Project ( Zyra )
> ```bash
> pnpm run build:project
> ```
- For Development run
> ```bash
> pnpm run watch:build:project
> ```
### 4. For js format check ( run lint )
> ```bash
> pnpm run lint
> ```
### 5. For js prettify
> ```bash
> pnpm run lint:fix
> ```

# Details about files

### [**.eslintrc.js**](.eslintrc.js)
This file tells ESLint how to check our code for errors, bad practices, and formatting issues.

🔧 What it does:
- Defines rules and style guidelines (like using single quotes or semicolons).

- Helps keep code clean, consistent, and bug-free.

- Can be configured to follow a standard (like WordPress, Airbnb, etc.).

- Works with editors like VSCode to highlight issues while coding.
- You coan add or remove more rules according to your need from the `rules: ` section .

### [**.eslintignore.js**](.eslintignore.js)
This file tells ESLint which files or folders to skip during linting.

### [**.prettierrc**](.prettierrc)
This file defines the code formatting rules used by Prettier, a tool that automatically formats your code.

🔧 What it does:
- Ensures consistent code style across the project.

- Works with most editors and CI pipelines.

- You define things like tabs, semicolons, quotes, etc.
### [**.prettierignore**](.prettierignore)
This file tells Prettier to skip formatting certain files or folders.

- Example files
    - build/
    - node_modules/
    - storybook/
    - *.min.js

### [**.gitignore**](.gitignore)
This file tells Git which files and folders to exclude from version control (they won’t be committed or pushed to GitHub).

### [**.npmignore**](.npmignore)
This file tells npm (or pnpm) which files to exclude when publishing your package.

### [**tsconfig.json**](tsconfig.json)
This file tells TypeScript how to compile your .ts and .tsx files into JavaScript.

🔧 What it does:
- Defines the root files and compiler options.

- Helps the TypeScript compiler understand your project structure.

- Ensures type safety and editor support (like IntelliSense).

### [**webpack.config.js**](webpack.config.js)
This file tells Webpack how to bundle your project into optimized output files ( like index.js and index.css ).

🔧 What it does:
- Bundles your code and assets (JS, SCSS, fonts, images, etc.).

- Supports loaders (e.g., for SCSS or TypeScript).

- Enables code splitting, lazy loading, and optimization.
