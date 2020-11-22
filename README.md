# webreq

![Test](https://github.com/RedeployAB/webreq/workflows/Test/badge.svg)

> Small and simple module for handling HTTP/HTTPS requests.

* [Information](#information)
* [Install](#install)
* [Usage](#usage)
  * [Methods](#options-and-methods)
  * [Error Handling](#error-handling)
  * [HTTP Agent](#http-agent)
  * [Proxy](#proxy)
  * [Client Certificate](#client-certificate)
  * [File downloads](#file-downloads)
  * [File uploads (stream)](#file-uploads-stream)
  * [TypeScript](#typescript)
* [Todo](#todo)

## Information

`webreq` is short for webrequest. This name was chosen because most other names that is synonyms with 
HTTP/HTTPS requests was taken.

`webreq` supports both **Promises** and the classic **callback**. See examples below.

*Why* create and use `webreq`?

There are a lot of other modules, most famously `request` for making HTTP/HTTPS requests with Node.js.
It's a very great module for that purpose, if not *the* best and I highly recommend using that if some 
deeper functionality is needed. If the need is only to make basic `GET`/`POST`/`PUT` and `DELETE` requests with either `application/json`
or `application/x-www-form-urlencoded` most other modules depends on so many other node modules and packages.

`webreq` depends only on the built-in modules. And the goal is to keep it that way.

Note that this is a work in progress, and more features might, or might not be added.

## Install

```
npm install webreq
```

## Usage

`webreq` supports both **Promises** and **callback** style.

**Basic GET request using Promises**

```js
// Using Promise based. 
const webreq = require('webreq');
...
...
webreq.get('https://someurl').then((res) => {
  console.log(res);
}).catch(error => {
  console.log(error);
});

// Using Promise based inside an async function.
let res;
try {
  res = await webreq.get('https://someurl');
} catch (error) {
  console.log(error);
}
```

To target a specific port, specify it in the URL: `https://someurl:8080`.

**Basic GET request using callback**

```js
const webreq = require('webreq');
...
...
webreq.get('https://someurl', (err, res) => {
  if (err) {
    console.log(err);
  } else {
    console.log(res);
  }
});
```

### Options and Methods

All the methods follow the same syntax:

```js
// Options and callback are optional.
// Will use Promises if no callback is passed. 
webreq.method(uri, [options], [callback]);
```

#### Options

The following properties can be set on `webreq`.

```js
// stream: Optional. Default is false. If true it will return the response as a stream.
webreq.stream = Boolean
// parse: Optional. Default is true. If true it will try to parse the response according to MIME type, if false will return pure string.
webreq.parse = Boolean
// followRedirects: Optional. Default is false. If true it will follow redirects found in the 'location' header.
webreq.followRedirects Boolean
// maxRedirects: Optional. Default is 3.
webreq.maxRedirects: Number
```

To modify the `http.globalAgent` and `https.globalAgent`:

```js
// Create a new agent with options, available options at: https://nodejs.org/api/http.html#http_new_agent_options
// and https://nodejs.org/api/https.html#https_new_agent_options
let agent = new https.Agent(options);
webreq.globalAgent(agent);
// or
let agent = new http.Agent(options);
webreq.globalAgent(agent);
```

The following options can be used for each request.

For more information about the agent settings and options, see: [http.Agent](https://nodejs.org/api/http.html#http_class_http_agent) and [socket.connect()](https://nodejs.org/api/net.html#net_socket_connect_options_connectlistener).

```js
let options = {
  // method: Optional. Will default to GET.
  method: 'GET'|'POST'|'PUT'|'PATCH'|'DELETE',
  // headers: Optional. Depending on method used and input data is used, Content-Type and Content-Lengt will be checked and enforced.
  headers: {},
  // stream: Optional. Returns response as a stream.
  stream: Boolean,
  // body: Optional for GET requests. Mandatory for POST, PUT, PATCH. The data to send with the request.
  body: {},
  // parse: Optional. Default is true. If true it will try to parse the response according to MIME type, if false will return pure string.
  // Overrides the settings put on webreq.
  parse: Boolean,
  // followRedirects: Optional. Default is false. If true it will follow redirects found in the 'location' header.
  // Overrides the settings put on webreq.
  followRedirects: Boolean,
  // maxRedirects: Optional. Default is 3. Maximum amount of redirects.
  // Overrides the settings put on webreq.
  maxRedirects: Number,
  // path: Optional: When used in a GET request for downloads, it is used as the  output path for a file. When used with POST or PUT it will point to a file to upload.
  path: String,
  // filename: Optional: Used together with path, if a new custom filename is to be used.
  filename: String,
  // agent: Optional. http.Agent/https.Agent object.
  agent: Object,
  // certificate: Optional. Certificate options for the request (HTTPS).
  certificate: {
    // ca: Optional: Override the trusted CA certificates.
    ca: String | Buffer,
    // cert: Optional: Certificate chains in PEM format.
    cert: String | Buffer,
    // key: Optional: Private keys in PEM format. If encrypted use together with options.certificate.passphrase.
    key: String | Buffer,
    // passphrase: Optional: Shared passphrase for a private key and/or PFX.
    passphrase: String,
    // pfx: Optional: PFX pr PKCS12 encoded private key and certificate chain.
    pfx: String | Buffer
  },
  // proxy: Optional. Proxy to use in the request.
  proxy: String
}
```

#### Output

Output will be an object of type `Response`.

```js
webreq.get('https://someurl', { parse: true }).then(res => {
  console.log(res.statusCode);    // 200                                      - number
  console.log(res.headers);       // { 'content-type': 'application/json' }   - object
  console.log(res.body);          // { message: 'hello' }                     - object
});
```

If `parse` is set to true (default behaviour), it will attempt to parse the body according to it's MIME type (`JSON` is currently supported).
The example above shows this behaviour.

```js
webreq.get('https://someurl', { parse: false }).then(res => {
  console.log(res.body);          // '{"message":'hello'}" - string
});
```

If it's set to `false` it will attempt to parse the body.

```js
webreq.get('https://someurl', { parse: false }).then(res => {
  console.log(res.statusCode);    // 200                                      - number
  console.log(res.headers);       // { 'content-type': 'application/json' }   - object
  console.log(res.body);          // '{"message":'hello'}"                    - string
});
```


#### `request()`

**GET request**

```js
const webreq = require('webreq');
...
...
let options = {
  method: 'GET',
  headers: { Authorization: `bearer ${token}` }
};

webreq.request('https://someurl', options).then(res => {
  console.log(res);
}).catch(err => {
  console.log(err);
});
```

**POST request**

```js
const webreq = require('webreq');
...
...
let options = {
  method: 'POST',
  headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
  body: '{"property1":"value1"}'
};

webreq.request('https://someurl', options).then(res => {
  console.log(res);
}).catch(err => {
  console.log(err);
});
```

**PUT request**

```js
const webreq = require('webreq');
...
...
let options = {
  method: 'PUT',
  headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
  body: '{"property1":"value1"}'
};

webreq.request('https://someurl/id/1', options).then(res => {
  console.log(res);
}).catch(err => {
  console.log(err);
});
```

**DELETE request**

```js
const webreq = require('webreq');
...
...
let options = {
  method: 'DELETE',
  headers: { Authorization: `bearer ${token}` }
};

webreq.request('https://someurl/id/1', options).then(res => {
  console.log(res);
}).catch(err => {
  console.log(err);
});
```

#### `get()`

Uses `request()` but enforces `method: GET` in it's options.

```js
webreq.get(uri, [options], [callback]);
```

#### `post()`

Uses `request()` but enforces `method: POST` in it's options.

```js
webreq.post(uri, [options], [callback]);
```

#### `put()`

Uses `request()` but enforces `method: PUT` in it's options.

```js
webreq.put(uri, [options], [callback]);
```

#### `patch()`

**NOTE**: Not tested.

Uses `request()` but enforces `method: PATCH` in it's options.

```js
webreq.patch(uri, [options], [callback]);
```

#### `delete()`

Uses `request()` but enforces `method: DELETE` in it's options.

```js
webreq.delete(uri, [options], [callback]);
```

#### `webreq()`

Returns a new instance of `WebReq`.

### Error handling

Errors will only be returned and thrown if there is a send or receive error.
All other statuses will be deemed as a successful call, so handle it accordingly.

```js
// Example.
let res = await webreq.request('<url'>);
if (res.statusCode >= 300 && res.statusCode <= 511) {
  throw new Error('Non 2xx result.')
}
```

### HTTP Agent

To provide a custom `http.Agent` or `https.Agent`:

```js
const http = require('http');
// ...
// ...
let agent = new http.Agent(options)

webreq.request('https://someurl', { method: 'GET', agent: agent })
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.log(err);
  });

// Or to use HTTPS.
const https = require('https');
// ...
// ...
let agent = new https.Agent(options)

webreq.request('https://someurl', { method: 'GET', agent: agent })
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.log(err);
  });
```

For more information about the agent settings and options, see: [http.Agent](https://nodejs.org/api/http.html#http_class_http_agent) and [socket.connect()](https://nodejs.org/api/net.html#net_socket_connect_options_connectlistener).

### Proxy

To send a request through a proxy, use the `proxy` option.

```js
webreq.request('http://someurl', { method: 'GET', proxy: 'http://proxy:8080' })
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.log(err);
  });
```

At this time the `proxy` option only supports **HTTP**.
Native support for **HTTPS** will be added in a future release.

For now pass in an agent that manages the proxy request, for example: [https-proxy-agent](https://www.npmjs.com/package/https-proxy-agent).

To use it:

```js
const HttpsProxyAgent = require('https-proxy-agent');
// ...
// ...
let agent = new HttpsProxyAgent('https://proxy:8080');
webreq.request('https://someurl', { agent: agent })
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.log(err);
  });
```

### Client Certificate

To use a certificate with a request:

1. PFX
```js
const fs = require('fs');
let pfx = fs.readFileSync(__dirname + '/path/to/pfx');

webreq.request('https://someurl', { method: 'GET', certificate: { pfx: pfx }})
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.log(err);
  });
```

2. PEM
```js
const fs = require('fs');
let pem = fs.readFileSync(__dirname + '/path/to/pem');

webreq.request('https://someurl', { method: 'GET', certificate: { pem: pem }})
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.log(err);
  });
```

For additional options see: [https.request()](https://nodejs.org/api/https.html#https_https_request_options_callback) in the section about `tls.connect()` (`ca`, `cert`, `key`, `passphrase`, `pfx`).

### File downloads

There are a couple of options of handling file downloads.

1. Specify path in a `GET` request:
```js
// Will return status codes and headers, but a null body.
webreq.request('https://someurl/files/file1.txt', { method: 'GET', path: 'path/to/files' })
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.log(res);
  });
```
2. Specify path and new filename in a `GET` request:
```js
// Will return status codes and headers, but a null body.
webreq.request('https://someurl/files/file1.txt', { method: 'GET', path: 'path/to/files', filename: 'newname.txt' })
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.log(res);
  });
```
3. As a stream, to pipe to other stream.
```js
const fs = require('fs');
// Will return status codes and headers, but a null body.
webreq.request('https://someurl/files/file1.txt', { method: 'GET', stream: true })
  .then(res => {
    res.pipe(fs.createFileStream('/path/to/files/file.txt'));
  })
  .catch(err => {
    console.log(res);
  });
```

### File uploads (stream)

To upload a file to an endpoint that can handle streams (depending on endpoint other headers might be needed).

1. Send a file from stream:
```js
const fs = require('fs');

let stream = fs.createReadStream(__dirname + '/image.jpg');

let headers = {
  'Content-Disposition': 'attachment; filename="image.jpg"'
  'Content-Length': '<file-size-in-bytes>'
  'Content-Type': 'image/jpg'
}

webreq.request('https://someurl/files', { method: 'PUT', headers: headers, body: stream })
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.log(err);
  });
```

2. Send a file from a path:
```js

let headers = {
  'Content-Disposition': 'attachment; filename="image.jpg"'
  'Content-Length': '<file-size-in-bytes>'
  'Content-Type': 'image/jpg'
}

webreq.request('https://someurl/files', { method: 'PUT', headers: headers, path: '/path/to/image.jpg' })
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.log(err);
  });
```

### TypeScript

#### RequestOptions

```js
/** HTTP method of the request. Default is GET. */
method?: string;
/** Headers of the request. */
headers?: object;
/** Data to send with the request. */
body?: string | object;
/** If true it will check the mime type of the response and output the results accordingly. Default is true.*/
parse?: boolean;
/** If true it will follow redirects found in the 'location' header. */
followRedirects?: boolean;
/** Maximum amount of redirects. */
maxRedirects?: number;
/** When used in a GET request for downloads, it is used as the output path for a file. When used with POST or PUT it will point to a file to upload. */
path?: string;
/** http.Agent/https.Agent object. */
agent?: Agent;
/** Certificate options for the request. */
certificate?: Certificate;
/** Proxy to use for the request. */
proxy?: string;
```

#### Certificate

```js
/** Override the trusted CA certificates. */
ca?: string[] | Buffer[];
/** Certificate chains in PEM format. */
cert?: string | string[] | Buffer | Buffer[];
/** Private keys in PEM format. If encrypted use together with passphrase. */
key?: string | string[] | Buffer | Buffer[];
/** Shared passphrase for a private key and/or PFX. */
passphrase?: string;
/** PFX pr PKCS12 encoded private key and certificate chain. */
pfx?: string[] | Buffer[];
```


## Todo

Before release `v1.0.0` the following needs to be done:

* Test file upload with `multipart/form-data`.
