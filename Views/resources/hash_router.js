class HashRouter {
  constructor(templateEngine, routes, rootElement) {
    this.engine = templateEngine;
    this.routes = routes;
    this.root = rootElement || document.getElementById('app');
    this.currentRoute = null;
    this.currentParams = {};

    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  }

  handleRoute() {
    const hash = window.location.hash.substring(1) || '/';
    const matchedRoute = this.findMatchingRoute(hash);

    if (!matchedRoute) {
      this.show404();
      return;
    }

    const { route, params } = matchedRoute;

    if (this.currentRoute && this.currentRoute.path === route.path) {
      return; // Skip jika route sama
    }

    this.currentRoute = route;
    this.currentParams = params;

    // Load data jika ada fungsi data provider
    if (typeof route.data === 'function') {
      const routeData = route.data(params);

      if (routeData.then) {
        // Handle promise
        routeData.then(data => {
          this.renderRoute(route, { ...params, ...data });
        });
        return;
      }

      // Sync data
      this.renderRoute(route, { ...params, ...routeData });
    } else {
      this.renderRoute(route, params);
    }
  }

  findMatchingRoute(hash) {
    for (const route of this.routes) {
      const match = this.matchRoute(route.path, hash);
      if (match) {
        return { route, params: match };
      }
    }
    return null;
  }

  matchRoute(routePath, hashPath) {
    const routeParts = routePath.split('/');
    const hashParts = hashPath.split('/');
    const params = {};

    if (routeParts.length !== hashParts.length) {
      return null;
    }

    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      const hashPart = hashParts[i];

      if (routePart.startsWith(':')) {
        const paramName = routePart.substring(1);
        params[paramName] = hashPart;
      } else if (routePart !== hashPart) {
        return null;
      }
    }

    return params;
  }

  renderRoute(route, data) {
    if (route.redirect) {
      this.navigate(route.redirect);
      return;
    }

    if (route.template) {
      this.engine.render(route.template, data, this.root);
    } else if (route.component) {
      this.engine.render(`<${route.component} />`, data, this.root);
    }
  }

  show404() {
    const notFoundRoute = this.routes.find(r => r.path === '404');
    if (notFoundRoute) {
      this.renderRoute(notFoundRoute, {});
    } else {
      this.root.innerHTML = '<h1>404 - Halaman tidak ditemukan</h1>';
    }
  }

  navigate(path) {
    window.location.hash = path;
  }

  getCurrentParams() {
    return this.currentParams;
  }
}