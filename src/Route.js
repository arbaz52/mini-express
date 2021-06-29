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
   * @param {string} routePattern
   */
  constructor(routePattern) {
    this.routePattern;
    this.routePattern = routePattern;
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

      if (!patternEl || !pathEl) return false;

      if (patternEl[0] === ":") continue;

      if (patternEl !== pathEl) return false;
    }
    return true;
  }
};
