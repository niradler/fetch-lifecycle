let fetchLib;
let isNode = false;

if (typeof process === "object" && typeof window === "undefined") {
  const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));
  fetchLib = fetch;
  isNode = true;
} else {
  fetchLib = fetch;
}

class HttpError extends Error {
  constructor(message, status = 500) {
    super(message, status);
    this.status = status;
  }
}

class FetchLifecycle {
  constructor(url, options, lifecycle) {
    this.baseUrl = url || "";
    this.defaultOptions = options || {};
    this.lifecycle = lifecycle || {};
  }

  addCallbacks(hook, callbacks, override = false) {
    if (!this.lifecycle[hook]) {
      this.lifecycle[hook] = [];
    }
    if (override) this.lifecycle[hook] = callbacks;
    else this.lifecycle[hook] = [...this.lifecycle[hook], ...callbacks];
  }

  async callbacksLoop(hook, req, res, error) {
    const self = { hook, req, res, error };
    if (Array.isArray(this.lifecycle[hook])) {
      for (let i = 0; i < this.lifecycle[hook].length; i++) {
        const fn = this.lifecycle[hook][i];
        const fnBind = fn.bind(self);
        await fnBind(req, res, error);
      }
    }

    return self;
  }

  before(callbacks, override = false) {
    this.addCallbacks("before", callbacks, override);
  }

  after(callbacks, override = false) {
    this.addCallbacks("after", callbacks, override);
  }

  error(callbacks, override = false) {
    this.addCallbacks("error", callbacks, override);
  }

  success(callbacks, override = false) {
    this.addCallbacks("success", callbacks, override);
  }

  async request(url = "", options = {}) {
    const rawReq = {
      url: new URL(url, this.baseUrl).href,
      options: { ...this.defaultOptions, ...options },
    };
    let req = rawReq;
    let _request = {};
    try {
      Object.assign(_request, await this.callbacksLoop("before", req));
      _request.res = await fetchLib(req.url, req.options);

      if (_request.res.status >= 200 && _request.res.status <= 299) {
        Object.assign(
          _request,
          await this.callbacksLoop("success", req, _request.res)
        );
      } else {
        Object.assign(
          _request,
          await this.callbacksLoop(
            "error",
            req,
            null,
            new HttpError(_request.res.statusText, _request.res.status)
          )
        );
      }
    } catch (error) {
      throw error;
    } finally {
      Object.assign(
        _request,
        await this.callbacksLoop("after", req, _request.res, _request.error)
      );
    }
    return _request;
  }
}

if (isNode) module.exports = FetchLifecycle;
else window.FetchLifecycle = FetchLifecycle;
