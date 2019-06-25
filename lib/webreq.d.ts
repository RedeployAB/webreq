interface Buffer {}

class Response {
    /** Status code of the response */
    statusCode: number;
    /** Headers of the response */
    headers: object;
    /** Body of the response */
    body: string|object;
}

declare interface Agent {
    /** Keep sockets around for future requests. */
    keepAlive?: boolean;
    /** Specifies initial delay for Keep-Alive packets in use with the keepAlive option. */
    keepAliveMsecs?: number;
    /**  Maximum number of sockets to allow per host. */
    maxSockets?: number;
    /** Maximum number of sockets to leave open if keepAlive is true. */
    maxFreeSockets?: number;
    /** Socket timeout in milliseconds. */
    timeout?: number;
}

declare interface Certificate {
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

declare interface RequestOptions  {
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
    /** When used in a GET request for downloads, it is used as the output path for a file. */
    path?: string;
    /** 
     * Options object for agent for this request.
     * @param {boolean} [keepAlive] Keep sockets around for future requests.
     * @param {number} [keepAliveMsecs] Specifies initial delay for Keep-Alive packets in use with the keepAlive option.
     * @param {number} [maxSockets] Maximum number of sockets to allow per host.
     * @param {number} [maxFreeSockets] Maximum number of sockets to leave open if keepAlive is true.
     * @param {number} [timeout] Socket timeout in milliseconds.
     */
    agent?: Agent;
    /** 
     * Certificate options for the request.
     * @param {string[] | Buffer[]} [ca] Override the trusted CA certificates.
     * @param {string[] | Buffer[]} [cert] Certificate chains in PEM format.
     * @param {string[] | Buffer[]} [key] Private keys in PEM format. If encrypted use together with passphrase.
     * @param {string} [passphrase] Shared passphrase for a private key and/or PFX.
     * @param {string[] | Buffer[]} [pfx] PFX pr PKCS12 encoded private key and certificate chain.
     */
    certificate: Certificate;
}

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
    * @return {function|Promise<Response>}
    */
    request(uri: string, options?: RequestOptions, callback?: (err: Error, res: Response) => void): Promise<Response | Error> | void;

    /**
    * Performs a HTTP/HTTPS GET request.
    * If the optional callback is used it will return a function, if no callback is used it will
    * return a promise.
    * 
    * @param {string} uri URI of the request.
    * @param {object} [options] Options for the request.
    * @param {function} [callback] Optional callback function.
    * @return {function|Promise<Response>}
    */
    get(uri: string, options?: RequestOptions, callback?: (err: Error, res: Response) => void): Promise<Response | Error> | void;
    
    /**
    * Performs a HTTP/HTTPS POST request.
    * If the optional callback is used it will return a function, if no callback is used it will
    * return a promise.
    * 
    * @param {string} uri URI of the request.
    * @param {object} [options] Options for the request.
    * @param {function} [callback] Optional callback function.
    * @return {function|Promise<Response>}
    */
    post(uri: string, options?: RequestOptions, callback?: (err: Error, res: Response) => void): Promise<Response | Error> | void;

    /**
    * Performs a HTTP/HTTPS PUT request.
    * If the optional callback is used it will return a function, if no callback is used it will
    * return a promise.
    * 
    * @param {string} uri URI of the request.
    * @param {object} [options] Options for the request.
    * @param {function} [callback] Optional callback function.
    * @return {function|Promise<Response>}
    */
    put(uri: string, options?: RequestOptions, callback?: (err: Error, res: Response) => void): Promise<Response | Error> | void;

    /**
    * Performs a HTTP/HTTPS PATCH request.
    * If the optional callback is used it will return a function, if no callback is used it will
    * return a promise.
    * 
    * @param {string} uri URI of the request.
    * @param {object} [options] Options for the request.
    * @param {function} [callback] Optional callback function.
    * @return {function|Promise<Response>}
    */
    patch(uri: string, options?: RequestOptions, callback?: (err: Error, res: Response) => void): Promise<Response | Error> | void;

    /**
    * Performs a HTTP/HTTPS DELETE request.
    * If the optional callback is used it will return a function, if no callback is used it will
    * return a promise.
    * 
    * @param {string} uri URI of the request.
    * @param {object} [options] Options for the request.
    * @param {function} [callback] Optional callback function.
    * @return {function|Promise<Response>}
    */
    delete(uri: string, options?: RequestOptions, callback?: (err: Error, res: Response) => void): Promise<Response | Error> | void;

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

//export let webreq = webreq;
let webreq = new WebReq();
export = webreq;
export let Agent = Agent;
export let Certificate = Certificate;
export let RequestOptions = RequestOptions;
