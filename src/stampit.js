!function() {
  'use strict';
  var _undefined;

  var var1, var2, var3;
  var baseStampit;

  function getOwnPropertyKeys(obj) {
    return Object.getOwnPropertyNames(obj).concat(Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(obj) : []);
  }

  function _mergeOrAssign(action, dst) {
    return Array.prototype.slice.call(arguments, 2).reduce(action, dst);
  }

  function assignOne(dst, src) {
    if (src) {
      // We need to copy regular props, symbols, getters and setters.
      var keys = getOwnPropertyKeys(src), i = 0, desc;
      for (; i < keys.length; i += 1) {
        desc = Object.getOwnPropertyDescriptor(src, keys[i]);
        // Make it rewritable because two stamps can have same named getter/setter
        Object.defineProperty(dst, keys[i], desc);
      }
    }
    return dst;
  }

  var assign = _mergeOrAssign.bind(0, assignOne);

  function isFunction(obj) {
    return typeof obj == 'function';
  }

  function isObject(obj) {
    return obj && typeof obj == 'object' || isFunction(obj);
  }

  function isPlainObject(value) {
    return value && typeof value == 'object' &&
      value.__proto__ == Object.prototype;
  }

  /**
   * The 'src' argument plays the command role.
   * The returned values is always of the same type as the 'src'.
   * @param {Array|Object|*} dst Destination
   * @param {Array|Object|*} src Source
   * @returns {Array|Object|*} The `dst` argument
   */
  function mergeOne(dst, src) {
    if (src === _undefined) return dst;

    // According to specification arrays must be concatenated.
    // Also, the '.concat' creates a new array instance. Overrides the 'dst'.
    if (Array.isArray(src)) return (Array.isArray(dst) ? dst : []).concat(src);

    // Now deal with non plain 'src' object. 'src' overrides 'dst'
    // Note that functions are also assigned! We do not deep merge functions.
    if (!isPlainObject(src)) return src;

    var keys = getOwnPropertyKeys(src), i = 0, key, desc;
    for (; i < keys.length;) {
      key = keys[i++];
      desc = Object.getOwnPropertyDescriptor(src, key);
      if (desc.hasOwnProperty('value')) { // is this a regular property?
        // Do not merge properties with the 'undefined' value.
        if (desc.value !== _undefined) {
          // deep merge each property. Recursion!
          dst[key] = mergeOne(isPlainObject(dst[key]) || Array.isArray(src[key]) ? dst[key] : {}, src[key]);
        }
      } else { // nope, it looks like a getter/setter
        // Make it rewritable because two stamps can have same named getter/setter
        Object.defineProperty(dst, key, desc);
      }
    }

    return dst;
  }

  var merge = _mergeOrAssign.bind(0, mergeOne);

  function extractUniqueFunctions() {
    var1 = Array.prototype.concat.apply([], arguments).filter(function(elem, index, array) {
      return isFunction(elem) && array.indexOf(elem) === index;
    });
    return var1.length ? var1 : _undefined;
  }


  /**
   * Converts stampit extended descriptor to a standard one.
   * @param {Object|*} descr
   * methods
   * properties
   * props
   * initializers
   * init
   * deepProperties
   * deepProps
   * propertyDescriptors
   * staticProperties
   * statics
   * staticDeepProperties
   * deepStatics
   * staticPropertyDescriptors
   * configuration
   * conf
   * deepConfiguration
   * deepConf
   * composers
   * @returns {Descriptor} Standardised descriptor
   */
  function standardiseDescriptor(descr) {
    var3 = {};

    var3.methods = descr.methods || _undefined;

    var1 = descr.properties;
    var2 = descr.props;
    var3.properties = isObject(var1 || var2) ? assign({}, var2, var1) : _undefined;

    var3.initializers = extractUniqueFunctions(descr.init, descr.initializers);

    var3.composers = extractUniqueFunctions(descr.composers);

    var1 = descr.deepProperties;
    var2 = descr.deepProps;
    var3.deepProperties = isObject(var1 || var2) ? merge({}, var2, var1) : _undefined;

    var3.propertyDescriptors = descr.propertyDescriptors;

    var1 = descr.staticProperties;
    var2 = descr.statics;
    var3.staticProperties = isObject(var1 || var2) ? assign({}, var2, var1) : _undefined;

    var1 = descr.staticDeepProperties;
    var2 = descr.deepStatics;
    var3.staticDeepProperties = isObject(var1 || var2) ? merge({}, var2, var1) : _undefined;

    var1 = descr.staticPropertyDescriptors;
    var2 = descr.name && {name: {value: descr.name}};
    var3.staticPropertyDescriptors = isObject(var2 || var1) ? assign({}, var1, var2) : _undefined;

    var1 = descr.configuration;
    var2 = descr.conf;
    var3.configuration = isObject(var1 || var2) ? assign({}, var2, var1) : _undefined;

    var1 = descr.deepConfiguration;
    var2 = descr.deepConf;
    var3.deepConfiguration = isObject(var1 || var2) ? merge({}, var2, var1) : _undefined;

    return var3;
  }

  /**
   * Creates new factory instance.
   * @returns {Function} The new factory function.
   */
  function createFactory() {
    return function Stamp(options) {
      var i = Stamp.compose || {};
      // Next line was optimized for most JS VMs. Please, be careful here!
      var obj = {__proto__: i.methods};

      var inits = i.initializers, args = Array.prototype.slice.apply(arguments);
      var initializer, returnedValue;

      var tmp = i.deepProperties;
      if (tmp) merge(obj, tmp);
      tmp = i.properties;
      if (tmp) assign(obj, tmp);
      tmp = i.propertyDescriptors;
      if (tmp) Object.defineProperties(obj, tmp);

      if (!inits || !inits.length) return obj;

      if (options === _undefined) options = {};
      for (i = 0; i < inits.length;) {
        initializer = inits[i++];
        if (isFunction(initializer)) {
          returnedValue = initializer.call(obj, options,
            {instance: obj, stamp: Stamp, args: args});
          obj = returnedValue === _undefined ? obj : returnedValue;
        }
      }

      return obj;
    };
  }

  /**
   * Returns a new stamp given a descriptor and a compose function implementation.
   * @param {Descriptor} [descriptor={}] The information about the object the stamp will be creating.
   * @returns {Stamp} The new stamp
   */
  function createStamp(descriptor) {
    var1 = createFactory();

    var2 = descriptor.staticDeepProperties;
    if (var2) merge(var1, var2);

    var2 = descriptor.staticProperties;
    if (var2) assign(var1, var2);

    var2 = descriptor.staticPropertyDescriptors;
    if (var2) Object.defineProperties(var1, var2);

    var2 = isFunction(var1.compose) ? var1.compose : compose;
    assign(var1.compose = function() {
      return var2.apply(this, arguments);
    }, descriptor);

    return var1;
  }

  /**
   * Mutates the dstDescriptor by merging the srcComposable data into it.
   * @param {Descriptor} dstDescriptor The descriptor object to merge into.
   * @param {Composable} [srcComposable] The composable
   * (either descriptor or stamp) to merge data form.
   * @returns {Descriptor} Returns the dstDescriptor argument.
   */
  function mergeComposable(dstDescriptor, srcComposable) {
    function mergeAssign(propName, deep) {
      if (!isObject(srcComposable[propName])) {
        return;
      }
      if (!isObject(dstDescriptor[propName])) {
        dstDescriptor[propName] = {};
      }
      (deep || assign)(dstDescriptor[propName], srcComposable[propName]);
    }

    function concatAssignFunctions(propName) {
      var1 = extractUniqueFunctions(dstDescriptor[propName], srcComposable[propName]);
      if (var1) dstDescriptor[propName] = var1;
    }

    if (srcComposable && isObject(srcComposable = srcComposable.compose || srcComposable)) {
      mergeAssign("methods");
      mergeAssign("properties");
      mergeAssign("deepProperties", merge);
      mergeAssign("propertyDescriptors");
      mergeAssign("staticProperties");
      mergeAssign("staticDeepProperties", merge);
      mergeAssign("staticPropertyDescriptors");
      mergeAssign("configuration");
      mergeAssign("deepConfiguration", merge);
      concatAssignFunctions("initializers");
      concatAssignFunctions("composers");
    }

    return dstDescriptor;
  }

  /**
   * Given the list of composables (stamp descriptors and stamps) returns
   * a new stamp (composable factory function).
   * @typedef {Function} Compose
   * Parameters:  {...Composable} The list of composables.
   * @returns {Stamp} A new stamp (aka composable factory function)
   */
  function compose() {
    var descriptor = Array.prototype.concat.apply([this], arguments)
    .reduce(mergeComposable, {});
    return createStamp(descriptor);
  }


  /**
   * The Stamp Descriptor
   * @typedef {Function|Object} Descriptor
   * @returns {Stamp} A new stamp based on this Stamp
   * @property {Object} [methods] Methods or other data used as object instances' prototype
   * @property {Array<Function>} [initializers] List of initializers called for each object instance
   * @property {Object} [properties] Shallow assigned properties of object instances
   * @property {Object} [deepProperties] Deeply merged properties of object instances
   * @property {Object} [staticProperties] Shallow assigned properties of Stamps
   * @property {Object} [staticDeepProperties] Deeply merged properties of Stamps
   * @property {Object} [configuration] Shallow assigned properties of Stamp arbitrary metadata
   * @property {Object} [deepConfiguration] Deeply merged properties of Stamp arbitrary metadata
   * @property {Object} [propertyDescriptors] ES5 Property Descriptors applied to object instances
   * @property {Object} [staticPropertyDescriptors] ES5 Property Descriptors applied to Stamps
   */

  /**
   * The Stamp factory function
   * @typedef {Function} Stamp
   * @returns {*} Instantiated object
   * @property {Descriptor} compose - The Stamp descriptor and composition function
   */

  /**
   * A composable object - stamp or descriptor
   * @typedef {Stamp|Descriptor} Composable
   */

  /**
   * Returns true if argument is a stamp.
   * @param {*} obj Any object
   * @returns {Boolean} True is the obj is a stamp
   */
  function isStamp(obj) {
    return isFunction(obj) && isFunction(obj.compose);
  }

  var allUtilities = {};

  allUtilities.methods = createUtilityFunction("methods", assign);

  allUtilities.properties = allUtilities.props =
    createUtilityFunction("properties", assign);

  allUtilities.initializers = allUtilities.init =
    createUtilityFunction("initializers", extractUniqueFunctions);

  allUtilities.composers = createUtilityFunction("composers", extractUniqueFunctions);

  allUtilities.deepProperties = allUtilities.deepProps =
    createUtilityFunction("deepProperties", merge);

  allUtilities.staticProperties = allUtilities.statics =
    createUtilityFunction("staticProperties", assign);

  allUtilities.staticDeepProperties = allUtilities.deepStatics =
    createUtilityFunction("staticDeepProperties", merge);

  allUtilities.configuration = allUtilities.conf =
    createUtilityFunction("configuration", assign);

  allUtilities.deepConfiguration = allUtilities.deepConf =
    createUtilityFunction("deepConfiguration", merge);

  allUtilities.propertyDescriptors = createUtilityFunction("propertyDescriptors", assign);

  allUtilities.staticPropertyDescriptors = createUtilityFunction("staticPropertyDescriptors", assign);

  function createUtilityFunction(propName, action) {
    return function() {
      var3 = {};
      var3[propName] = action.apply(_undefined, Array.prototype.concat.apply([{}], arguments));
      var1 = this;

      return ((var1 && var1.compose) || var2).call(var1, var3);
    };
  }

  /**
   * Infected compose
   * Parameters:  {...Composable} The list of composables.
   * @return {Stamp} The Stampit-flavoured stamp
   */
  var2 = allUtilities.compose = assign(function stampit() {
    var i = 0, composable, composables = [], array = arguments, composerResult = this;
    for (; i < array.length;) {
      composable = array[i++];
      if (isObject(composable)) {
        composables.push(isStamp(composable) ? composable : standardiseDescriptor(composable));
      }
    }

    // Calling the standard pure compose function here.
    composable = compose.apply(composerResult || baseStampit, composables);
    if (composerResult) composables.unshift(composerResult);

    array = composable.compose.composers;
    if (Array.isArray(array)) {
      for (i = 0; i < array.length;) {
        composerResult = array[i++]({stamp: composable, composables: composables});
        composable = isStamp(composerResult) ? composerResult : composable;
      }
    }

    return composable;
  }, allUtilities); // Setting up the shortcut functions

  allUtilities.create = function() {
    return this.apply(_undefined, arguments);
  };

  var3 = {};
  var3.staticProperties = allUtilities;

  /**
   * Infected stamp. Used as a storage of the infection metadata
   * @type {Function}
   * @return {Stamp}
   */
  baseStampit = compose(var3);

  var2.compose = var2.bind(); // bind to undefined
  var2.version = 'VERSION';

  if (typeof _undefined != typeof module) module.exports = var2; else self.stampit = var2;
}();
