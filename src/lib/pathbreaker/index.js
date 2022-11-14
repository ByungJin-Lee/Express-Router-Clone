class PathBreaker {
  #rawUrl = "";
  /**
   * @type {string[]}
   */
  #pieces = [];
  #query = {};

  constructor(url = "") {
    this.#rawUrl = url;
    [this.#pieces, this.#query] = PathBreaker.break(this.#rawUrl);
  }

  shift() {
    return this.#pieces.shift();
  }

  get pieces() {
    return this.#pieces;
  }

  get query() {
    return this.#query;
  }

  get length() {
    return this.#pieces.length;
  }

  /**
   *
   * @param {string} url
   * @returns {[string[], object]}
   */
  static break(url = "") {
    let idx = url.indexOf("?");
    idx = idx === -1 ? url.length : idx;
    const [rawPath, rawQuery] = [url.substring(0, idx), url.substring(idx + 1)];

    return [PathBreaker.#breakPath(rawPath), PathBreaker.#breakQuery(rawQuery)];
  }

  /**
   *
   * @param {string} rawPath
   */
  static #breakPath(rawPath) {
    return rawPath
      .split("/")
      .map((piece) => `/${piece}`)
      .slice(1);
  }

  /**
   *
   * @param {string} rawQuery
   */
  static #breakQuery(rawQuery) {
    if (!rawQuery || rawQuery.length <= 1) return {};

    return rawQuery.split("&").reduce((acc, pair) => {
      const idx = pair.indexOf("=");
      const [key, val] = [pair.substring(0, idx), pair.substring(idx + 1)];
      acc[key] = decodeURIComponent(val);
    }, {});
  }
}

module.exports = PathBreaker;
