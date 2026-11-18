import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
	BACKUP_PORTS,
	candidatesFrom,
	releasePorts,
	reservePort,
	runningServicePort,
} from './utils/env-ports.mjs';

/**
 * Runs wp-env for the plugin in the current directory: `node ../../tools/scripts/wp-env.mjs <wp-env args...>`.
 * Every plugin's `env:*` scripts go through it, so any number of projects can run side by side with no manual setup.
 *
 * - Finds the workspace's wp-env binary. It is installed at the workspace root, not in each plugin, so a plugin's own
 *   `pnpm wp-env ...` has no binary to run and exits without doing anything.
 * - Picks the ports. For the development site (WP_ENV_PORT) and, when `.wp-env.json` leaves the tests environment on,
 *   the tests site (WP_ENV_TESTS_PORT): an explicit env var wins; otherwise a running site of this plugin keeps its
 *   port; otherwise the first free, unreserved port of BACKUP_PORTS.wordpress. MySQL ports are random in wp-env, so
 *   they never collide.
 * - Disables Node's network family autoselection, as the package.json scripts did.
 */

const findWpEnvBinary = () => {
	let dir = process.cwd();

	for (;;) {
		const candidate = path.join(dir, 'node_modules', '.bin', 'wp-env');

		if (fs.existsSync(candidate)) {
			return candidate;
		}

		const parent = path.dirname(dir);

		if (parent === dir) {
			return null;
		}

		dir = parent;
	}
};

/** Whether wp-env will also run a tests site: `testsEnvironment` is true unless a config file sets it to false. */
const testsEnvironmentEnabled = () => {
	let enabled = true;

	for (const file of ['.wp-env.json', '.wp-env.override.json']) {
		try {
			const config = JSON.parse(fs.readFileSync(file, 'utf8'));

			if ('boolean' === typeof config.testsEnvironment) {
				enabled = config.testsEnvironment;
			}
		} catch {
			// Missing or unreadable: the defaults stand.
		}
	}

	return enabled;
};

const owner = `${process.cwd()}#`;
const command = process.argv[2];
const startsSites = ['start', 'restart'].includes(command);
const pool = candidatesFrom('WP_ENV_PORT_CANDIDATES', BACKUP_PORTS.wordpress);

/**
 * The port for one site.
 *
 * @param {string}   envName Env var wp-env reads it from.
 * @param {string}   service Compose service of the site.
 * @param {string}   label   Name shown in the log.
 * @param {number[]} exclude Ports already chosen for this plugin's other site.
 * @return {Promise<number|null>} The port, or null when wp-env should be left to its own config.
 */
const choosePort = async (envName, service, label, exclude) => {
	if (process.env[envName]) {
		console.log(`ℹ ${label} port ${process.env[envName]} (${envName})`);
		return Number(process.env[envName]);
	}

	const running = runningServicePort(service);

	if (running) {
		console.log(`ℹ ${label} port ${running} (already running)`);
		return running;
	}

	// Only a start needs a free port; any other command just has to agree with a running site's port (above).
	if (!startsSites) {
		return null;
	}

	const port = await reservePort(
		`${owner}${service}`,
		pool.filter((candidate) => !exclude.includes(candidate))
	);

	if (null === port) {
		console.error(
			`✖ No free ${label} port in ${pool.join(', ')}. Set ${envName}, or WP_ENV_PORT_CANDIDATES to a comma-separated list.`
		);
		await releasePorts(owner);
		process.exit(1);
	}

	console.log(
		`ℹ ${label} port ${port}${port === pool[0] ? '' : ' (backup port; the ones before it are in use)'}`
	);

	return port;
};

const binary = findWpEnvBinary();

if (!binary) {
	console.error(
		'✖ wp-env is not installed. Run `pnpm install` at the workspace root first.'
	);
	process.exit(1);
}

const env = {
	...process.env,
	NODE_OPTIONS: [
		process.env.NODE_OPTIONS,
		'--no-network-family-autoselection',
	]
		.filter(Boolean)
		.join(' '),
};

const sitePort = await choosePort('WP_ENV_PORT', 'wordpress', 'WordPress', []);

if (sitePort) {
	env.WP_ENV_PORT = String(sitePort);
}

if (testsEnvironmentEnabled()) {
	const testsPort = await choosePort(
		'WP_ENV_TESTS_PORT',
		'tests-wordpress',
		'Tests site',
		sitePort ? [sitePort] : []
	);

	if (testsPort) {
		env.WP_ENV_TESTS_PORT = String(testsPort);
	}
}

const result = spawnSync(binary, process.argv.slice(2), {
	stdio: 'inherit',
	env,
});

// Once the containers are up they hold the ports themselves; after a failure, or once the plugin's sites are stopped
// or removed, nothing of this plugin (its phpMyAdmin included) should stay reserved.
if (startsSites || ['stop', 'destroy', 'clean'].includes(command)) {
	await releasePorts(owner);
}

process.exit(result.status ?? 1);
