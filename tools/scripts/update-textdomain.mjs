import wpTextdomain from 'wp-textdomain';

import {
	getPackage
} from './utils/package.mjs';

const {
	name,
	pluginName
} = getPackage();

const domain =
	pluginName || name;

const files = [
	'classes/**/*.php',
	'templates/**/*.php',
	'modules/**/*.php'
];

for (const file of files) {
	wpTextdomain(file, {
		domain,
		fix: true,
		missingDomain: true,
		variableDomain: true
	});
}

console.log(
	`✔ Textdomain updated (${domain})`
);