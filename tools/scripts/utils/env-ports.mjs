import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';

/**
 * Port selection for the local environments, shared by every plugin of the MultiVendorX and VuloLabs workspaces
 * (each workspace keeps an identical copy of this file under tools/scripts/, and so does each submodule).
 *
 * Any number of projects can run side by side: every service gets the first free port of its pool, a site that is
 * already running keeps the port it has, and ports handed out to a start that is still booting are reserved (see
 * reservePort()) so two starts at the same moment never pick the same one.
 *
 * Overrides, all optional:
 * - WP_ENV_PORT / WP_ENV_TESTS_PORT / PMA_PORT: force one port.
 * - WP_ENV_PORT_CANDIDATES / PMA_PORT_CANDIDATES: replace a pool, comma-separated (e.g. "8890,8891").
 */
export const BACKUP_PORTS = {
	// WordPress sites, the development site and the tests site alike.
	wordpress: [
		8888, 8889, 8890, 8891, 8892, 8893, 8894, 8895, 8896, 8897, 8898, 8899,
	],
	phpmyadmin: [8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087, 8088, 8089],
};

/** How long a reserved port is held for a start that hasn't bound it yet (wp-env's first start can take minutes). */
const RESERVATION_TTL_MS = 15 * 60 * 1000;
const RESERVATIONS_FILE = path.join(
	os.tmpdir(),
	'wp-env-port-reservations.json'
);
const LOCK_DIR = `${RESERVATIONS_FILE}.lock`;
const LOCK_STALE_MS = 30 * 1000;

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Whether a container is one of the current plugin directory's own wp-env services. wp-env names them
 * `wp-env-{plugin dir}-{8-hex hash}-{service}-{n}`; the whole pattern is matched, because a bare prefix would also
 * match other plugins whose directory names start the same way (`vulocart` would match `vulocart-pro`'s containers).
 *
 * @param {string} name    Container name.
 * @param {string} service Compose service, e.g. `wordpress`, `tests-wordpress`, `mysql`.
 * @return {boolean} True for this plugin's container of that service.
 */
export const isOwnWpEnvContainer = (name, service) =>
	new RegExp(
		`^wp-env-${escapeRegExp(path.basename(process.cwd()))}-[0-9a-f]{8}-${escapeRegExp(service)}-\\d+$`
	).test(name);

/**
 * Reads a pool from an env var, falling back to the defaults.
 *
 * @param {string}   envName  Name of the env var holding a comma-separated list.
 * @param {number[]} defaults Ports to use when the env var is not set.
 * @return {number[]} Ports to try, in order.
 */
export const candidatesFrom = (envName, defaults) => {
	const raw = process.env[envName];

	if (!raw) {
		return defaults;
	}

	const ports = raw
		.split(',')
		.map((value) => Number.parseInt(value.trim(), 10))
		.filter((value) => Number.isInteger(value) && value > 0);

	return ports.length ? ports : defaults;
};

/**
 * Whether nothing is listening on a TCP port, on either the IPv4 or the IPv6 wildcard address (Docker publishes on
 * both).
 *
 * @param {number} port Port to check.
 * @return {Promise<boolean>} True when the port can be bound.
 */
export const isPortFree = async (port) => {
	const tryListen = (host) =>
		new Promise((resolve) => {
			const server = net.createServer();

			server.once('error', (error) => {
				// No IPv6 on this machine: that address can't conflict.
				resolve(
					'EADDRNOTAVAIL' === error.code ||
						'EAFNOSUPPORT' === error.code
				);
			});
			server.once('listening', () => server.close(() => resolve(true)));
			server.listen(port, host);
		});

	return (await tryListen('0.0.0.0')) && (await tryListen('::'));
};

/**
 * Running containers, as `{ name, ports }` rows, optionally filtered by a docker label.
 *
 * @param {string} [label] A `key=value` docker label filter.
 * @return {{ name: string, ports: string }[]} Running containers.
 */
export const runningContainers = (label) => {
	const filter = label ? `--filter "label=${label}"` : '';

	try {
		return execSync(
			`docker ps ${filter} --format "{{.Names}}\t{{.Ports}}"`,
			{
				encoding: 'utf8',
			}
		)
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean)
			.map((line) => {
				const [name, ports = ''] = line.split('\t');
				return { name, ports };
			});
	} catch {
		return [];
	}
};

