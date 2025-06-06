# For Work on MultiVenodrX MonoRepo ( For first time )
```bash
    #clone the MultiVenderoX MonoRepo (if it is you first time)
    git clone <multivendorx-monorepo-url>

    # clear multivendorx    
    rm 'multivendorx'

    #clear cache 
    git rm -r --cached multivendorx
    # Add submodule
    git submodule add <child-repo-url> multivendorx

    # Updating Both Repos
        # Update the child repo:
            cd core_plugins
            git add .
            git commit -m "Update in child"
            git push
        # Update parent repo to track submodule change:
            cd ..
            git add child
            git commit -m "Update submodule reference"
            git push
```

# Next time
```bash
    # clone the pro repo with the submodule repo
    git clone --recurse-submodules <repo-url>
```
# Note : Before Start must read [**README.md**](README.md)
# Step 1 : Insall all the dependencies
```bash
    # if don't run previously
    # Install all the dependencies in every workspace
    pnpm i or install
```
- [**workspace**](pnpm-workspace.yaml) : A pnpm workspace is a powerful way to manage multiple packages (projects) in a monorepo using pnpm, a fast and disk-efficient Node.js package manager. It allows you to share dependencies across projects, develop multiple packages in parallel, and keep things consistent.

You can define another workspace by editing the [**pnpm-workspace.yaml**](pnpm-workspace.yaml) file and adding the path under the packages section.

- Note : Once `pnpm install` is complete, you’ll notice that `Composer` automatically runs and builds the vendor folder in each project.
- This is done by the `postinstall` command present in every `package.json`

# Step 2 : Run Build command
```bash
    # if don't run previously
    # Run build command which build all the project present in workspace
    pnpm build or pnpm run build
```
- Note: When we run the `build` command in the root project, it executes the build script defined in the [**package.json**](package.json) :
```bash
"build": "pnpm -r --workspace-concurrency=Infinity --stream \"/^build:project:.*$/\""
```
In this command, the `-r` flag (--recursive) tells pnpm to run the matching scripts in every package.json within the workspace. The regex pattern `build:project:.*$` ensures only scripts with names that match this pattern will be executed.

# Step 3 : Run the Project
if you want to run any project then go the project directory for example
we consider `Notifima` as our project .

- 1. Then go to notifima directory
```bash
# go to the notifima workspace
cd multivendorx/plugins/notifima
```
- 2. check for the `node_modules` , `release` and `vendor` is present or not
    - Note : if this folder's are present then skip this step
```bash
# if not present then run this commands
pnpm run build:project or pnpm run build

and/or

composer update

```
- 3. Run the `wp-env` for running `notifima` in docker
```bash
# This will run run the project in docker
pnpm run env:start
```

### More commands in root's package.json

### 1. lint command
```bash
# for checking errors in php, js and css files
pnpm run lint
```

*   **Purpose**: Runs the lint script in all workspaces (i.e., each project in your monorepo that has a lint script defined in its package.json).
    
*   **Explanation**:
    
    *   pnpm -r is short for pnpm recursive, which runs the command in every workspace.

### 2. test command        
```bash
# Run test commands in every workspace
pnpm run test
```
*   **Purpose**: Runs the test script recursively across all workspace packages.
    
*   **Explanation**:
    
    *   Same as the lint command, but for testing. It ensures all packages run their individual test scripts, if defined.

### 3. watch:storybook command        
```bash
# Run storybook in watch mode ( This helps for individual testing )
pnpm run watch:storybook
```

```bash
# Clean all generated files
pnpm run clean
```
*   **Purpose**: Cleans common generated and vendor directories.
    
*   **Explanation**:
    
    *   `rimraf` : cross-platform tool to delete files/directories (like rm -rf).
        
    *   `-v`: verbose mode (logs deleted files).
        
    *   `-g` : enables globbing patterns.
        
    *   Deletes:
        
        *   all `node_modules` folders recursively,
            
        *   `vendor` folders in each plugin,
            
        *   `languages` folders in each plugin.
            
    *   Then it runs pnpm store prune to remove unused packages from the global store.

### 4. clean:build command        
```bash
# Clean all build files
pnpm run clean:build
```
*   **Purpose**: Cleans all `build` artifacts and Wireit cache.
    
*   **Explanation**:
    
    *   Removes:
        
        *   all `build` directories,
            
        *   `release` directories under plugins,
            
        *   `.wireit` cache directories used by Wireit (a task runner used with `pnpm`).

### 5. sync-dependencies command              
```bash
# Clean all build files
pnpm run sync-dependencies
```
*   **Purpose**: Fixes mismatched dependency versions across your monorepo.
    
*   **Explanation**:
    
    *   `syncpack` is a tool that ensures consistent dependency versions.
        
    *   fix-mismatches automatically updates mismatched versions to be the same across all `package.json` files.
    * it handle virsion management using [**`.syncpackrc`**](.syncpackrc) file
        

### 🔹 "preinstall": "npx only-allow pnpm"

*   **Purpose**: Ensures only pnpm is used to install dependencies.
    
*   **Explanation**:
    
    *   only-allow is a utility that blocks installing with npm or yarn.
        
    *   This prevents other developers (or CI tools) from accidentally using the wrong package manager.