class Router {
  static context;
  static routes = {};
  static notFound = "Not Found";

  static refresh() {
    let currentRoute = window.location.hash.replace("#", "");
    if (currentRoute == "") {
      currentRoute = "/";
    }

    if (Router.routes[currentRoute] != undefined) {
      Router.context.innerHTML = Router.routes[currentRoute];
    } else {
      Router.context.innerHTML = Router.notFound;
    }
  }

  static add(route, html) {
    Router.routes[route] = html;
  }

  static mount(target) {
    Router.context = document.getElementById(target);
    Router.refresh();
    addEventListener("hashchange", Router.refresh);
  }
}