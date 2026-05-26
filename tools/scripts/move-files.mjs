import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

const files = glob.sync(
	'assets/js/**/*.{js,php}'
);

const externalDir =
	'assets/js/externals';

fs.ensureDirSync(externalDir);

for (const file of files) {
	const basename =
		path.basename(file);

	if (!/^\d+/.test(basename)) {
		continue;
	}

	fs.moveSync(
		file,
		path.join(
			externalDir,
			basename
		),
		{
			overwrite: true
		}
	);
}