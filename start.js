import { createServer } from 'http';

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
});

server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
}); 