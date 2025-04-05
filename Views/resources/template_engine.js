class TemplateEngine {
  constructor(options = {}) {
    this.options = {
      delimiters: { start: '{{', end: '}}' },
      bindPrefix: 'bind:',
      ...options
    };
    this.components = {};
    this._templateCache = new Map();
    this._componentCache = new Map();
  }

  registerComponent(name, template) {
    if (typeof template !== 'string') {
      throw new Error(`Component "${name}" template must be a string`);
    }
    if (!/^[A-Z]/.test(name)) {
      console.warn(`Component "${name}" should start with uppercase letter (JSX convention)`);
    }
    this.components[name] = template;
    this._componentCache.delete(name);
  }

  render(template, data, container = null) {
    try {
      const templateStr = this._ensureString(template);
      const cacheKey = this._generateCacheKey(templateStr, data);

      if (this._templateCache.has(cacheKey)) {
        const cached = this._templateCache.get(cacheKey);
        if (container && this._isDOMElement(container)) {
          container.innerHTML = cached;
        }
        return cached;
      }

      let result = this._processComponents(templateStr, data);
      result = this._processConditionals(result, data);
      result = this._processLoops(result, data);
      result = this._processBindings(result, data);
      result = this._processExpressions(result, data);

      if (this._templateCache.size >= 100) {
        this._templateCache.delete(this._templateCache.keys().next().value);
      }
      this._templateCache.set(cacheKey, result);

      if (container && this._isDOMElement(container)) {
        container.innerHTML = result;
      } else if (container) {
        console.log(container)
        console.warn('Container is not a valid DOM element');
      }

      return result;
    } catch (error) {
      console.error('TemplateEngine render error:', error);
      return '';
    }
  }

  _isDOMElement(element) {
    try {
      return element instanceof HTMLElement ||
        (element && typeof element.innerHTML === 'string');
    } catch (e) {
      return false;
    }
  }

  _processComponents(template, data) {
    const templateStr = this._ensureString(template);
    // Pattern for: <Component /> or <Component attr="value">content</Component>
    const componentPattern = /<([A-Z][a-zA-Z0-9]*)(?:\s+([^>]*))?(?:\/>|>([\s\S]*?)<\/\1>)/g;

    return templateStr.replace(componentPattern, (match, name, attrs, slotContent) => {
      if (!this.components[name]) {
        console.error(`Component "${name}" is not registered`);
        return match;
      }

      const cacheKey = `${name}_${attrs}_${slotContent}`;
      if (this._componentCache.has(cacheKey)) {
        return this._componentCache.get(cacheKey);
      }

      const componentData = attrs ? this._parseAttributes(attrs, data) : {};
      componentData.slot = slotContent ? slotContent.trim() : '';

      const componentContext = { ...data, ...componentData };
      const rendered = this.render(this.components[name], componentContext);

      this._componentCache.set(cacheKey, rendered);
      return rendered;
    });
  }

  _parseAttributes(attrString, parentData) {
    const attrs = {};
    if (!attrString) return attrs;

    // Match: attr="value", attr='value', or attr={expression}
    const attrPattern = /([\w-]+)=(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})/g;

    let match;
    while ((match = attrPattern.exec(attrString)) !== null) {
      const attrName = match[1];
      const value = match[2] || match[3] || match[4];

      try {
        attrs[attrName] = match[4] !== undefined
          ? this._evaluateExpression(value, parentData)
          : value;
      } catch (e) {
        console.error(`Error evaluating attribute ${attrName}:`, e);
        attrs[attrName] = value;
      }
    }

    return attrs;
  }

  _processConditionals(template, data) {
    const templateStr = this._ensureString(template);
    const pattern = /@if\s+(.+?)\s*\}(.*?)(?:@elseif\s+(.+?)\s*\}(.*?))*(?:@else\s*\}(.*?))?@endif/gs;

    return templateStr.replace(pattern, (match, ifCond, ifContent, ...elseifParts) => {
      try {
        if (this._evaluateExpression(ifCond.trim(), data)) {
          return ifContent;
        }

        for (let i = 0; i < elseifParts.length; i += 2) {
          const condition = elseifParts[i];
          const content = elseifParts[i + 1];
          if (condition && this._evaluateExpression(condition.trim(), data)) {
            return content;
          }
        }

        const elseContent = elseifParts[elseifParts.length - 1];
        return elseContent || '';
      } catch (e) {
        console.error('Error evaluating conditional:', e);
        return match;
      }
    });
  }

  _processLoops(template, data) {
    const templateStr = this._ensureString(template);
    const pattern = /@foreach\s+(.+?)\s+as\s+(\w+)\s*\}(.*?)@endforeach/gs;

    return templateStr.replace(pattern, (match, arrayExpr, varName, content) => {
      try {
        const array = this._evaluateExpression(arrayExpr.trim(), data);
        if (!Array.isArray(array)) {
          console.error('@foreach expects an array, got:', array);
          return match;
        }

        return array.map(item => {
          const loopContext = { ...data, [varName]: item };
          return this.render(content, loopContext);
        }).join('');
      } catch (e) {
        console.error('Error in @foreach loop:', e);
        return match;
      }
    });
  }

  _processBindings(template, data) {
    const templateStr = this._ensureString(template);
    const bindPattern = new RegExp(`${this._escapeRegExp(this.options.bindPrefix)}(\\w+)(?:\\.(\\w+))?`, 'g');

    // Process attribute bindings
    templateStr.replace(/\b(\w+)=["'](.*?)["']/gs, (match, attr, value) => {
      return value.includes(this.options.bindPrefix)
        ? `${attr}="${value.replace(bindPattern, (m, prop, event) => {
          return this._createBinding(prop, event, data);
        })}"`
        : match;
    });

    // Process content bindings
    return templateStr.replace(bindPattern, (m, prop, event) => {
      return this._createBinding(prop, event, data);
    });
  }

  _processExpressions(template, data) {
    const templateStr = this._ensureString(template);
    const { start, end } = this.options.delimiters;
    const pattern = new RegExp(`${this._escapeRegExp(start)}(.+?)${this._escapeRegExp(end)}`, 'g');

    return templateStr.replace(pattern, (match, expr) => {
      try {
        const result = this._evaluateExpression(expr.trim(), data);
        return result !== undefined ? this._ensureString(result) : '';
      } catch (e) {
        console.error(`Error evaluating expression "${expr}":`, e);
        return match;
      }
    });
  }

  _createBinding(property, eventType, data) {
    if (eventType) {
      return `data-binding="${property}" ${eventType}="this._handleBinding(event, '${property}')"`;
    }
    const value = data[property];
    return value !== undefined ? this._ensureString(value) : '';
  }

  _evaluateExpression(expr, data) {
    try {
      const vars = Object.keys(data).join(',');
      const values = Object.values(data);
      return new Function(vars, `return ${expr}`)(...values);
    } catch (e) {
      try {
        return new Function('data', `with(data) { return ${expr} }`)(data);
      } catch (e2) {
        console.error(`Evaluation failed for expression "${expr}":`, e2);
        return undefined;
      }
    }
  }

  _ensureString(input) {
    if (typeof input === 'string') return input;
    if (input == null) return '';
    try {
      if (typeof input.toString === 'function') return input.toString();
      return JSON.stringify(input);
    } catch {
      return '';
    }
  }

  _generateCacheKey(template, data) {
    return `${template.length}_${JSON.stringify(data)}`;
  }

  _escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  _handleBinding(event, property) {
    const element = event.target;
    const newValue = element.value;
    console.log(`Updating ${property} to:`, newValue);
    event.preventDefault();
  }
}


window.TemplateEngine = TemplateEngine;
