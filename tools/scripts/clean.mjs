import fs from 'fs-extra';
import chalk from 'chalk';
import path from 'path';

const targetFiles = [
	'dist',
	'.wireit',
	'.cache'
];

console.log(
	chalk.bgYellow.black(
		'🧹 Cleaning build files'
	)
);

for (const file of targetFiles) {
	const filePath = path.resolve(
		process.cwd(),
		file
	);

	if (fs.existsSync(filePath)) {
		fs.removeSync(filePath);

		console.log(
			chalk.green(
				`✔ Removed ${file}`
			)
		);
	}
}