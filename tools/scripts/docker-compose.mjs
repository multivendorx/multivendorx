import fs from 'fs-extra';
import path from 'node:path';
import { execSync } from 'node:child_process';

const projectName = path.basename(process.cwd());

/**
 * Find running MySQL container from wp-env/docker compose
 */
const mysqlContainers = execSync(
	'docker ps --filter "label=com.docker.compose.service=mysql" --format "{{.Names}}"',
	{ encoding: 'utf8' }
)
	.split('\n')
	.map((name) => name.trim())
	.filter(Boolean);

if (!mysqlContainers.length) {
	throw new Error(
		`No running MySQL container found for "${projectName}". Ensure 'pnpm wp-env start' is running.`
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
 * Generate docker-compose.yml
 */
const content = `
version: '3.8'

services:
  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    container_name: ${projectName}-phpmyadmin

    environment:
      PMA_HOST: ${mysqlContainer}
      PMA_USER: root
      PMA_PASSWORD: password

    ports:
      - "8080:80"

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
