const { createServer } = require('node:http');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.APP_HOST || '0.0.0.0';
const port = Number.parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, hostname, () => {
    console.log(`TweetQueue ready on http://${hostname}:${port}`);
  });
});
