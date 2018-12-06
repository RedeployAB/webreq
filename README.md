# webreq

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

`webreq` depends only on the built-in modules `http`, `https` and `url`. And the goal is to keep it that way.

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

The following options can be used.

```js
let options = {
    method: "GET"|"POST"|"PUT"|"DELETE", // Optional. Will default to GET.
    headers: {}, // Optional. Depending on method used and input data is used, Content-Type and Content-Lengt will be checked and enforced.
    body: {}, // Optional for GET requests. Mandatory for POST, PUT, PATCH. The data to send with the request.
    parse: true|false, // Optional. Default is true. If true it will try to parse the response according to MIME-type, if false will return pure string.
    bodyOnly: true|false, // Optional. Default is true. If true it will only return the response body, if false it will return a Response object, statusCode, headers and body.
}
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

* Test/Add `PATCH`.
* Add file upload/download functionality.