class RestClient {
  constructor(baseUrl = '', options = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    this.authToken = options.authToken || '';
    this.errorHandler = options.errorHandler || this.defaultErrorHandler;
  }

  setAuthToken(token) {
    this.authToken = token;
  }

  async request(endpoint, method = 'GET', data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = { ...this.defaultHeaders };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const config = {
      method,
      headers,
      credentials: 'include'
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw await this.parseError(response);
      }

      return await this.parseResponse(response);
    } catch (error) {
      this.errorHandler(error);
      throw error;
    }
  }

  async parseResponse(response) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return await response.text();
  }

  async parseError(response) {
    try {
      const errorData = await this.parseResponse(response);
      return {
        status: response.status,
        message: errorData.message || 'Request failed',
        details: errorData.details || errorData
      };
    } catch (e) {
      return {
        status: response.status,
        message: 'Request failed'
      };
    }
  }

  defaultErrorHandler(error) {
    console.error('API Error:', error);
    // Anda bisa menambahkan notifikasi UI di sini
  }

  // Helper methods untuk HTTP verbs
  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, data) {
    return this.request(endpoint, 'POST', data);
  }

  put(endpoint, data) {
    return this.request(endpoint, 'PUT', data);
  }

  patch(endpoint, data) {
    return this.request(endpoint, 'PATCH', data);
  }

  delete(endpoint) {
    return this.request(endpoint, 'DELETE');
  }
}