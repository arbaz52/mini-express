const http = require("http");
module.exports = class Route {
  static SPLITER = " ";
  /**
   * @type {Route[]}
   */
  children = [];

  /**
   * @type {string | boolean}
   */
  routePattern;

  /**
   * @type {(req: http.IncomingMessage, res: http.ServerResponse, params: import("./types").IVariables) => void}
   */
  fallback;

  /**
   * @param {string} routePattern
   * @param {(req: http.IncomingMessage, res: http.ServerResponse, params: import("./types").IVariables) => void} fallback
   * @param {Route[]} children
   */
  constructor(routePattern, fallback, children = []) {
    this.routePattern;
    this.routePattern = routePattern;
    this.children = children;
    this.fallback = fallback;
  }

  /**
   *
   * @param {string} url
   * @returns {string[]}
   */
  static parseUrl(url) {
    return url
      .replace(new RegExp("/", "g"), Route.SPLITER)
      .trim()
      .split(Route.SPLITER)
      .filter((sub) => !!sub);
  }

  /**
   * @param {string} url
   */
  extractParams(url) {
    const path = Route.parseUrl(url);
    const pattern = Route.parseUrl(this.routePattern);

    /**
     * @type {import("./types").IVariables}
     */
    let variables = {};

    for (let i = 0; i < pattern.length; i++) {
      const pathEl = path[i];
      const patternEl = pattern[i];

      if (patternEl[0] === ":") {
        variables = { ...variables, [patternEl.slice(1)]: pathEl };
      }
    }
    return variables;
  }

  /**
   *
   * @param {string} url
   * @returns {boolean}
   */
  patternMatchesUrl(url) {
    const path = Route.parseUrl(url);
    const pattern = Route.parseUrl(this.routePattern);
    for (let i = 0; i < pattern.length; i++) {
      const pathEl = path[i];
      const patternEl = pattern[i];

      if (patternEl === undefined || pathEl === undefined) return false;

      if (patternEl[0] === ":" && pathEl !== "") continue;

      if (patternEl !== pathEl) return false;
    }
    return true;
  }

  /**
   *
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   * @param {import("./types").IVariables} params
   */
  entertain(req, res, params) {
    /**
     * removing the matched route
     */
    const splicedRoute = Route.parseUrl(req.url)
      .splice(Route.parseUrl(this.routePattern).length)
      .join("/");

    const allParams = {
      ...(!!params ? params : {}),
      ...this.extractParams(splicedRoute),
    };

    console.debug({
      splicedRoute: Route.parseUrl(splicedRoute),
      reqUrl: Route.parseUrl(req.url),
      routePattern: this.routePattern,
      extractedParams: this.extractParams(splicedRoute),
      givenParams: params,
      allParams,
    });

    /**
     * extract params likewise, append parent params too
     */
    for (let route of this.children) {
      if (route.patternMatchesUrl(splicedRoute)) {
        route.entertain(req, res, allParams);
        console.debug(`child: ${route.routePattern}, params:`, allParams);
        return true;
      }
    }

    if (this.fallback) {
      console.debug(
        `fallback: ${this.routePattern} for route; ${
          req.url
        }, with params: ${JSON.stringify(allParams)}`
      );
      this.fallback(req, res, {
        ...(!!params ? params : {}),
        ...this.extractParams(splicedRoute),
      });
      return true;
    }
  }
};
