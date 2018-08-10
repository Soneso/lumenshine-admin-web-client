#!/usr/bin/env node
const http = require('http');
const url = require('url');

// Create the server listening on port 8081
const server = http.createServer((req, res) => {
  // Create a new http request with the data at hand
  const parsedURL = url.parse(req.url);
  console.log(`Got request ${req.method} ${req.url}`);

  const proxyRequest = http.request({
    port: 9002,
    host: '192.168.2.112',
    method: req.method,
    headers: req.headers,
    path: parsedURL.pathname + (parsedURL.search ? parsedURL.search : '')
  });

  const headers = {
    'Access-Control-Allow-Origin': req.headers['origin'],
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PUT,DELETE',
    'Access-Control-Allow-Headers': 'Accept,Content-Type,Content-Length,Accept-Encoding,X-CSRF-Token,Authorization',
    'Access-Control-Expose-Headers': 'Authorization',
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
    return;
  }

  proxyRequest.addListener('response', proxyResponse => {
    proxyResponse.on('data', chunk => {
      res.write(chunk, 'binary');
    });

    // End the response
    proxyResponse.on('end', () => {
      res.end();
    });

    // Manipulate some headers - Here we repeat the original requests origin to the fake response
    if (req.headers['origin']) {
      proxyResponse.headers = Object.assign({}, proxyResponse.headers, headers);
    }
    res.writeHead(proxyResponse.statusCode, proxyResponse.headers);
  });

  // return a 404 when the forwarded request throws an error
  proxyRequest.on('error', err => {
    console.error(err);
    res.statusCode = '404';
    res.end();
  });

  // Copy any data in the original request to the forwarded request
  req.addListener('data', chunk => {
    proxyRequest.write(chunk, 'binary');
  });

  // End the proxy request
  req.addListener('end', () => {
    proxyRequest.end();
  });
});

server.listen({ port: 8081 }, () => {
  console.log('Server started on port 8081');
});