/**
 * The host port a container publishes for a container port, e.g. 80 in `0.0.0.0:8889->80/tcp`.
 *
 * @param {string} ports         The `{{.Ports}}` column of `docker ps`.
 * @param {number} containerPort The port inside the container.
 * @return {number|null} The host port, or null when it isn't published.
 */
export const publishedPort = (ports, containerPort) => {
	const match = ports.match(new RegExp(`:(\\d+)->${containerPort}/tcp`));

	return match ? Number.parseInt(match[1], 10) : null;
};

/**
 * The host port of one of this plugin's running wp-env services.
 *
 * @param {string} service Compose service name: `wordpress` or `tests-wordpress`.
 * @return {number|null} The port, or null when that service isn't running.
 */
export const runningServicePort = (service) => {
	const container = runningContainers(
		`com.docker.compose.service=${service}`
	).find(({ name }) => isOwnWpEnvContainer(name, service));

	return container ? publishedPort(container.ports, 80) : null;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Runs `callback` while holding a machine-wide lock (an atomic mkdir), so port picks don't interleave. */
const withLock = async (callback) => {
	for (let attempt = 0; ; attempt++) {
		try {
			fs.mkdirSync(LOCK_DIR);
			break;
		} catch (error) {
			if ('EEXIST' !== error.code) {
				throw error;
			}

			// A lock left behind by a killed process.
			try {
				if (
					Date.now() - fs.statSync(LOCK_DIR).mtimeMs >
					LOCK_STALE_MS
				) {
					fs.rmSync(LOCK_DIR, { recursive: true, force: true });
					continue;
				}
			} catch {
				continue;
			}

			if (attempt > 200) {
				throw new Error(
					`Timed out waiting for the port lock (${LOCK_DIR}).`
				);
			}

			await sleep(100);
		}
	}

	try {
		return await callback();
	} finally {
		fs.rmSync(LOCK_DIR, { recursive: true, force: true });
	}
};

const readReservations = () => {
	try {
		const all = JSON.parse(fs.readFileSync(RESERVATIONS_FILE, 'utf8'));
		const now = Date.now();

		return Object.fromEntries(
			Object.entries(all).filter(
				([, entry]) => now - entry.at < RESERVATION_TTL_MS
			)
		);
	} catch {
		return {};
	}
};

const writeReservations = (reservations) =>
	fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify(reservations, null, 1));

/**
 * The first port of a pool that is free and not reserved by another start, reserved for `owner`.
 *
 * @param {string}   owner      Who the port is for, e.g. `/path/to/plugin#wordpress`.
 * @param {number[]} candidates The pool, in order.
 * @param {number[]} [exclude]  Ports this same start already took for another service.
 * @return {Promise<number|null>} The port, or null when the whole pool is taken.
 */
export const reservePort = (owner, candidates, exclude = []) =>
	withLock(async () => {
		const reservations = readReservations();
		const takenByOthers = new Set(
			Object.entries(reservations)
				.filter(([, entry]) => entry.owner !== owner)
				.map(([port]) => Number(port))
		);

		for (const port of candidates) {
			if (
				exclude.includes(port) ||
				takenByOthers.has(port) ||
				!(await isPortFree(port))
			) {
				continue;
			}

			for (const [reserved, entry] of Object.entries(reservations)) {
				if (entry.owner === owner) {
					delete reservations[reserved];
				}
			}

			reservations[port] = { owner, at: Date.now() };
			writeReservations(reservations);

			return port;
		}

		return null;
	});

/**
 * Drops the reservations of a start whose containers are up (they hold the ports themselves now) or that failed.
 *
 * @param {string} ownerPrefix Owners starting with this, e.g. `/path/to/plugin#`.
 */
export const releasePorts = (ownerPrefix) =>
	withLock(() => {
		const reservations = readReservations();

		for (const [port, entry] of Object.entries(reservations)) {
			if (entry.owner.startsWith(ownerPrefix)) {
				delete reservations[port];
			}
		}

		writeReservations(reservations);
	});
