class HashRouter {
  constructor(templateEngine, routes, rootElement) {
    this.engine = templateEngine;
    this.routes = routes;
    this.root = this._getElement(rootElement);
    this.currentRoute = null;
    this.currentParams = {};
    this.currentData = null;
    this.routeCache = new Map(); // Cache untuk data route
    
    this._setupEventListeners();
    this._handleInitialRoute();
  }

  _getElement(selectorOrElement) {
    if (typeof selectorOrElement === 'string') {
      return document.querySelector(selectorOrElement);
    }
    return selectorOrElement;
  }

  _setupEventListeners() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('popstate', () => {
      setTimeout(() => this.handleRoute(), 0);
    });
  }

  _handleInitialRoute() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => this.handleRoute(), 100);
      });
    } else {
      setTimeout(() => this.handleRoute(), 100);
    }
  }

  async handleRoute() {
    const hash = this._getCurrentHash();
    const matched = this.findMatchingRoute(hash);
    
    if (!matched) {
      this.show404();
      return;
    }

    const { route, params } = matched;
    
    // Skip jika route sama (kecuali force refresh)
    if (this.currentRoute?.path === route.path && 
        JSON.stringify(this.currentParams) === JSON.stringify(params)) {
      return;
    }

    // Unmount previous route
    await this._unmountPreviousRoute();
    
    // Update current state
    this.currentRoute = route;
    this.currentParams = params;
    
    // Mount new route
    await this._mountRoute(route, params);
  }

  _getCurrentHash() {
    const hash = window.location.hash.substring(1);
    return hash || '/';
  }

  findMatchingRoute(hashPath) {
    for (const route of this.routes) {
      const match = this.matchRoute(route.path, hashPath);
      if (match) {
        return { route, params: match };
      }
    }
    return null;
  }

  matchRoute(routePath, hashPath) {
    const routeParts = routePath.split('/').filter(p => p);
    const hashParts = hashPath.split('/').filter(p => p);
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

  async _mountRoute(route, params) {
    try {
      // Get route data
      let routeData;
      const routeKey = `${route.path}_${JSON.stringify(params)}`;
      
      if (this.routeCache.has(routeKey)) {
        routeData = this.routeCache.get(routeKey);
      } else {
        const baseData = typeof route.data === 'function' 
          ? await Promise.resolve(route.data(params))
          : route.data || {};
        
        // Combine with params
        routeData = { 
          ...baseData, 
          ...params,
          __params: params // Non-enumerable internal property
        };
        
        // Make __params non-enumerable
        Object.defineProperty(routeData, '__params', {
          enumerable: false,
          writable: true
        });
        
        // Cache the data
        this.routeCache.set(routeKey, routeData);
      }

      // Store current data
      this.currentData = routeData;

      // Disable cache untuk engine selama render route
      const originalUseCache = this.engine.options.useCache;
      this.engine.options.useCache = false;

      // Render
      if (route.template) {
        this.engine.render(route.template, routeData, this.root);
      } else if (route.component) {
        const componentTemplate = `<${route.component} />`;
        this.engine.render(componentTemplate, routeData, this.root);
      }

      // Restore cache setting
      this.engine.options.useCache = originalUseCache;

      // Call onMount hook
      if (route.onMount) {
        await Promise.resolve(route.onMount(routeData, params, this.root));
      }

    } catch (error) {
      console.error('Error mounting route:', error);
      this.showError(error);
    }
  }

  async _unmountPreviousRoute() {
    if (!this.currentRoute) return;

    try {
      // Call onUnmount hook
      if (this.currentRoute.onUnmount) {
        await Promise.resolve(this.currentRoute.onUnmount(this.currentData, this.root));
      }
    } catch (error) {
      console.error('Error unmounting route:', error);
    }
  }

  show404() {
    const notFoundRoute = this.routes.find(r => r.path === '404');
    if (notFoundRoute) {
      this.currentRoute = notFoundRoute;
      this.currentParams = {};
      this.currentData = {};
      this.engine.render(notFoundRoute.template, {}, this.root);
    } else {
      this.root.innerHTML = '<h1>404 - Page Not Found</h1>';
    }
  }

  showError(error) {
    this.root.innerHTML = `
      <div style="padding: 20px; color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb;">
        <h1>Error Loading Page</h1>
        <p>${error.message || 'An unexpected error occurred'}</p>
        <button onclick="router.navigate('/')" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Go Home
        </button>
      </div>
    `;
  }

  navigate(path, options = {}) {
    const { replace = false, data = {} } = options;
    
    if (replace) {
      window.location.replace(`#${path}`);
    } else {
      window.location.hash = path;
    }
    
    // Store data for next route
    if (Object.keys(data).length > 0) {
      sessionStorage.setItem(`router:data:${path}`, JSON.stringify(data));
    }
  }
}
