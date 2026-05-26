import fs from 'fs-extra';

const content = `
version: '3.8'

services:
  phpmyadmin:
    image: phpmyadmin/phpmyadmin

    environment:
      PMA_HOST: tests-mysql
      PMA_USER: root
      PMA_PASSWORD: password

    ports:
      - "8080:80"
`;

await fs.writeFile(
	'docker-compose.yml',
	content
);

console.log(
	'✅ docker-compose.yml generated'
);