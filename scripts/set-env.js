const fs = require('fs');

const apiUrl = process.env.API_URL || 'https://api.yourdomain.com';

const content = `export const environment = {
  production: true,
  apiUrl: '${apiUrl}',
};
`;

fs.writeFileSync('src/environments/environment.ts', content);
