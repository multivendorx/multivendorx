import chalk from 'chalk';

export const logger = {
	info: ( message ) =>
		console.log( chalk.cyan( message ) ),

	success: ( message ) =>
		console.log( chalk.greenBright( message ) ),

	warn: ( message ) =>
		console.log( chalk.yellow( message ) ),

	error: ( message ) =>
		console.log( chalk.redBright( message ) ),
};