import { execSync } from 'child_process';

export function runCommand(
	command,
	cwd = process.cwd()
) {
	execSync( command, {
		cwd,
		stdio: 'inherit',
	} );
}