/**
 * REST Client sederhana seperti axios - Versi Standalone
 * @class RestClient
 */
(function(global) {
  'use strict';
  
  class RestClientError extends Error {
    constructor(message, status, data) {
      super(message);
      this.name = 'RestClientError';
      this.status = status;
      this.data = data;
    }
  }

  class RestClient {
    constructor(config = {}) {
      this.defaultConfig = {
        baseURL: '',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
        ...config
      };
      
      this.interceptors = {
        request: [],
        response: []
      };
    }

    /**
     * Tambah interceptor untuk request
     */
    useRequestInterceptor(interceptor) {
      this.interceptors.request.push(interceptor);
      return this;
    }

    /**
     * Tambah interceptor untuk response
     */
    useResponseInterceptor(interceptor) {
      this.interceptors.response.push(interceptor);
      return this;
    }

    /**
     * Eksekusi interceptor request
     */
    async _applyRequestInterceptors(config) {
      let currentConfig = { ...config };
      
      for (const interceptor of this.interceptors.request) {
        currentConfig = await interceptor(currentConfig);
      }
      
      return currentConfig;
    }

    /**
     * Eksekusi interceptor response
     */
    async _applyResponseInterceptors(response) {
      let currentResponse = { ...response };
      
      for (const interceptor of this.interceptors.response) {
        currentResponse = await interceptor(currentResponse);
      }
      
      return currentResponse;
    }

    /**
     * Buat request HTTP
     */
    async _request(method, url, data = null, config = {}) {
      const mergedConfig = {
        ...this.defaultConfig,
        ...config,
        method: method.toUpperCase(),
        headers: {
          ...this.defaultConfig.headers,
          ...(config.headers || {})
        }
      };

      // Gabungkan baseURL dengan endpoint
      const fullURL = mergedConfig.baseURL ? 
        `${mergedConfig.baseURL}${url}` : url;

      // Terapkan interceptor request
      const finalConfig = await this._applyRequestInterceptors({
        ...mergedConfig,
        url: fullURL
      });

      // Setup controller untuk timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), finalConfig.timeout);

      try {
        const options = {
          method: finalConfig.method,
          headers: finalConfig.headers,
          signal: controller.signal
        };

        // Tambah body untuk method yang memerlukan
        if (data && ['POST', 'PUT', 'PATCH'].includes(finalConfig.method)) {
          if (finalConfig.headers['Content-Type'] === 'application/json') {
            options.body = JSON.stringify(data);
          } else {
            options.body = data;
          }
        }

        // Tambah query params jika ada
        let requestUrl = finalConfig.url;
        if (finalConfig.params) {
          const urlObj = new URL(requestUrl);
          Object.keys(finalConfig.params).forEach(key => {
            if (finalConfig.params[key] !== undefined) {
              urlObj.searchParams.append(key, finalConfig.params[key]);
            }
          });
          requestUrl = urlObj.toString();
        }

        // Eksekusi fetch
        const response = await fetch(requestUrl, options);
        clearTimeout(timeoutId);

        // Parse response
        let responseData;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }

        // Buat response object
        const responseObj = {
          data: responseData,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          config: finalConfig,
          request: { url: requestUrl, method: finalConfig.method }
        };

        // Handle error status
        if (!response.ok) {
          throw new RestClientError(
            `Request failed with status code ${response.status}`,
            response.status,
            responseObj
          );
        }

        // Terapkan interceptor response
        return await this._applyResponseInterceptors(responseObj);
        
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
          throw new RestClientError('Request timeout', 408);
        }
        
        if (error instanceof RestClientError) {
          throw error;
        }
        
        throw new RestClientError(error.message, 0);
      }
    }

    /**
     * GET request
     */
    get(url, config = {}) {
      return this._request('GET', url, null, config);
    }

    /**
     * POST request
     */
    post(url, data = {}, config = {}) {
      return this._request('POST', url, data, config);
    }

    /**
     * PUT request
     */
    put(url, data = {}, config = {}) {
      return this._request('PUT', url, data, config);
    }

    /**
     * PATCH request
     */
    patch(url, data = {}, config = {}) {
      return this._request('PATCH', url, data, config);
    }

    /**
     * DELETE request
     */
    delete(url, config = {}) {
      return this._request('DELETE', url, null, config);
    }

    /**
     * Buat instance dengan konfigurasi custom
     */
    create(config = {}) {
      return new RestClient({
        ...this.defaultConfig,
        ...config
      });
    }
  }

  /**
   * Factory function untuk membuat instance
   */
  function createClient(config = {}) {
    return new RestClient(config);
  }

  /**
   * Request langsung tanpa membuat instance
   */
  const request = {
    get: (url, config) => createClient().get(url, config),
    post: (url, data, config) => createClient().post(url, data, config),
    put: (url, data, config) => createClient().put(url, data, config),
    patch: (url, data, config) => createClient().patch(url, data, config),
    delete: (url, config) => createClient().delete(url, config)
  };

  // Ekspos ke global object
  global.RestClient = RestClient;
  global.RestClientError = RestClientError;
  global.createClient = createClient;
  global.request = request;
  
  // Buat default export
  global.restClient = createClient();

})(window);
