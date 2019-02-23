# webreq

[![Build Status](https://travis-ci.com/RedeployAB/webreq.svg?branch=master)](https://travis-ci.com/RedeployAB/webreq)
[![codecov](https://codecov.io/gh/RedeployAB/webreq/branch/master/graph/badge.svg)](https://codecov.io/gh/RedeployAB/webreq)

Small and simple module for handling HTTP/HTTPS requests.

* [Information](#information)
* [Install](#install)
* [Usage](#usage)
  * [Methods](#options-and-methods)
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
// parse: Optional. Default is true. If true it will try to parse the response according to MIME type, if false will return pure string.
webreq.parse = true|false
// bodyOnly: Optional. Default is true. If true it will only return the response body, if false it will return a Response object, statusCode, headers and body.
webreq.bodyOnly = true|false
// followRedirects: Optional. Default is false. If true it will follow redirects found in the 'location' header.
webreq.followRedirects true|false
// maxRedirects: Optional. Default is 3.
webreq.maxRedirects: Number
```

The following options can be used for each request.

```js
let options = {
    // method: Optional. Will default to GET.
    method: "GET"|"POST"|"PUT"|"DELETE", 
    // headers: Optional. Depending on method used and input data is used, Content-Type and Content-Lengt will be checked and enforced.
    headers: {}, 
    // body: Optional for GET requests. Mandatory for POST, PUT, PATCH. The data to send with the request.
    body: {}, 
    // parse: Optional. Default is true. If true it will try to parse the response according to MIME type, if false will return pure string.
    // Overrides the settings put on webreq.
    parse: true|false,
    // bodyOnly: Optional. Default is true. If true it will only return the response body, if false it will return a Response object, statusCode, headers and body.
    // Overrides the settings put on webreq.
    bodyOnly: true|false, 
    // followRedirects: Optional. Default is false. If true it will follow redirects found in the 'location' header.
    // Overrides the settings put on webreq.
    followRedirects: true|false
    // maxRedirects: Optional. Default is 3. Maximum amount of redirects.
    // Overrides the settings put on webreq.
    maxRedirects: Number
}
```

#### Output

Depending on the set of options being used, output will differ.
If `bodyOnly` is set to true (default behaviour), it will only return the response body like so:

```js
webreq.get('https://someurl', { bodyOnly: true, parse: true }).then(res => {
    console.log(res);  // { message: 'hello' } - object 
});
```

If it's set to `false` it will return a `Response` object containing `statusCode`, `headers` and `body`, like so:

```js
webreq.get('https://someurl', { bodyOnly: false, parse: true }).then(res => {
    console.log(res.statusCode);    // 200                                      - number
    console.log(res.headers);       // { 'content-type': 'application/json' }   - object
    console.log(res.body);          // { message: 'hello' }                     - object 
});
```

If `parse` is set to true (default behaviour), it will attempt to parse the body according to it's MIME type (`JSON` is currently supported).
The example above shows this behaviour.

```js
webreq.get('https://someurl', { bodyOnly: true, parse: false }).then(res => {
    console.log(res);  // '{"message":'hello'}" - string
});
```

If it's set to `false` it will attempt to parse the body.

```js
webreq.get('https://someurl', { bodyOnly: false, parse: false }).then(res => {
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
webreq.put(uri, [options], [callback]);
```

#### `delete()`

Uses `request()` but enforces `method: DELETE` in it's options.

```js
webreq.delete(uri, [options], [callback]);
```

## Todo

* Test `PATCH`.
* Add file upload/download functionality.