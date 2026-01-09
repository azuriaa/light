class ReactiveTemplateEngine {
  constructor(options = {}) {
    this.options = {
      delimiters: { start: '{{', end: '}}' },
      bindPrefix: 'bind:',
      debug: false,
      useCache: true,
      cacheSize: 100,
      ...options
    };
    
    // Component registry
    this.components = {};
    
    // Reactivity system
    this.reactiveContexts = new WeakMap();
    this.expressionObservers = new Map();
    this.currentExpressionId = null;
    this.currentDependencies = new Set();
    
    // Cache system
    this._templateCache = new Map();
    this._componentCache = new Map();
    
    // Event system
    this._eventHandlers = new Map();
    this._cleanupFunctions = new Map();
    
    // Debug
    if (this.options.debug) {
      console.log('🔧 ReactiveTemplateEngine initialized', this.options);
    }
  }

  // ==================== PUBLIC API ====================

  registerComponent(name, template) {
    if (typeof template !== 'string') {
      throw new Error(`Component "${name}" template must be a string`);
    }
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
      console.warn(`Component "${name}" should start with uppercase letter`);
    }
    this.components[name] = template;
    this._componentCache.clear();
    
    if (this.options.debug) {
      console.log(`📦 Component "${name}" registered`);
    }
  }

  render(template, data, container = null) {
    try {
      const templateStr = this._ensureString(template);
      
      if (this.options.debug) {
        console.log('🎨 Rendering template (first 200 chars):', templateStr.substring(0, 200) + '...');
      }

      // Clear previous event handlers for this container
      if (container) {
        this._cleanupContainer(container);
      }

      // Make data reactive if container exists
      let reactiveData = data;
      if (container && this._isDOMElement(container) && this._isPlainObject(data)) {
        reactiveData = this._makeReactive(data, container);
      }

      // Check cache
      let result;
      if (this.options.useCache) {
        const cacheKey = this._generateSafeCacheKey(templateStr, reactiveData);
        if (this._templateCache.has(cacheKey)) {
          result = this._templateCache.get(cacheKey);
          if (container && this._isDOMElement(container)) {
            this._updateContainer(container, result, reactiveData);
          }
          return result;
        }
      }

      // Process template dengan urutan yang BENAR
      result = templateStr;
      
      // 1. Process loops first (they may contain conditionals)
      result = this._processLoops(result, reactiveData);
      
      // 2. Process conditionals dengan metode yang DIPERBAIKI
      result = this._processConditionalsSafe(result, reactiveData);
      
      // 3. Process components
      result = this._processComponents(result, reactiveData);
      
      // 4. Process bindings
      result = this._processBindings(result, reactiveData);
      
      // 5. Process expressions with reactivity tracking
      result = this._processExpressionsWithTracking(result, reactiveData, container);
      
      // 6. Process event handlers
      result = this._processEventHandlers(result, container);

      // Cache result
      if (this.options.useCache) {
        const cacheKey = this._generateSafeCacheKey(templateStr, reactiveData);
        this._manageCache(this._templateCache, cacheKey, result);
      }

      // Render to container
      if (container && this._isDOMElement(container)) {
        this._updateContainer(container, result, reactiveData);
      }

      return result;
    } catch (error) {
      console.error('❌ TemplateEngine render error:', error);
      if (this.options.debug) {
        console.error('Stack trace:', error.stack);
      }
      return '';
    }
  }

  destroy(container) {
    if (container) {
      this._cleanupContainer(container);
    }
  }

  // ==================== CONDITIONAL SYSTEM (FIXED VERSION) ====================

  _processConditionalsSafe(template, data) {
    const templateStr = this._ensureString(template);
    let result = templateStr;
    
    // Cari semua blok @if...@endif dengan pendekatan yang lebih sederhana
    const ifPositions = [];
    
    // Temukan semua posisi @if
    let searchPos = 0;
    while ((searchPos = templateStr.indexOf('@if', searchPos)) !== -1) {
      ifPositions.push(searchPos);
      searchPos += 3;
    }
    
    // Process dari yang terakhir ke pertama
    for (let i = ifPositions.length - 1; i >= 0; i--) {
      const startPos = ifPositions[i];
      
      // Cari penutup } dari kondisi @if
      let conditionEndPos = templateStr.indexOf('}', startPos);
      if (conditionEndPos === -1) continue;
      
      // Ambil kondisi
      const condition = templateStr.substring(startPos + 3, conditionEndPos).trim();
      
      // Cari @endif yang sesuai
      let endifPos = -1;
      let depth = 0;
      let searchEndPos = conditionEndPos + 1;
      
      while (searchEndPos < templateStr.length) {
        if (templateStr.substring(searchEndPos, searchEndPos + 3) === '@if') {
          depth++;
          searchEndPos += 3;
        } else if (templateStr.substring(searchEndPos, searchEndPos + 6) === '@endif') {
          if (depth === 0) {
            endifPos = searchEndPos;
            break;
          } else {
            depth--;
            searchEndPos += 6;
          }
        } else if (templateStr.substring(searchEndPos, searchEndPos + 7) === '@elseif' ||
                   templateStr.substring(searchEndPos, searchEndPos + 5) === '@else') {
          // Lewati elseif/else, biarkan parsing manual menanganinya
          searchEndPos++;
        } else {
          searchEndPos++;
        }
      }
      
      if (endifPos === -1) {
        console.error('❌ No matching @endif found for @if at position', startPos);
        continue;
      }
      
      // Ambil seluruh konten conditional block
      const blockContent = templateStr.substring(conditionEndPos + 1, endifPos);
      const fullBlock = templateStr.substring(startPos, endifPos + 6);
      
      // Parse block content untuk elseif dan else
      const parsed = this._parseConditionalBlockSafe(blockContent);
      
      try {
        // Evaluate main condition
        let replacement = '';
        const conditionResult = this._evaluateConditionSafe(condition, data);
        
        if (conditionResult) {
          replacement = parsed.ifContent;
        } else {
          // Check elseif conditions
          let matched = false;
          for (const elseif of parsed.elseif) {
            if (this._evaluateConditionSafe(elseif.condition, data)) {
              replacement = elseif.content;
              matched = true;
              break;
            }
          }
          
          // Use else content if no elseif matched
          if (!matched && parsed.elseContent) {
            replacement = parsed.elseContent;
          }
        }
        
        // Replace in result
        result = result.substring(0, startPos) + replacement + result.substring(endifPos + 6);
        
      } catch (e) {
        console.error('❌ Error processing conditional block:', e);
        if (this.options.debug) {
          console.error('Problematic block:', fullBlock.substring(0, 200));
        }
      }
    }
    
    return result;
  }

  _parseConditionalBlockSafe(content) {
    const result = {
      ifContent: '',
      elseif: [],
      elseContent: ''
    };
    
    // Convert content to array of lines for easier parsing
    const lines = content.split('\n');
    let currentSection = 'if';
    let currentContent = [];
    let inDirective = false;
    let directiveBuffer = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for @elseif
      if (line.includes('@elseif')) {
        // Save previous content
        if (currentSection === 'if') {
          result.ifContent = currentContent.join('\n');
        } else if (currentSection === 'elseif') {
          const lastElseIf = result.elseif[result.elseif.length - 1];
          lastElseIf.content = currentContent.join('\n');
        }
        
        // Reset for new section
        currentContent = [];
        currentSection = 'elseif';
        
        // Extract condition from @elseif line
        const elseIfMatch = this._extractConditionFromDirective(line, '@elseif');
        if (elseIfMatch) {
          result.elseif.push({
            condition: elseIfMatch,
            content: ''
          });
        }
      }
      // Check for @else
      else if (line.includes('@else}')) {
        // Save previous content
        if (currentSection === 'if') {
          result.ifContent = currentContent.join('\n');
        } else if (currentSection === 'elseif') {
          const lastElseIf = result.elseif[result.elseif.length - 1];
          lastElseIf.content = currentContent.join('\n');
        }
        
        // Reset for else section
        currentContent = [];
        currentSection = 'else';
      }
      // Regular content
      else {
        currentContent.push(line);
      }
    }
    
    // Save final content
    if (currentSection === 'if') {
      result.ifContent = currentContent.join('\n');
    } else if (currentSection === 'elseif') {
      const lastElseIf = result.elseif[result.elseif.length - 1];
      lastElseIf.content = currentContent.join('\n');
    } else if (currentSection === 'else') {
      result.elseContent = currentContent.join('\n');
    }
    
    return result;
  }

  _extractConditionFromDirective(line, directive) {
    const directiveIndex = line.indexOf(directive);
    if (directiveIndex === -1) return null;
    
    // Extract text after directive
    let conditionStart = directiveIndex + directive.length;
    let conditionEnd = line.indexOf('}', conditionStart);
    
    if (conditionEnd === -1) {
      // No closing brace in this line, might be multiline
      return line.substring(conditionStart).trim();
    }
    
    return line.substring(conditionStart, conditionEnd).trim();
  }

  _evaluateConditionSafe(condition, data) {
    try {
      // Clean the condition
      const cleanCond = condition
        .replace(/[\r\n\t]/g, ' ')  // Replace newlines/tabs with spaces
        .replace(/\s+/g, ' ')       // Normalize whitespace
        .trim();
      
      // Validate condition doesn't contain HTML or invalid content
      if (cleanCond.includes('<') || cleanCond.includes('>') || cleanCond.length > 500) {
        if (this.options.debug) {
          console.warn('⚠️ Skipping potentially invalid condition:', cleanCond.substring(0, 100));
        }
        return false;
      }
      
      if (this.options.debug) {
        console.log('🔍 Evaluating condition:', cleanCond);
      }
      
      // Special cases
      if (cleanCond === 'true') return true;
      if (cleanCond === 'false') return false;
      if (cleanCond === '') return false;
      
      // Try to evaluate
      const func = new Function('data', `
        try {
          with(data) {
            return !!(${cleanCond});
          }
        } catch(e) {
          console.error('Condition evaluation error:', e, 'for:', "${cleanCond.replace(/"/g, '\\"')}");
          return false;
        }
      `);
      
      const result = func(data);
      
      if (this.options.debug) {
        console.log('✅ Condition result:', result, 'for:', cleanCond);
      }
      
      return result;
    } catch (e) {
      console.error(`❌ Condition evaluation error: "${condition.substring(0, 100)}"`, e);
      return false;
    }
  }

  // ==================== LOOP SYSTEM ====================

  _processLoops(template, data) {
    const templateStr = this._ensureString(template);
    
    // Pattern untuk @foreach
    const loopPattern = /@foreach\s+(.+?)\s+as\s+(\w+)\s*\}([\s\S]*?)@endforeach/g;
    
    return templateStr.replace(loopPattern, (match, arrayExpr, varName, content) => {
      try {
        const array = this._evaluateExpression(arrayExpr.trim(), data);
        
        if (!Array.isArray(array)) {
          console.error('❌ @foreach expects an array, got:', array);
          return match;
        }

        // Render each item
        return array.map((item, index) => {
          const loopContext = { 
            ...data, 
            [varName]: item,
            _index: index,
            _first: index === 0,
            _last: index === array.length - 1,
            _odd: index % 2 === 1,
            _even: index % 2 === 0
          };
          
          // Recursively render the loop content
          return this.render(content, loopContext);
        }).join('');
      } catch (e) {
        console.error('❌ Error in @foreach loop:', e);
        return match;
      }
    });
  }

  // ==================== COMPONENT SYSTEM ====================

  _processComponents(template, data) {
    const templateStr = this._ensureString(template);
    const componentPattern = /<([A-Z][a-zA-Z0-9]*)(?:\s+([^>]*))?(?:\/>|>([\s\S]*?)<\/\1>)/g;
    
    let result = templateStr;
    let lastResult;
    let iteration = 0;
    const maxIterations = 10;
    
    do {
      lastResult = result;
      result = result.replace(componentPattern, (match, name, attrs, slotContent) => {
        if (!this.components[name]) {
          if (this.options.debug) {
            console.warn(`⚠️ Component "${name}" not found`);
          }
          return match;
        }

        const cacheKey = `${name}_${attrs}_${slotContent}`;
        if (this._componentCache.has(cacheKey)) {
          return this._componentCache.get(cacheKey);
        }

        // Parse attributes
        const componentData = attrs ? this._parseAttributes(attrs, data) : {};
        componentData.slot = slotContent ? slotContent.trim() : '';

        // Create component context
        const componentContext = { ...data, ...componentData };
        
        // Get component template
        const componentTemplate = this.components[name];
        
        // Render component
        const rendered = this.render(componentTemplate, componentContext);
        
        // Cache result
        this._manageCache(this._componentCache, cacheKey, rendered);
        
        return rendered;
      });
      iteration++;
    } while (result !== lastResult && iteration < maxIterations);
    
    return result;
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
        if (match[4] !== undefined) {
          // Evaluate expression
          attrs[attrName] = this._evaluateExpression(value, parentData);
        } else {
          // Use string value
          attrs[attrName] = value;
        }
      } catch (e) {
        console.error(`Error evaluating attribute ${attrName}:`, e);
        attrs[attrName] = value;
      }
    }
    
    return attrs;
  }

  // ==================== BINDING SYSTEM ====================

  _processBindings(template, data) {
    const templateStr = this._ensureString(template);
    const bindPattern = new RegExp(`${this._escapeRegExp(this.options.bindPrefix)}(\\w+(?:\\.\\w+)*)`, 'g');
    
    // Process attribute bindings
    let result = templateStr.replace(/\b(\w+)=["'](.*?)["']/gs, (match, attr, value) => {
      if (value.includes(this.options.bindPrefix)) {
        const processedValue = value.replace(bindPattern, (m, prop) => {
          const val = this._getNestedProperty(data, prop);
          return val !== undefined ? this._ensureString(val) : '';
        });
        return `${attr}="${processedValue}"`;
      }
      return match;
    });

    // Process content bindings
    result = result.replace(bindPattern, (m, prop) => {
      const val = this._getNestedProperty(data, prop);
      return val !== undefined ? this._ensureString(val) : '';
    });

    return result;
  }

  // ==================== EXPRESSION SYSTEM ====================

  _processExpressionsWithTracking(template, data, container) {
    const { start, end } = this.options.delimiters;
    const pattern = new RegExp(`${this._escapeRegExp(start)}(.+?)${this._escapeRegExp(end)}`, 'g');
    
    let expressionId = 0;
    const expressionMap = new Map();
    
    const result = template.replace(pattern, (match, expr) => {
      const exprId = `expr_${Date.now()}_${expressionId++}`;
      const exprClean = expr.trim();
      
      try {
        // Start tracking dependencies
        this._startExpressionTracking(exprId);
        
        // Evaluate expression
        const evaluated = this._evaluateExpression(exprClean, data);
        
        // Get dependencies
        const dependencies = this._stopExpressionTracking();
        
        // Store expression info
        expressionMap.set(exprId, {
          expression: exprClean,
          result: evaluated,
          dependencies: dependencies
        });
        
        // Create reactive element
        return `<span data-expr-id="${exprId}" class="reactive-expr">${this._ensureString(evaluated)}</span>`;
        
      } catch (e) {
        console.error(`❌ Error evaluating expression "${exprClean}":`, e);
        return match;
      }
    });
    
    // Store expression map for this container
    if (container && this._isDOMElement(container)) {
      this.expressionObservers.set(container, expressionMap);
    }
    
    return result;
  }

  _evaluateExpression(expr, data) {
    try {
      // Clean the expression
      const cleanExpr = expr.trim();
      
      // Simple expressions can be evaluated directly
      if (/^[\w.]+$/.test(cleanExpr)) {
        return this._getNestedProperty(data, cleanExpr) || '';
      }
      
      // Complex expressions use Function constructor
      const func = new Function(...Object.keys(data), `return ${cleanExpr}`);
      const result = func(...Object.values(data));
      
      return result !== undefined ? result : '';
      
    } catch (e) {
      // Fallback for complex expressions with nested properties
      try {
        const func = new Function('data', `
          try {
            with(data) {
              return ${expr};
            }
          } catch(e) {
            return "";
          }
        `);
        return func(data);
      } catch (e2) {
        console.error(`❌ Expression evaluation error for "${expr}":`, e2);
        return '';
      }
    }
  }

  // ==================== EVENT HANDLER SYSTEM ====================

  _processEventHandlers(template, container) {
    const templateStr = this._ensureString(template);
    
    // Process onclick handlers
    let result = templateStr.replace(/onclick="([^"]+)"/g, (match, handler) => {
      const handlerId = `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store handler
      if (!this._eventHandlers.has(container)) {
        this._eventHandlers.set(container, new Map());
      }
      this._eventHandlers.get(container).set(handlerId, handler);
      
      return `data-handler-id="${handlerId}" data-handler-type="click"`;
    });
    
    // Process oninput handlers
    result = result.replace(/oninput="([^"]+)"/g, (match, handler) => {
      const handlerId = `input_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      if (!this._eventHandlers.has(container)) {
        this._eventHandlers.set(container, new Map());
      }
      this._eventHandlers.get(container).set(handlerId, handler);
      
      return `data-handler-id="${handlerId}" data-handler-type="input"`;
    });
    
    return result;
  }

  _setupEventDelegation(container, reactiveData) {
    // Click events
    const clickHandler = (event) => {
      const element = event.target;
      const handlerId = element.getAttribute('data-handler-id');
      const handlerType = element.getAttribute('data-handler-type');
      
      if (handlerId && handlerType === 'click') {
        const handlers = this._eventHandlers.get(container);
        if (handlers && handlers.has(handlerId)) {
          const handlerCode = handlers.get(handlerId);
          try {
            // Execute handler with context
            const func = new Function('data', 'event', 'element', `
              try {
                with(data) {
                  ${handlerCode}
                }
              } catch(e) {
                console.error('Handler error:', e);
              }
            `);
            
            func(reactiveData, event, element);
          } catch (error) {
            console.error('❌ Error executing click handler:', error);
          }
        }
      }
    };
    
    // Input events for two-way binding
    const inputHandler = (event) => {
      const element = event.target;
      const bindingProp = element.getAttribute('data-binding');
      
      if (bindingProp && reactiveData) {
        reactiveData[bindingProp] = element.value;
      }
    };
    
    // Add event listeners
    container.addEventListener('click', clickHandler);
    container.addEventListener('input', inputHandler);
    
    // Store cleanup functions
    if (!this._cleanupFunctions.has(container)) {
      this._cleanupFunctions.set(container, []);
    }
    
    this._cleanupFunctions.get(container).push(
      () => container.removeEventListener('click', clickHandler),
      () => container.removeEventListener('input', inputHandler)
    );
  }

  // ==================== REACTIVITY SYSTEM ====================

  _makeReactive(data, container) {
    // Check if already reactive for this container
    if (this.reactiveContexts.has(container)) {
      const existing = this.reactiveContexts.get(container);
      if (existing.__target === data) {
        return existing;
      }
    }

    const self = this;
    
    // Create target object
    const target = Object.assign({}, data);
    
    const handler = {
      set(target, property, value) {
        // Skip internal properties
        if (property.startsWith('__')) {
          return Reflect.set(target, property, value);
        }
        
        const oldValue = target[property];
        const result = Reflect.set(target, property, value);
        
        if (result && value !== oldValue) {
          // Update expressions
          self._updateExpressionsForProperty(property, value, container);
          
          // Update data bindings
          self._updateDataBindings(property, value, container);
          
          if (self.options.debug) {
            console.log(`🔄 [Reactive] ${property}: ${oldValue} → ${value}`);
          }
        }
        
        return result;
      },
      
      get(target, property) {
        // Skip internal properties
        if (property.startsWith('__')) {
          return Reflect.get(target, property);
        }
        
        // Track dependency
        if (self.currentExpressionId) {
          self.currentDependencies.add(property);
        }
        
        const value = Reflect.get(target, property);
        
        // Bind functions to target
        if (typeof value === 'function') {
          return value.bind(target);
        }
        
        return value;
      }
    };
    
    const proxy = new Proxy(target, handler);
    
    // Store reference
    this.reactiveContexts.set(container, proxy);
    
    if (this.options.debug) {
      console.log(`✅ Created reactive proxy for container`, container);
    }
    
    return proxy;
  }

  _updateExpressionsForProperty(property, value, container) {
    if (!container || !this.expressionObservers.has(container)) return;
    
    const expressionMap = this.expressionObservers.get(container);
    const reactiveData = this.reactiveContexts.get(container);
    
    if (!reactiveData) return;
    
    expressionMap.forEach((info, exprId) => {
      if (info.dependencies.includes(property)) {
        try {
          // Re-evaluate expression
          this._startExpressionTracking(exprId);
          const newResult = this._evaluateExpression(info.expression, reactiveData);
          this._stopExpressionTracking();
          
          // Find and update element
          const element = container.querySelector(`[data-expr-id="${exprId}"]`);
          if (element) {
            const stringResult = this._ensureString(newResult);
            if (element.textContent !== stringResult) {
              element.textContent = stringResult;
              info.result = newResult;
            }
          }
        } catch (e) {
          console.error(`❌ Error updating expression "${info.expression}":`, e);
        }
      }
    });
  }

  _updateDataBindings(property, value, container) {
    const elements = container.querySelectorAll(`[data-binding="${property}"]`);
    
    elements.forEach(element => {
      const elementType = element.tagName;
      const stringValue = this._ensureString(value);
      
      if (elementType === 'INPUT' || elementType === 'TEXTAREA' || elementType === 'SELECT') {
        if (element.value !== stringValue) {
          element.value = stringValue;
        }
      } else {
        if (element.textContent !== stringValue) {
          element.textContent = stringValue;
        }
      }
    });
  }

  // ==================== DEPENDENCY TRACKING ====================

  _startExpressionTracking(exprId) {
    this.currentExpressionId = exprId;
    this.currentDependencies.clear();
  }

  _stopExpressionTracking() {
    const deps = Array.from(this.currentDependencies);
    this.currentExpressionId = null;
    this.currentDependencies.clear();
    return deps;
  }

  // ==================== CONTAINER MANAGEMENT ====================

  _updateContainer(container, content, reactiveData) {
    // Update HTML
    container.innerHTML = content;
    
    // Setup event delegation
    this._setupEventDelegation(container, reactiveData);
    
    // Mark container as reactive
    container.setAttribute('data-reactive-container', 'true');
    
    if (this.options.debug) {
      console.log(`📝 Updated container:`, container);
    }
  }

  _cleanupContainer(container) {
    // Remove event listeners
    if (this._cleanupFunctions.has(container)) {
      this._cleanupFunctions.get(container).forEach(fn => fn());
      this._cleanupFunctions.delete(container);
    }
    
    // Clear event handlers
    this._eventHandlers.delete(container);
    
    // Clear expression observers
    this.expressionObservers.delete(container);
    
    // Clear reactive context
    this.reactiveContexts.delete(container);
    
    if (this.options.debug) {
      console.log(`🧹 Cleaned up container:`, container);
    }
  }

  // ==================== CACHE MANAGEMENT ====================

  _generateSafeCacheKey(template, data) {
    try {
      // Simple cache key based on template length
      return `t_${template.length}_${Date.now().toString(36)}`;
    } catch (error) {
      return `t_${template.length}_${Math.random().toString(36)}`;
    }
  }

  _manageCache(cacheMap, key, value) {
    // Check cache size
    if (cacheMap.size >= this.options.cacheSize) {
      const firstKey = cacheMap.keys().next().value;
      cacheMap.delete(firstKey);
    }
    
    // Add to cache
    cacheMap.set(key, value);
  }

  // ==================== HELPER METHODS ====================

  _getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
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

  _isDOMElement(element) {
    try {
      return element instanceof HTMLElement;
    } catch (e) {
      return false;
    }
  }

  _isPlainObject(obj) {
    return obj && typeof obj === 'object' && !Array.isArray(obj);
  }

  _escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// Export for browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReactiveTemplateEngine;
} else {
  window.ReactiveTemplateEngine = ReactiveTemplateEngine;
}
