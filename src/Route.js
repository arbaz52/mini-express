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
   */
  constructor(routePattern, handler) {
    this.routePattern;
    this.routePattern = routePattern;
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
      .split(Route.SPLITER);
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

      if (patternEl[0] === ":") continue;

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

    for (let route of this.children) {
      if (route.patternMatchesUrl(req.url)) {
        const params = route.extractParams(req.url);
        route.entertain(req, res);
        console.debug(`entertaining: ${route.routePattern}, params:`, params);
        return;
      }
    }

    res.write("no response");
    res.end();
  }
};
