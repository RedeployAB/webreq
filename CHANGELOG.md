# Changelog

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