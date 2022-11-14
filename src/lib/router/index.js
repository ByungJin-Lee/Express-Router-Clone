const http = require("http");
const PathBreaker = require("../pathbreaker");

//#region Type Define
/**
 * @typedef {"DELETE" | "PUT" | "POST" | "GET" | "ALL"} HttpMethod Restful API Method
 * @typedef {string | RegExp} RoutePath
 * @typedef {RouteCallback | Router} RouteListener
 * @typedef {http.IncomingMessage & {query: Object}} Request
 */

/**
 * 다음 Route Handle에게 제어를 넘김. (호출하지 않는 경우, 현재 Handle에서 종료됨.)
 * @typedef { () => void } Next
 */

/**
 * @callback RouteCallback
 * @param {Request} request
 * @param {http.ServerResponse} response
 * @param {Next} next
 * @returns {void}
 */

/**
 * @typedef {Object} Route
 * @property {HttpMethod} method
 * @property {RoutePath} path
 * @property {RouteListener} listener
 */
//#endregion

class Router {
  /**
   * @type {Route[]}
   */
  #routes = [];

  constructor() {
    this.listener = this.listener.bind(this);
  }

  get routes() {
    return this.#routes;
  }

  /**
   *
   * @param {HttpMethod} method
   * @param {RoutePath} path
   * @param {RouteListener} listener
   */
  route(method, path, listener) {
    if (path === "*") path = /[\s\S]*/;

    // 라우터 리스트에 등록
    this.#routes.push({
      method,
      path,
      listener,
    });
  }

  /**
   *
   * @param {RoutePath} path
   * @param {RouteCallback} listener
   */
  delete(path, listener) {
    this.route("DELETE", path, listener);
  }

  /**
   *
   * @param {RoutePath} path
   * @param {RouteCallback} listener
   */
  put(path, listener) {
    this.route("PUT", path, listener);
  }
  /**
   *
   * @param {RoutePath} path
   * @param {RouteCallback} listener
   */
  get(path, listener) {
    this.route("GET", path, listener);
  }
  /**
   *
   * @param {RoutePath} path
   * @param {RouteCallback} listener
   */
  post(path, listener) {
    this.route("POST", path, listener);
  }
  /**
   *
   * @param {RoutePath | RouteListener} coming
   * @param {RouteListener?} listener
   */
  use(coming, listener) {
    if (typeof coming === "string" || coming instanceof RegExp) {
      this.route("ALL", coming, listener);
    } else {
      this.route("ALL", "*", coming);
    }
  }

  /**
   * @param {HttpMethod} method
   * @param {string} piece Client 접속 경로 조각
   * @param {Route[]} routes
   */
  static filterRoutes(method, piece, routes) {
    const filteredMethods = routes.filter((route) => {
      return route.method === "ALL" || method === route.method;
    });

    const filterPaths = filteredMethods.filter((route) => {
      // 문자열 라우팅
      if (typeof route.path === "string") {
        return route.path === piece;
      } else {
        // 정규식 라우팅
        return route.path.test(piece);
      }
    });

    return filterPaths;
  }

  /**
   *
   * @param {Route[]} routes
   * @returns {Route[]}
   */
  static destructuringRouter(routes) {
    return routes.reduce((acc, route) => {
      // 그냥 함수 Listener 인 경우 그냥 놔둠
      if (typeof route.listener === "function") {
        acc.push(route);
      } else {
        // 만약 Listener 가 Router 클래스인 경우 (중첩된 Router) 한 번 포장을 푼다.
        acc = acc.concat(route.listener.routes);
      }
      return acc;
    }, []);
  }
  /**
   * @type {http.RequestListener<typeof http.IncomingMessage, typeof http.ServerResponse>}
   */
  listener(request, response) {
    const pathBreaker = new PathBreaker(request.url);
    request.query = pathBreaker.query;

    let piece,
      routes = this.#routes;
    while ((piece = pathBreaker.shift()) != undefined) {
      routes = Router.filterRoutes(request.method, piece, routes);
      routes = Router.destructuringRouter(routes);
    }

    if (Array.isArray(routes)) {
      /**
       * @type {Route}
       */
      let ru;
      let isNext = true;

      const next = () => {
        isNext = true;
      };
      const iterator = routes[Symbol.iterator]();

      while (isNext && (ru = iterator.next().value) != undefined) {
        isNext = false;
        ru.listener(request, response, next);
      }
    }
  }
}

module.exports = () => {
  return new Router();
};
