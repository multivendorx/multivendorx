import fs from 'fs-extra';
import { execSync } from 'child_process';

// 1. Get the current network name
function getNetworkName() {
  try {
    return execSync(
      `docker inspect -f '{{range $k, $v := .NetworkSettings.Networks}}{{$k}}{{end}}' ` +
      `$(docker ps --filter name=mysql --format {{.Names}} | head -n1)`,
      { encoding: 'utf-8' }
    ).trim();
  } catch (error) {
    console.error('❌ Failed to detect Docker network:', error.message);
    process.exit(1);
  }
}

// 2. Update or create docker-compose.yml
function updateComposeFile(networkName) {
  const composePath = 'docker-compose.yml';
  let composeContent;

  // If file exists, read and modify it
  if (fs.existsSync(composePath)) {
    composeContent = fs.readFileSync(composePath, 'utf8');
    
    // Update networks section (regex handles various formatting)
    composeContent = composeContent.replace(
      /networks:\s*\n\s*[\w-]+:\s*\n\s*external:\s*\w+/g,
      `networks:\n  ${networkName}:\n    external: true`
    );

    // Update service network reference
    composeContent = composeContent.replace(
      /networks:\s*\n\s*-\s*[\w-]+/g,
      `networks:\n      - ${networkName}`
    );
    
    console.log('🔄 Updated existing docker-compose.yml');
  } 
  // If file doesn't exist, create from template
  else {
    composeContent = `version: '3.8'

services:
  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    environment:
      PMA_HOST: tests-mysql
      PMA_USER: root
      PMA_PASSWORD: password
    ports:
      - "8080:80"
    networks:
      - ${networkName}

networks:
  ${networkName}:
    external: true
`;
    console.log('✅ Created new docker-compose.yml');
  }

  fs.writeFileSync(composePath, composeContent);
}

// Execute
const networkName = getNetworkName();
updateComposeFile(networkName);
console.log(`🔗 Using network: ${networkName}`);