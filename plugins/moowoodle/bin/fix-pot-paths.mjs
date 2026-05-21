import fs from 'fs-extra';

const potFile = 'languages/moowoodle.pot';

if ( ! fs.existsSync( potFile ) ) {
	console.error( 'POT file not found.' );
	process.exit( 1 );
}

let content = fs.readFileSync( potFile, 'utf8' );

content = content.replaceAll(
	'release/assets/',
	'assets/'
);

fs.writeFileSync( potFile, content );

console.log(
	':white_check_mark: Fixed POT asset paths (removed release/ prefix).'
);