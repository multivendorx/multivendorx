import fs from 'fs-extra';
import path from 'node:path';
import { execSync } from 'node:child_process';

const projectName = path.basename(process.cwd());

const mysqlContainers = execSync(
	'docker ps --filter "label=com.docker.compose.service=mysql" --format "{{.Names}}"',
	{ encoding: 'utf8' }
)
	.split('\n')
	.map((name) => name.trim())
	.filter(Boolean);

const mysqlContainer =
	mysqlContainers.find((name) => name.includes(`wp-env-${projectName}-`)) ||
	mysqlContainers.find((name) => name.startsWith('wp-env-') && name.includes('-mysql-'));

if (!mysqlContainer) {
	throw new Error(
		`No wp-env mysql container found for "${projectName}". Ensure 'pnpm wp-env start' is running.`
	);
}

const networksJson = execSync(
	`docker inspect -f '{{json .NetworkSettings.Networks}}' ${mysqlContainer}`,
	{ encoding: 'utf8' }
).trim();

const networkNames = Object.keys(JSON.parse(networksJson || '{}'));

if (!networkNames.length) {
	throw new Error(`No docker networks found for container "${mysqlContainer}".`);
}

const wpEnvNetwork = networkNames[0];

const content = `
version: '3.8'

services:
  phpmyadmin:
    image: phpmyadmin/phpmyadmin

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

console.log(`✅ docker-compose.yml generated for ${mysqlContainer} on ${wpEnvNetwork}`);