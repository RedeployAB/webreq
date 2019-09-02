declare class WebReq {
    constructor();
    /** Returns response as a stream */
    stream: boolean;
    /** If true it will check the mime type of the response and output the results accordingly. Default is true.*/
    parse: boolean;
    /** If true it will follow redirects found in the 'location' header. */
    followRedirects: boolean;
    /** Maximum amount of redirects. */
    maxRedirects: Number;

    /**
    * Performs a HTTP/HTTPS request.
    * If the optional callback is used it will return a function, if no callback is used it will
    * return a promise.
    * 
    * @param {string} uri URI of the request.
    * @param {object} [options] Options for the request.
    * @param {function} [callback] Optional callback function.
    * @return {function|Promise<WebReq.Response>}
    */
    request(
        uri: string,
        options?: WebReq.RequestOptions,
        callback?: (err: Error, res: WebReq.Response) => void
    ): Promise<WebReq.Response | Error> | void;

    /**
    * Performs a HTTP/HTTPS GET request.
    * If the optional callback is used it will return a function, if no callback is used it will
    * return a promise.
    * 
    * @param {string} uri URI of the request.
    * @param {object} [options] Options for the request.
    * @param {function} [callback] Optional callback function.
    * @return {function|Promise<WebReq.Response>}
    */
    get(uri: string,
        options?: WebReq.RequestOptions,
        callback?: (err: Error, res: WebReq.Response) => void
    ): Promise<WebReq.Response | Error> | void;
    
    /**
    * Performs a HTTP/HTTPS POST request.
    * If the optional callback is used it will return a function, if no callback is used it will
    * return a promise.
    * 
    * @param {string} uri URI of the request.
    * @param {object} [options] Options for the request.
    * @param {function} [callback] Optional callback function.
    * @return {function|Promise<WebReq.Response>}
    */
    post(
        uri: string,
        options?: WebReq.RequestOptions,
        callback?: (err: Error, res: WebReq.Response) => void
    ): Promise<WebReq.Response | Error> | void;

    /**
    * Performs a HTTP/HTTPS PUT request.
    * If the optional callback is used it will return a function, if no callback is used it will
    * return a promise.
    * 
    * @param {string} uri URI of the request.
    * @param {object} [options] Options for the request.
    * @param {function} [callback] Optional callback function.
    * @return {function|Promise<WebReq.Response>}
    */
    put(
        uri: string,
        options?: WebReq.RequestOptions,
        callback?: (err: Error, res: WebReq.Response) => void
    ): Promise<WebReq.Response | Error> | void;

    /**
    * Performs a HTTP/HTTPS PATCH request.
    * If the optional callback is used it will return a function, if no callback is used it will
    * return a promise.
    * 
    * @param {string} uri URI of the request.
    * @param {object} [options] Options for the request.
    * @param {function} [callback] Optional callback function.
    * @return {function|Promise<WebReq.Response>}
    */
    patch(
        uri: string,
        options?: WebReq.RequestOptions,
        callback?: (err: Error, res: WebReq.Response) => void
    ): Promise<WebReq.Response | Error> | void;

    /**
    * Performs a HTTP/HTTPS DELETE request.
    * If the optional callback is used it will return a function, if no callback is used it will
    * return a promise.
    * 
    * @param {string} uri URI of the request.
    * @param {object} [options] Options for the request.
    * @param {function} [callback] Optional callback function.
    * @return {function|Promise<WebReq.Response>}
    */
    delete(
        uri: string,
        options?: WebReq.RequestOptions,
        callback?: (err: Error, res: WebReq.Response) => void
    ): Promise<WebReq.Response | Error> | void;

   /**
   * Configures the global agent for the requests.
   * If no parameter is passed, it will set default vaules of maxSockets: Infinity, maxFreeSockets: 256.
   * @param {object} [options] Options object.
   * @param {number} [options.maxSockets] Maximum number of sockets to allow per host.
   * @param {number} [options.maxFreeSockets] Maximum number of sockets to leave open if keepAlive is true.
   * @return {void}
   */
    globalAgent(options: object): void;
}

interface Buffer {}

declare namespace WebReq {

    class Response {
        /** Status code of the response */
        statusCode: number;
        /** Headers of the response */
        headers: object;
        /** Body of the response */
        body: string|object;
    }

    interface RequestOptions  {
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
        /**
         * Certificate options for the request.
         * @param {string[] | Buffer[]} [ca] Override the trusted CA certificates.
         * @param {string[] | Buffer[]} [cert] Certificate chains in PEM format.
         * @param {string[] | Buffer[]} [key] Private keys in PEM format. If encrypted use together with passphrase.
         * @param {string} [passphrase] Shared passphrase for a private key and/or PFX.
         * @param {string[] | Buffer[]} [pfx] PFX pr PKCS12 encoded private key and certificate chain.
         */
        certificate?: Certificate;
        /** Proxy to use for the request. */
        proxy?: string;
    }

    interface Agent {}

    interface Certificate {
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
    }
}

export = new WebReq();
