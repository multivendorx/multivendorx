import fs from 'fs-extra';
import path from 'node:path';
import { execSync } from 'node:child_process';
import {
	BACKUP_PORTS,
	candidatesFrom,
	isOwnWpEnvContainer,
	publishedPort,
	reservePort,
	runningContainers,
} from './utils/env-ports.mjs';

const projectName = path.basename(process.cwd());

/**
 * Find this plugin's running MySQL container. wp-env names its containers `wp-env-{plugin dir}-{hash}-{service}-1`,
 * so other projects' wp-env sites running at the same time (each with their own MySQL) are skipped.
 */
const mysqlContainers = runningContainers('com.docker.compose.service=mysql')
	.map(({ name }) => name)
	.filter((name) => isOwnWpEnvContainer(name, 'mysql'));

if (!mysqlContainers.length) {
	throw new Error(
		`No running MySQL container found for "${projectName}". Ensure its wp-env site is running (pnpm run env:start).`
	);
}

/**
 * Use first detected mysql container
 */
const mysqlContainer = mysqlContainers[0];

console.log(`✅ Using MySQL container: ${mysqlContainer}`);

/**
 * Get docker network from mysql container
 */
const networksJson = execSync(
	`docker inspect -f '{{json .NetworkSettings.Networks}}' ${mysqlContainer}`,
	{ encoding: 'utf8' }
).trim();

const networkNames = Object.keys(JSON.parse(networksJson || '{}'));

if (!networkNames.length) {
	throw new Error(
		`No docker networks found for container "${mysqlContainer}".`
	);
}

/**
 * Use first attached network
 */
const wpEnvNetwork = networkNames[0];

console.log(`✅ Using Docker network: ${wpEnvNetwork}`);

/**
 * phpMyAdmin's port: an explicit PMA_PORT wins; this plugin's phpMyAdmin keeps its port when it is already running;
 * otherwise the first free, unreserved port of BACKUP_PORTS.phpmyadmin (8080, 8081, ...). The reservation covers the
 * moment between this script and `docker compose up`, and expires on its own.
 */
const containerName = `${projectName}-phpmyadmin`;
const runningPma = runningContainers().find(
	({ name }) => name === containerName
);
const candidates = candidatesFrom(
	'PMA_PORT_CANDIDATES',
	BACKUP_PORTS.phpmyadmin
);
const pmaPort =
	process.env.PMA_PORT ||
	(runningPma && publishedPort(runningPma.ports, 80)) ||
	(await reservePort(`${process.cwd()}#phpmyadmin`, candidates));

if (!pmaPort) {
	throw new Error(
		`No free phpMyAdmin port in ${candidates.join(', ')}. Set PMA_PORT, or PMA_PORT_CANDIDATES to a comma-separated list.`
	);
}

/**
 * Generate docker-compose.yml
 */
const content = `
services:
  phpmyadmin:
    image: phpmyadmin:latest
    container_name: ${containerName}

    environment:
      PMA_HOST: ${mysqlContainer}
      PMA_USER: root
      PMA_PASSWORD: password

    ports:
      - "${pmaPort}:80"

    networks:
      - ${wpEnvNetwork}

networks:
  ${wpEnvNetwork}:
    external: true
`;

await fs.writeFile('docker-compose.yml', content);

console.log(
	`✅ docker-compose.yml generated for "${mysqlContainer}" on network "${wpEnvNetwork}"`
);
console.log(`✅ phpMyAdmin: http://localhost:${pmaPort}`);
