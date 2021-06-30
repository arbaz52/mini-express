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
  handler;

  /**
   * @param {string} routePattern
   * @param {(req: http.IncomingMessage, res: http.ServerResponse, params: import("./types").IVariables) => void} handler
   * @param {Route[]} children
   */
  constructor(routePattern, handler, children) {
    this.routePattern;
    this.routePattern = routePattern;
    this.children = children;
    this.handler = handler;
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
   */
  entertain(req, res) {
    if (this.handler) {
      this.handler(req, res, this.extractParams(req.url));
      return;
    }

    /**
     * removing the matched route
     */
    const splicedRoute = Route.parseUrl(req.url)
      .splice(Route.parseUrl(this.routePattern).length)
      .join("/");

    console.debug({
      splicedRoute: Route.parseUrl(splicedRoute),
      reqUrl: Route.parseUrl(req.url),
      routePattern: this.routePattern,
    });

    /**
     * extract params likewise, append parent params too
     */
    for (let route of this.children) {
      if (route.patternMatchesUrl(splicedRoute)) {
        const params = route.extractParams(splicedRoute);
        route.entertain(req, res);
        console.debug(`entertaining: ${route.routePattern}, params:`, params);
        return;
      }
    }

    res.write("no response");
    res.end();
  }
};
