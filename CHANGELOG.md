# Changelog

## 0.5.0

* Added support for providing certificate options with HTTPS requests. See further documentation: [https](https://nodejs.org/api/https.html#https_https_request_options_callback) and [tls](https://nodejs.org/api/tls.html#tls_tls_connect_options_callback).
* `bodyOnly` options has been removed. This means by all responses will be of type `Response` (`statusCode`, `headers` and `body`).
* Added **TypeScript** declaration.
* Changed function name from `configureGlobalAgent()` to `globalAgent()`.

## 0.4.0

* Added support for file downloads. Uses `path` and `filename`, specified in `options`.
* Added support for getting response as a stream. Uses `stream`, specified in `options`.

## 0.3.0

* Added support for following redirects from the `location` header. New options added: `followRedirects` and `maxRedirects`. These can
be set on `webreq.followRedirects = true|false` and `webreq.maxRedirects = Number`, as well be passed along in `options` of a call, like so: `{ followRedirects: true, maxRedirects: 3 }`.
* The `options` parameter accept agent settings for creating a new agent on that specific call. Supports the same parameters as the `http` and `https`
modules own agents. See: [http.Agent](https://nodejs.org/api/http.html#http_class_http_agent).
* Added function `configureGlobalAgent()`. Use this to set the global agent settings for all requests. Supports: `maxSockets` and `maxFreeSockets`.

## 0.2.0

### Updates

* Payload (body) for `POST`, `PUT` and `PATCH` requests can handle `JSON` objects and strings.
* Moved header validation and additions for `POST`, `PUT` and `PATCH` requests to `createRequestOptions`.
* Added properties `parse` and `bodyOnly` to `WebReq`. If many requests are to be performed `webreq.bodyOnly` and 
`webreq.parse` can be set respectivley rather than passing the options with each request.

## 0.1.1
Added unit tests and code coverage and did some reorganization.

### Updates

* `lib/request-utils` is now `lib/utils`.
* Moved `httpRequest` from `lib/utils`, renamed it to `_request` and put it into `lib/webreq`.
* Updated the parameter checks of `get()`, `post()`, `put()`, `patch()` and `delete()`.


## 0.1.0
First working and published version of `webreq`.