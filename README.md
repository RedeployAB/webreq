# webreq

[![Build Status](https://travis-ci.com/RedeployAB/webreq.svg?branch=master)](https://travis-ci.com/RedeployAB/webreq)
[![codecov](https://codecov.io/gh/RedeployAB/webreq/branch/master/graph/badge.svg)](https://codecov.io/gh/RedeployAB/webreq)

> Small and simple module for handling HTTP/HTTPS requests.

* [Information](#information)
* [Install](#install)
* [Usage](#usage)
  * [Methods](#options-and-methods)
  * [File downloads](#file-downloads)
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
// Set maxSockets for all requests.
webreq.globalAgent({ maxSockets: 200 });
// Set maxSockets and maxFreeSockets for all requests (only viable when keepAlive is used in that request).
webreq.globalAgent({ maxSockets: 200, maxFreeSockets: 256 });
```

The following options can be used for each request.

For more information about the agent settings, see: [http.Agent](https://nodejs.org/api/http.html#http_class_http_agent).

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
  // path: Optional: When used in a GET request for downloads, it is used as the  output path for a file.
  path: String,
  // filename: Optional: Used together with path, if a new custom filename is to be used.
  filename: String,
  // agent: Optional. Options object for agent for this request.
  agent: {
    // keepAlive: Optional. Keep sockets around for future requests.
    keepAlive: Number,
    // keepAliveMsecs: Optional. Specifies initial delay for Keep-Alive packets in use with the keepAlive option.
    keepAliveMsecs: Number,
    // maxSockets: Optional: Maximum number of sockets to allow per host.
    maxSockets: Number,
    // maxFreeSockets: Optional: Maximum number of sockets to leave open if keepAlive is true.
    maxFreeSockets: Number,
    // timeout: Optional: Socket timeout in milliseconds.
    timeout: Number
  },
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
  }
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

## Todo

* Test `PATCH`.
* Add file upload functionality.
