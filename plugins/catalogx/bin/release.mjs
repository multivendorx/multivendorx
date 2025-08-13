/* eslint-disable no-console */
import fs from 'fs-extra';
import { exec } from 'child_process';
import chalk from 'chalk';

const pluginFiles = [
    "release/assets/",
    "classes/",
    "languages/",
    "log/",
    "templates/",
    "modules/",
    "config.php",
    "composer.lock",
    "composer.json",
    "Woocommerce_Catalog_Enquiry.php",
    "readme.txt",
];

const removeFiles = ["composer.json", "composer.lock"];

const { version, displayName } = JSON.parse(
    fs.readFileSync("package.json", "utf8")
);

const releasePath = "release";

// 1. Ensure final-release directory exists
if (!fs.existsSync(releasePath)) {
    console.log(chalk.yellow(`⚠️ release folder not found.`));
    console.log(chalk.green(`🗂 Creating release directory...`));
    fs.mkdirpSync(releasePath);
}

const dest = `${releasePath}/${displayName}`;
fs.mkdirpSync(dest);

console.log(`🗜 Started making the zip ...`);
try {
    console.log(`⚙️ Copying plugin files ...`);

    pluginFiles.forEach((file) => {
        if(file === "release/assets/"){
            const destFile = file.replace("release/", "");
            fs.moveSync(file, `${dest}/${destFile}`, { overwrite: true });
        }else{
            fs.copySync(file, `${dest}/${file}`);
        }
    });

    console.log(`📂 Finished copying files.`);
} catch (err) {
    console.error(chalk.red("❌ Could not copy plugin files."), err);
    process.exit(1);
}

// 2. Install Composer packages
exec(
    'composer install --optimize-autoloader --no-dev',
    { cwd: dest },
    (error) => {
        if (error) {
            console.log(chalk.red(`❌ Composer install failed in ${dest}`));
            console.log(chalk.bgRed.black(error));
            return;
        }

        console.log(`⚡️ Installed composer packages in ${dest}`);

        // 3. Remove unnecessary files
        removeFiles.forEach((file) => {
            fs.removeSync(`${dest}/${file}`);
        });

        // 4. Create zip
        const zipFile = `${displayName}-v${version}.zip`;
        console.log(`📦 Making the zip file ${zipFile} ...`);

        exec(
            `zip ${zipFile} ${displayName} -rq`,
            { cwd: releasePath },
            (zipError) => {
                if (zipError) {
                    console.log(chalk.red(`❌ Could not make ${zipFile}.`));
                    console.log(chalk.bgRed.black(zipError));
                    return;
                }

                fs.removeSync(dest);
                console.log(chalk.green(`✅ ${zipFile} is ready. 🎉`));
            }
        );
    }
);
