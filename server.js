const { createServer } = require('node:http');
const next = require('next');

// Hostinger does not always inject NODE_ENV automatically. Treat only an
// explicit development value as dev mode so production never falls back to
// slow on-demand compilation of JavaScript and CSS.
const dev = process.env.NODE_ENV === 'development';
const hostname = process.env.APP_HOST || '0.0.0.0';
const port = Number.parseInt(process.env.PORT || '3000', 10);

if (!dev && process.env.NODE_ENV !== 'production') {
  process.env.NODE_ENV = 'production';
}

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    createServer((req, res) => {
      // Next emits fingerprinted files under /_next/static. Cache them for a
      // year; their URL changes whenever the content changes.
      if (req.url?.startsWith('/_next/static/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }

      handle(req, res);
    }).listen(port, hostname, () => {
      console.log(
        `TweetQueue ready on http://${hostname}:${port} (${dev ? 'development' : 'production'})`
      );
    });
  })
  .catch((error) => {
    console.error('TweetQueue failed to start:', error);
    process.exit(1);
  });
