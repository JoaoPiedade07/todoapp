const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/users/1763651449799',
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer seu_token_aqui'
  }
};

const req = http.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();
