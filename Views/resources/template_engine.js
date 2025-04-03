class TemplateEngine {
  constructor(options = {}) {
    this.options = {
      delimiters: { start: '{{', end: '}}' },
      bindPrefix: 'bind:',
      components: {},
      cacheSize: 100,
      ...options
    };

    this._templateCache = new Map();
    this._componentCache = new Map();
    this._bindings = new Map();
  }

  registerComponent(name, template) {
    this.options.components[name] = template;
    this._componentCache.delete(name);
  }

  render(container, template, data) {
    if (!container) return this._renderToString(template, data);

    // Single DOM update flow
    const fragment = document.createDocumentFragment();
    const htmlString = this._renderToString(template, data, container);

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;

    while (tempDiv.firstChild) {
      this._processBindings(tempDiv.firstChild, data, container);
      fragment.appendChild(tempDiv.firstChild);
    }

    container.innerHTML = '';
    container.appendChild(fragment);
    container.dataset.template = template;
  }

  _renderToString(template, data, container = null) {
    const cacheKey = template.length + JSON.stringify(data);
    if (this._templateCache.has(cacheKey)) {
      return this._templateCache.get(cacheKey);
    }

    let result = template;
    result = this._processComponents(result, data, container);
    result = this._processConditionals(result, data);
    result = this._processLoops(result, data);
    result = this._processExpressions(result, data);

    if (this._templateCache.size >= this.options.cacheSize) {
      this._templateCache.delete(this._templateCache.keys().next().value);
    }
    this._templateCache.set(cacheKey, result);

    return result;
  }

  _processComponents(template, data, container) {
    return template.replace(/@component (\w+)(?:\((.*?)\))?\}(.*?)@endcomponent/gs,
      (match, name, args, slot) => {
        if (!this.options.components[name]) return match;

        const cacheKey = `${name}_${args}_${slot}`;
        if (this._componentCache.has(cacheKey)) {
          return this._componentCache.get(cacheKey);
        }

        const componentData = args ? this._parseComponentArgs(args, data) : {};
        componentData.slot = slot || '';

        const componentResult = this._renderToString(
          this.options.components[name],
          { ...data, ...componentData },
          container
        );

        this._componentCache.set(cacheKey, componentResult);
        return componentResult;
      });
  }

  _parseComponentArgs(argsString, data) {
    const args = {};
    if (!argsString) return args;

    argsString.split(',').forEach(arg => {
      const [key, value] = arg.split(':').map(s => s.trim());
      if (key && value) args[key] = this._evaluateExpression(value, data);
    });

    return args;
  }

  _processConditionals(template, data) {
    return template.replace(/@if (.+?)\}(.*?)(?:@elseif (.+?)\}(.*?))*(?:@else\}(.*?))?@endif/gs,
      (match, ifCond, ifContent, ...elseifs) => {
        try {
          if (this._evaluateExpression(ifCond.trim(), data)) {
            return ifContent;
          }

          for (let i = 0; i < elseif.length; i += 2) {
            const condition = elseif[i];
            const content = elseif[i + 1];
            if (condition && this._evaluateExpression(condition.trim(), data)) {
              return content;
            }
          }

          const elseContent = elseif[elseif.length - 1];
          return elseContent || '';
        } catch (e) {
          console.error('Condition error:', e);
          return match;
        }
      });
  }

  _processLoops(template, data) {
    return template.replace(/@foreach (.+?) as (\w+)\}(.*?)@endforeach/gs,
      (match, arrayExpr, varName, content) => {
        try {
          const array = this._evaluateExpression(arrayExpr.trim(), data);
          if (!Array.isArray(array)) return match;

          return array.map(item => {
            return this._renderToString(content, { ...data, [varName]: item });
          }).join('');
        } catch (e) {
          console.error('Loop error:', e);
          return match;
        }
      });
  }

  _processExpressions(template, data) {
    const { start, end } = this.options.delimiters;
    const pattern = new RegExp(`${this._escapeRegExp(start)}(.+?)${this._escapeRegExp(end)}`, 'g');

    return template.replace(pattern, (match, expr) => {
      try {
        const result = this._evaluateExpression(expr.trim(), data);
        return result !== undefined ? result : '';
      } catch (e) {
        console.error('Expression error:', e);
        return match;
      }
    });
  }

  _processBindings(node, data, container) {
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    Array.from(node.attributes).forEach(attr => {
      if (attr.value.includes(this.options.bindPrefix)) {
        const [_, prop, event] = attr.value.match(
          new RegExp(`${this.options.bindPrefix}(\\w+)(?:\\.(\\w+))?`)
        ) || [];

        if (prop) {
          const bindingId = `${prop}_${Date.now()}`;
          node.setAttribute('data-binding', bindingId);
          node[attr.name] = data[prop];

          if (event) {
            node.addEventListener(event, (e) => {
              data[prop] = e.target.value;
              this.render(container, container.dataset.template, data);
            });
          }
        }
      }
    });

    Array.from(node.childNodes).forEach(child =>
      this._processBindings(child, data, container));
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
        throw e;
      }
    }
  }

  _escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// Initialize for event delegation
TemplateEngine.instance = null;
TemplateEngine.init = function () {
  this.instance = this;
  document.addEventListener('input', (e) => {
    if (e.target.hasAttribute('data-binding')) {
      const bindingId = e.target.getAttribute('data-binding');
      // Handle binding updates if needed
    }
  });
};
TemplateEngine.init();