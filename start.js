import { createServer } from 'http';

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World - Projeto funcionando!\n');
});

server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
}); 