class RestClient {
  constructor(baseUrl = '', options = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Accept': 'application/json',
      ...options.headers
    };
    this.authToken = options.authToken || '';
    this.errorHandler = options.errorHandler || this.defaultErrorHandler;
  }

  setAuthToken(token) {
    this.authToken = token;
  }

  async request(endpoint, method = 'GET', data = null, isFileUpload = false) {
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
      if (isFileUpload) {
        // Untuk upload file, tidak menggunakan JSON
        delete headers['Content-Type']; // Biarkan browser set Content-Type
        config.body = this.prepareFormData(data);
      } else {
        config.body = JSON.stringify(data);
      }
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

  prepareFormData(data) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof FileList) {
        // Handle multiple files
        Array.from(value).forEach(file => {
          formData.append(key, file);
        });
      } else if (value instanceof File) {
        // Handle single file
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        // Handle array of files or other data
        value.forEach(item => {
          if (item instanceof File) {
            formData.append(key, item);
          } else {
            formData.append(key, JSON.stringify(item));
          }
        });
      } else {
        // Handle regular fields
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
      }
    });

    return formData;
  }

  // ... (parseResponse, parseError, defaultErrorHandler tetap sama)

  // Standard CRUD methods
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

  // File upload methods
  upload(endpoint, fileData) {
    return this.request(endpoint, 'POST', fileData, true);
  }

  uploadPut(endpoint, fileData) {
    return this.request(endpoint, 'PUT', fileData, true);
  }

  uploadPatch(endpoint, fileData) {
    return this.request(endpoint, 'PATCH', fileData, true);
  }
}