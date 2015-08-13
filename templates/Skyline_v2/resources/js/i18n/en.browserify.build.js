(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var initSitelocation = require('../../common_javascript/initialize-sitelocation');
var siteLocation = require('sitelocation');
var callAsync = require('../../common_javascript/call-async');

require('mobilemenu');

var initMenu = function() {
  var $ = window.$;
  var $content = $('.exodus_content_wrap');
  var $footer = $('.exodus_footer_wrap');
  var $banner = $('.exodus_banner_wrap');

  var mobileMenuOpen = function(event) {
    $content.addClass('small_device_hide');
    $footer.addClass('small_device_hide');
    $banner.addClass('small_device_hide');
  };

  var mobileMenuClose = function(event) {
    $content.removeClass('small_device_hide');
    $footer.removeClass('small_device_hide');
    $banner.removeClass('small_device_hide');
  };

  $('.mob_menu').mobileMenu({
    onOpen: mobileMenuOpen,
    onClose: mobileMenuClose
  });
};


/* With all Javascript bundled into one file, javascript is significantly
 * more brittle, especially given that users have the power to overwrite
 * globals that could interfere with bundled code. Initializing each component
 * on its own turn of the event loop should minimize failures to individual
 * Javascript components, instead of the whole site.
 */
callAsync(initMenu);
callAsync(initSitelocation(siteLocation, 'locationData'));

},{"../../common_javascript/call-async":66,"../../common_javascript/initialize-sitelocation":67,"mobilemenu":4,"sitelocation":44}],2:[function(require,module,exports){

/**
 * Module dependencies.
 */

var now = require('date-now');

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 *
 * @source underscore.js
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`false`)
 * @api public
 */

module.exports = function debounce(func, wait, immediate){
  var timeout, args, context, timestamp, result;
  if (null == wait) wait = 100;

  function later() {
    var last = now() - timestamp;

    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function debounced() {
    context = this;
    args = arguments;
    timestamp = now();
    var callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
};

},{"date-now":3}],3:[function(require,module,exports){
module.exports = Date.now || now

function now() {
    return new Date().getTime()
}

},{}],4:[function(require,module,exports){
'use strict';

/*
 * jQuery mobilemenu plugin
 */

(function ($, window, document, undefined) {

  var pluginName = 'mobileMenu';
  var subName = 'subMenu';
  var defaults = {};

  //The plugin constructor
  function MobileMenu(element, options) {
    this.$element = $(element);
    this.options = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this._onOpen = options.onOpen || $.noop;
    this._onClose = options.onClose || $.noop;
    this.init();
  }

  MobileMenu.prototype.init = function() {
    var menuToggle = this.menuToggle.bind(this);
    var subToggle = this.subToggle.bind(this);

    this.$menuToggleBtn = this.$element.find('.mob_menu_toggle');
    this.$menuToggleBtn.on('click', menuToggle);

    this.$subMenuToggleBtns = this.$element.find('.mob_more_toggle');
    this.$subMenuToggleBtns.on('click', subToggle);

    this.$subMenuWrappers = this.$element.find('li');
  };

  MobileMenu.prototype.menuToggle = function(event) {
    this.$element.toggleClass('menu_open');

    if(! this.$element.hasClass('menu_open')) {
      this.closeSubMenus();
      this._onClose(event);
    } else {
      this._onOpen(event);
    }
  };

  MobileMenu.prototype.subToggle = function(event) {
    var $buttonClicked = $(event.target);
    var $subMenu = $buttonClicked.closest('li');

    $subMenu.toggleClass('sub_menu_open');
    this.closeSubMenus($subMenu);
  };

  MobileMenu.prototype.closeSubMenus = function(exclude) {
    if(! exclude) {
      return this.$subMenuWrappers.removeClass('sub_menu_open');
    }

    this.$subMenuWrappers.each(function(index) {
      if(this !== exclude.get(0)) {
        $(this).removeClass('sub_menu_open');
      }
    });
  };

  $.fn[pluginName] = function(options) {
    return this.each(function() {
      if (!$.data(this, 'plugin_' + pluginName)) {

        var pluginInstance = new MobileMenu(this, options);
        $.data(this, 'plugin_' + pluginName, pluginInstance);

      }
    });
  };

})(jQuery, window, document);

},{}],5:[function(require,module,exports){
var Events = require('backbone-events-standalone');
var extend = require('amp-extend');
var bind = require('amp-bind');


// Handles cross-browser history management, based on either
// [pushState](http://diveintohtml5.info/history.html) and real URLs, or
// [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
// and URL fragments. If the browser supports neither.
var History = function () {
    this.handlers = [];
    this.checkUrl = bind(this.checkUrl, this);

    // Ensure that `History` can be used outside of the browser.
    if (typeof window !== 'undefined') {
        this.location = window.location;
        this.history = window.history;
    }
};

// Cached regex for stripping a leading hash/slash and trailing space.
var routeStripper = /^[#\/]|\s+$/g;

// Cached regex for stripping leading and trailing slashes.
var rootStripper = /^\/+|\/+$/g;

// Cached regex for stripping urls of hash.
var pathStripper = /#.*$/;

// Has the history handling already been started?
History.started = false;

// Set up all inheritable **Backbone.History** properties and methods.
extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Are we at the app root?
    atRoot: function () {
        var path = this.location.pathname.replace(/[^\/]$/, '$&/');
        return path === this.root && !this.location.search;
    },

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function (window) {
        var match = (window || this).location.href.match(/#(.*)$/);
        return match ? match[1] : '';
    },

    // Get the pathname and search params, without the root.
    getPath: function () {
        var path = decodeURI(this.location.pathname + this.location.search);
        var root = this.root.slice(0, -1);
        if (!path.indexOf(root)) path = path.slice(root.length);
        return path.slice(1);
    },

    // Get the cross-browser normalized URL fragment from the path or hash.
    getFragment: function (fragment) {
        if (fragment == null) {
            if (this._hasPushState || !this._wantsHashChange) {
                fragment = this.getPath();
            } else {
                fragment = this.getHash();
            }
        }
        return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function (options) {
        if (History.started) throw new Error("Backbone.history has already been started");
        History.started = true;

        // Figure out the initial configuration.
        // Is pushState desired ... is it available?
        this.options          = extend({root: '/'}, this.options, options);
        this.root             = this.options.root;
        this._wantsHashChange = this.options.hashChange !== false;
        this._hasHashChange   = 'onhashchange' in window;
        this._wantsPushState  = !!this.options.pushState;
        this._hasPushState    = !!(this.options.pushState && this.history && this.history.pushState);
        this.fragment         = this.getFragment();

        // Add a cross-platform `addEventListener` shim for older browsers.
        var addEventListener = window.addEventListener;

        // Normalize root to always include a leading and trailing slash.
        this.root = ('/' + this.root + '/').replace(rootStripper, '/');

        // Depending on whether we're using pushState or hashes, and whether
        // 'onhashchange' is supported, determine how we check the URL state.
        if (this._hasPushState) {
            addEventListener('popstate', this.checkUrl, false);
        } else if (this._wantsHashChange && this._hasHashChange) {
            addEventListener('hashchange', this.checkUrl, false);
        } else if (this._wantsHashChange) {
            this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
        }

        // Transition from hashChange to pushState or vice versa if both are
        // requested.
        if (this._wantsHashChange && this._wantsPushState) {

            // If we've started off with a route from a `pushState`-enabled
            // browser, but we're currently in a browser that doesn't support it...
            if (!this._hasPushState && !this.atRoot()) {
                this.location.replace(this.root + '#' + this.getPath());
                // Return immediately as browser will do redirect to new url
                return true;

            // Or if we've started out with a hash-based route, but we're currently
            // in a browser where it could be `pushState`-based instead...
            } else if (this._hasPushState && this.atRoot()) {
                this.navigate(this.getHash(), {replace: true});
            }
        }

        if (!this.options.silent) return this.loadUrl();
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function () {
        // Add a cross-platform `removeEventListener` shim for older browsers.
        var removeEventListener = window.removeEventListener;

        // Remove window listeners.
        if (this._hasPushState) {
            removeEventListener('popstate', this.checkUrl, false);
        } else if (this._wantsHashChange && this._hasHashChange) {
            removeEventListener('hashchange', this.checkUrl, false);
        }

        // Some environments will throw when clearing an undefined interval.
        if (this._checkUrlInterval) clearInterval(this._checkUrlInterval);
        History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function (route, callback) {
        this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`.
    checkUrl: function (e) {
        var current = this.getFragment();
        if (current === this.fragment) return false;
        this.loadUrl();
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function (fragment) {
        fragment = this.fragment = this.getFragment(fragment);
        return this.handlers.some(function (handler) {
            if (handler.route.test(fragment)) {
                handler.callback(fragment);
                return true;
            }
        });
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function (fragment, options) {
        if (!History.started) return false;
        if (!options || options === true) options = {trigger: !!options};

        var url = this.root + (fragment = this.getFragment(fragment || ''));

        // Strip the hash and decode for matching.
        fragment = decodeURI(fragment.replace(pathStripper, ''));

        if (this.fragment === fragment) return;
        this.fragment = fragment;

        // Don't include a trailing slash on the root.
        if (fragment === '' && url !== '/') url = url.slice(0, -1);

        // If pushState is available, we use it to set the fragment as a real URL.
        if (this._hasPushState) {
            this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

            // If hash changes haven't been explicitly disabled, update the hash
            // fragment to store history.
        } else if (this._wantsHashChange) {
            this._updateHash(this.location, fragment, options.replace);
            // If you've told us that you explicitly don't want fallback hashchange-
            // based history, then `navigate` becomes a page refresh.
        } else {
            return this.location.assign(url);
        }
        if (options.trigger) return this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function (location, fragment, replace) {
        if (replace) {
            var href = location.href.replace(/(javascript:|#).*$/, '');
            location.replace(href + '#' + fragment);
        } else {
            // Some browsers require that `hash` contains a leading #.
            location.hash = '#' + fragment;
        }
    }

});

module.exports = new History();

},{"amp-bind":7,"amp-extend":9,"backbone-events-standalone":27}],6:[function(require,module,exports){
;if (typeof window !== "undefined") {  window.ampersand = window.ampersand || {};  window.ampersand["ampersand-router"] = window.ampersand["ampersand-router"] || [];  window.ampersand["ampersand-router"].push("1.0.7");}
var classExtend = require('ampersand-class-extend');
var Events = require('backbone-events-standalone');
var ampHistory = require('./ampersand-history');
var extend = require('amp-extend');
var isRegexp = require('amp-is-regexp');
var isFunction = require('amp-is-function');
var result = require('amp-result');

// Routers map faux-URLs to actions, and fire events when routes are
// matched. Creating a new one sets its `routes` hash, if not set statically.
var Router = module.exports = function (options) {
    options || (options = {});
    this.history = options.history || ampHistory;
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
};

// Cached regular expressions for matching named param parts and splatted
// parts of route strings.
var optionalParam = /\((.*?)\)/g;
var namedParam    = /(\(\?)?:\w+/g;
var splatParam    = /\*\w+/g;
var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

// Set up all inheritable **Backbone.Router** properties and methods.
extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function () {},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function (query, num) {
    //       ...
    //     });
    //
    route: function (route, name, callback) {
        if (!isRegexp(route)) route = this._routeToRegExp(route);
        if (isFunction(name)) {
            callback = name;
            name = '';
        }
        if (!callback) callback = this[name];
        var router = this;
        this.history.route(route, function (fragment) {
            var args = router._extractParameters(route, fragment);
            if (router.execute(callback, args, name) !== false) {
                router.trigger.apply(router, ['route:' + name].concat(args));
                router.trigger('route', name, args);
                router.history.trigger('route', router, name, args);
            }
        });
        return this;
    },

    // Execute a route handler with the provided parameters.  This is an
    // excellent place to do pre-route setup or post-route cleanup.
    execute: function (callback, args, name) {
        if (callback) callback.apply(this, args);
    },

    // Simple proxy to `ampHistory` to save a fragment into the history.
    navigate: function (fragment, options) {
        this.history.navigate(fragment, options);
        return this;
    },

    // Helper for doing `internal` redirects without adding to history
    // and thereby breaking backbutton functionality.
    redirectTo: function (newUrl) {
        this.navigate(newUrl, {replace: true, trigger: true});
    },

    // Bind all defined routes to `history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function () {
        if (!this.routes) return;
        this.routes = result(this, 'routes');
        var route, routes = Object.keys(this.routes);
        while ((route = routes.pop()) != null) {
            this.route(route, this.routes[route]);
        }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function (route) {
        route = route
            .replace(escapeRegExp, '\\$&')
            .replace(optionalParam, '(?:$1)?')
            .replace(namedParam, function (match, optional) {
                return optional ? match : '([^/?]+)';
            })
            .replace(splatParam, '([^?]*?)');
        return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted decoded parameters. Empty or unmatched parameters will be
    // treated as `null` to normalize cross-browser behavior.
    _extractParameters: function (route, fragment) {
        var params = route.exec(fragment).slice(1);
        return params.map(function (param, i) {
            // Don't decode the search params.
            if (i === params.length - 1) return param || null;
            return param ? decodeURIComponent(param) : null;
        });
    }

});

Router.extend = classExtend;

},{"./ampersand-history":5,"amp-extend":9,"amp-is-function":11,"amp-is-regexp":12,"amp-result":13,"ampersand-class-extend":14,"backbone-events-standalone":27}],7:[function(require,module,exports){
var isFunction = require('amp-is-function');
var isObject = require('amp-is-object');
var nativeBind = Function.prototype.bind;
var slice = Array.prototype.slice;
var Ctor = function () {};


module.exports = function bind(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!isFunction(func)) throw new TypeError('Bind must be called on a function');
    args = slice.call(arguments, 2);
    bound = function() {
        if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
        Ctor.prototype = func.prototype;
        var self = new Ctor();
        Ctor.prototype = null;
        var result = func.apply(self, args.concat(slice.call(arguments)));
        if (isObject(result)) return result;
        return self;
    };
    return bound;
};

},{"amp-is-function":11,"amp-is-object":8}],8:[function(require,module,exports){
module.exports = function isObject(obj) {
    var type = typeof obj;
    return !!obj && (type === 'function' || type === 'object');
};

},{}],9:[function(require,module,exports){
var isObject = require('amp-is-object');


module.exports = function(obj) {
    if (!isObject(obj)) return obj;
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
        source = arguments[i];
        for (prop in source) {
            obj[prop] = source[prop];
        }
    }
    return obj;
};

},{"amp-is-object":10}],10:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],11:[function(require,module,exports){
var toString = Object.prototype.toString;
var func = function isFunction(obj) {
    return toString.call(obj) === '[object Function]';
};

// Optimize `isFunction` if appropriate. Work around an IE 11 bug.
if (typeof /./ !== 'function') {
    func = function isFunction(obj) {
      return typeof obj == 'function' || false;
    };
}

module.exports = func;

},{}],12:[function(require,module,exports){
var toString = Object.prototype.toString;


module.exports = function isRegExp(obj) {
    return toString.call(obj) === '[object RegExp]';
};

},{}],13:[function(require,module,exports){
var isFunction = require('amp-is-function');


module.exports = function result(object, property, defaultValue) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
        return isFunction(defaultValue) ? defaultValue() : defaultValue;
    }
    return isFunction(value) ? object[property]() : value;
};

},{"amp-is-function":11}],14:[function(require,module,exports){
var assign = require('lodash.assign');

/// Following code is largely pasted from Backbone.js

// Helper function to correctly set up the prototype chain, for subclasses.
// Similar to `goog.inherits`, but uses a hash of prototype properties and
// class properties to be extended.
var extend = function(protoProps) {
    var parent = this;
    var child;
    var args = [].slice.call(arguments);

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
        child = protoProps.constructor;
    } else {
        child = function () {
            return parent.apply(this, arguments);
        };
    }

    // Add static properties to the constructor function from parent
    assign(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate();

    // Mix in all prototype properties to the subclass if supplied.
    if (protoProps) {
        args.unshift(child.prototype);
        assign.apply(null, args);
    }

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
};

// Expose the extend function
module.exports = extend;

},{"lodash.assign":15}],15:[function(require,module,exports){
/**
 * lodash 3.2.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseAssign = require('lodash._baseassign'),
    createAssigner = require('lodash._createassigner'),
    keys = require('lodash.keys');

/**
 * A specialized version of `_.assign` for customizing assigned values without
 * support for argument juggling, multiple sources, and `this` binding `customizer`
 * functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {Function} customizer The function to customize assigned values.
 * @returns {Object} Returns `object`.
 */
function assignWith(object, source, customizer) {
  var index = -1,
      props = keys(source),
      length = props.length;

  while (++index < length) {
    var key = props[index],
        value = object[key],
        result = customizer(value, source[key], key, object, source);

    if ((result === result ? (result !== value) : (value === value)) ||
        (value === undefined && !(key in object))) {
      object[key] = result;
    }
  }
  return object;
}

/**
 * Assigns own enumerable properties of source object(s) to the destination
 * object. Subsequent sources overwrite property assignments of previous sources.
 * If `customizer` is provided it is invoked to produce the assigned values.
 * The `customizer` is bound to `thisArg` and invoked with five arguments:
 * (objectValue, sourceValue, key, object, source).
 *
 * **Note:** This method mutates `object` and is based on
 * [`Object.assign`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.assign).
 *
 * @static
 * @memberOf _
 * @alias extend
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {*} [thisArg] The `this` binding of `customizer`.
 * @returns {Object} Returns `object`.
 * @example
 *
 * _.assign({ 'user': 'barney' }, { 'age': 40 }, { 'user': 'fred' });
 * // => { 'user': 'fred', 'age': 40 }
 *
 * // using a customizer callback
 * var defaults = _.partialRight(_.assign, function(value, other) {
 *   return _.isUndefined(value) ? other : value;
 * });
 *
 * defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });
 * // => { 'user': 'barney', 'age': 36 }
 */
var assign = createAssigner(function(object, source, customizer) {
  return customizer
    ? assignWith(object, source, customizer)
    : baseAssign(object, source);
});

module.exports = assign;

},{"lodash._baseassign":16,"lodash._createassigner":18,"lodash.keys":22}],16:[function(require,module,exports){
/**
 * lodash 3.2.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseCopy = require('lodash._basecopy'),
    keys = require('lodash.keys');

/**
 * The base implementation of `_.assign` without support for argument juggling,
 * multiple sources, and `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return source == null
    ? object
    : baseCopy(source, keys(source), object);
}

module.exports = baseAssign;

},{"lodash._basecopy":17,"lodash.keys":22}],17:[function(require,module,exports){
/**
 * lodash 3.0.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property names to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @returns {Object} Returns `object`.
 */
function baseCopy(source, props, object) {
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];
    object[key] = source[key];
  }
  return object;
}

module.exports = baseCopy;

},{}],18:[function(require,module,exports){
/**
 * lodash 3.1.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var bindCallback = require('lodash._bindcallback'),
    isIterateeCall = require('lodash._isiterateecall'),
    restParam = require('lodash.restparam');

/**
 * Creates a function that assigns properties of source object(s) to a given
 * destination object.
 *
 * **Note:** This function is used to create `_.assign`, `_.defaults`, and `_.merge`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return restParam(function(object, sources) {
    var index = -1,
        length = object == null ? 0 : sources.length,
        customizer = length > 2 ? sources[length - 2] : undefined,
        guard = length > 2 ? sources[2] : undefined,
        thisArg = length > 1 ? sources[length - 1] : undefined;

    if (typeof customizer == 'function') {
      customizer = bindCallback(customizer, thisArg, 5);
      length -= 2;
    } else {
      customizer = typeof thisArg == 'function' ? thisArg : undefined;
      length -= (customizer ? 1 : 0);
    }
    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, customizer);
      }
    }
    return object;
  });
}

module.exports = createAssigner;

},{"lodash._bindcallback":19,"lodash._isiterateecall":20,"lodash.restparam":21}],19:[function(require,module,exports){
/**
 * lodash 3.0.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * A specialized version of `baseCallback` which only supports `this` binding
 * and specifying the number of arguments to provide to `func`.
 *
 * @private
 * @param {Function} func The function to bind.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {number} [argCount] The number of arguments to provide to `func`.
 * @returns {Function} Returns the callback.
 */
function bindCallback(func, thisArg, argCount) {
  if (typeof func != 'function') {
    return identity;
  }
  if (thisArg === undefined) {
    return func;
  }
  switch (argCount) {
    case 1: return function(value) {
      return func.call(thisArg, value);
    };
    case 3: return function(value, index, collection) {
      return func.call(thisArg, value, index, collection);
    };
    case 4: return function(accumulator, value, index, collection) {
      return func.call(thisArg, accumulator, value, index, collection);
    };
    case 5: return function(value, other, key, object, source) {
      return func.call(thisArg, value, other, key, object, source);
    };
  }
  return function() {
    return func.apply(thisArg, arguments);
  };
}

/**
 * This method returns the first argument provided to it.
 *
 * @static
 * @memberOf _
 * @category Utility
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'user': 'fred' };
 *
 * _.identity(object) === object;
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = bindCallback;

},{}],20:[function(require,module,exports){
/**
 * lodash 3.0.9 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** Used to detect unsigned integer values. */
var reIsUint = /^\d+$/;

/**
 * Used as the [maximum length](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
 * that affects Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

/**
 * Checks if `value` is array-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 */
function isArrayLike(value) {
  return value != null && isLength(getLength(value));
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return value > -1 && value % 1 == 0 && value < length;
}

/**
 * Checks if the provided arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
      ? (isArrayLike(object) && isIndex(index, object.length))
      : (type == 'string' && index in object)) {
    var other = object[index];
    return value === value ? (value === other) : (other !== other);
  }
  return false;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = isIterateeCall;

},{}],21:[function(require,module,exports){
/**
 * lodash 3.6.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Native method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * Creates a function that invokes `func` with the `this` binding of the
 * created function and arguments from `start` and beyond provided as an array.
 *
 * **Note:** This method is based on the [rest parameter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters).
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 * @example
 *
 * var say = _.restParam(function(what, names) {
 *   return what + ' ' + _.initial(names).join(', ') +
 *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
 * });
 *
 * say('hello', 'fred', 'barney', 'pebbles');
 * // => 'hello fred, barney, & pebbles'
 */
function restParam(func, start) {
  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  start = nativeMax(start === undefined ? (func.length - 1) : (+start || 0), 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        rest = Array(length);

    while (++index < length) {
      rest[index] = args[start + index];
    }
    switch (start) {
      case 0: return func.call(this, rest);
      case 1: return func.call(this, args[0], rest);
      case 2: return func.call(this, args[0], args[1], rest);
    }
    var otherArgs = Array(start + 1);
    index = -1;
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = rest;
    return func.apply(this, otherArgs);
  };
}

module.exports = restParam;

},{}],22:[function(require,module,exports){
/**
 * lodash 3.1.2 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var getNative = require('lodash._getnative'),
    isArguments = require('lodash.isarguments'),
    isArray = require('lodash.isarray');

/** Used to detect unsigned integer values. */
var reIsUint = /^\d+$/;

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/* Native method references for those with the same name as other `lodash` methods. */
var nativeKeys = getNative(Object, 'keys');

/**
 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
 * that affects Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

/**
 * Checks if `value` is array-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 */
function isArrayLike(value) {
  return value != null && isLength(getLength(value));
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return value > -1 && value % 1 == 0 && value < length;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * A fallback implementation of `Object.keys` which creates an array of the
 * own enumerable property names of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function shimKeys(object) {
  var props = keysIn(object),
      propsLength = props.length,
      length = propsLength && object.length;

  var allowIndexes = !!length && isLength(length) &&
    (isArray(object) || isArguments(object));

  var index = -1,
      result = [];

  while (++index < propsLength) {
    var key = props[index];
    if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
var keys = !nativeKeys ? shimKeys : function(object) {
  var Ctor = object == null ? undefined : object.constructor;
  if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
      (typeof object != 'function' && isArrayLike(object))) {
    return shimKeys(object);
  }
  return isObject(object) ? nativeKeys(object) : [];
};

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  if (object == null) {
    return [];
  }
  if (!isObject(object)) {
    object = Object(object);
  }
  var length = object.length;
  length = (length && isLength(length) &&
    (isArray(object) || isArguments(object)) && length) || 0;

  var Ctor = object.constructor,
      index = -1,
      isProto = typeof Ctor == 'function' && Ctor.prototype === object,
      result = Array(length),
      skipIndexes = length > 0;

  while (++index < length) {
    result[index] = (index + '');
  }
  for (var key in object) {
    if (!(skipIndexes && isIndex(key, length)) &&
        !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = keys;

},{"lodash._getnative":23,"lodash.isarguments":24,"lodash.isarray":25}],23:[function(require,module,exports){
/**
 * lodash 3.9.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var funcTag = '[object Function]';

/** Used to detect host constructors (Safari > 5). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = object == null ? undefined : object[key];
  return isNative(value) ? value : undefined;
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in older versions of Chrome and Safari which return 'function' for regexes
  // and Safari 8 equivalents which return 'object' for typed array constructors.
  return isObject(value) && objToString.call(value) == funcTag;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (isFunction(value)) {
    return reIsNative.test(fnToString.call(value));
  }
  return isObjectLike(value) && reIsHostCtor.test(value);
}

module.exports = getNative;

},{}],24:[function(require,module,exports){
/**
 * lodash 3.0.4 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Native method references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
 * that affects Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

/**
 * Checks if `value` is array-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 */
function isArrayLike(value) {
  return value != null && isLength(getLength(value));
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is classified as an `arguments` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  return isObjectLike(value) && isArrayLike(value) &&
    hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
}

module.exports = isArguments;

},{}],25:[function(require,module,exports){
/**
 * lodash 3.0.4 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var arrayTag = '[object Array]',
    funcTag = '[object Function]';

/** Used to detect host constructors (Safari > 5). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/* Native method references for those with the same name as other `lodash` methods. */
var nativeIsArray = getNative(Array, 'isArray');

/**
 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = object == null ? undefined : object[key];
  return isNative(value) ? value : undefined;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(function() { return arguments; }());
 * // => false
 */
var isArray = nativeIsArray || function(value) {
  return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
};

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in older versions of Chrome and Safari which return 'function' for regexes
  // and Safari 8 equivalents which return 'object' for typed array constructors.
  return isObject(value) && objToString.call(value) == funcTag;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (isFunction(value)) {
    return reIsNative.test(fnToString.call(value));
  }
  return isObjectLike(value) && reIsHostCtor.test(value);
}

module.exports = isArray;

},{}],26:[function(require,module,exports){
/**
 * Standalone extraction of Backbone.Events, no external dependency required.
 * Degrades nicely when Backone/underscore are already available in the current
 * global context.
 *
 * Note that docs suggest to use underscore's `_.extend()` method to add Events
 * support to some given object. A `mixin()` method has been added to the Events
 * prototype to avoid using underscore for that sole purpose:
 *
 *     var myEventEmitter = BackboneEvents.mixin({});
 *
 * Or for a function constructor:
 *
 *     function MyConstructor(){}
 *     MyConstructor.prototype.foo = function(){}
 *     BackboneEvents.mixin(MyConstructor.prototype);
 *
 * (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
 * (c) 2013 Nicolas Perriault
 */
/* global exports:true, define, module */
(function() {
  var root = this,
      breaker = {},
      nativeForEach = Array.prototype.forEach,
      hasOwnProperty = Object.prototype.hasOwnProperty,
      slice = Array.prototype.slice,
      idCounter = 0;

  // Returns a partial implementation matching the minimal API subset required
  // by Backbone.Events
  function miniscore() {
    return {
      keys: Object.keys,

      uniqueId: function(prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
      },

      has: function(obj, key) {
        return hasOwnProperty.call(obj, key);
      },

      each: function(obj, iterator, context) {
        if (obj == null) return;
        if (nativeForEach && obj.forEach === nativeForEach) {
          obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
          for (var i = 0, l = obj.length; i < l; i++) {
            if (iterator.call(context, obj[i], i, obj) === breaker) return;
          }
        } else {
          for (var key in obj) {
            if (this.has(obj, key)) {
              if (iterator.call(context, obj[key], key, obj) === breaker) return;
            }
          }
        }
      },

      once: function(func) {
        var ran = false, memo;
        return function() {
          if (ran) return memo;
          ran = true;
          memo = func.apply(this, arguments);
          func = null;
          return memo;
        };
      }
    };
  }

  var _ = miniscore(), Events;

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  Events = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _.once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = {};
        return this;
      }

      names = name ? [name] : _.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeners = this._listeners;
      if (!listeners) return this;
      var deleteListener = !name && !callback;
      if (typeof name === 'object') callback = this;
      if (obj) (listeners = {})[obj._listenerId] = obj;
      for (var id in listeners) {
        listeners[id].off(name, callback, this);
        if (deleteListener) delete this._listeners[id];
      }
      return this;
    }

  };

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
    }
  };

  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  _.each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback) {
      var listeners = this._listeners || (this._listeners = {});
      var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
      listeners[id] = obj;
      if (typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  });

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Mixin utility
  Events.mixin = function(proto) {
    var exports = ['on', 'once', 'off', 'trigger', 'stopListening', 'listenTo',
                   'listenToOnce', 'bind', 'unbind'];
    _.each(exports, function(name) {
      proto[name] = this[name];
    }, this);
    return proto;
  };

  // Export Events as BackboneEvents depending on current context
  if (typeof define === "function") {
    define(function() {
      return Events;
    });
  } else if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = Events;
    }
    exports.BackboneEvents = Events;
  } else {
    root.BackboneEvents = Events;
  }
})(this);

},{}],27:[function(require,module,exports){
module.exports = require('./backbone-events-standalone');

},{"./backbone-events-standalone":26}],28:[function(require,module,exports){
(function (window) {
    var requestAnimFrame = (function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||function(callback){window.setTimeout(callback,1000/60);};})();

    var easeInOutQuad = function (t, b, c, d) {
        t /= d/2;
        if (t < 1) return c/2*t*t + b;
        t--;
        return -c/2 * (t*(t-2) - 1) + b;
    };

    var animatedScrollTo = function (element, to, duration, callback) {
        var start = element.scrollTop,
        change = to - start,
        animationStart = +new Date();
        var animating = true;
        var lastpos = null;

        var animateScroll = function() {
            if (!animating) {
                return;
            }
            requestAnimFrame(animateScroll);
            var now = +new Date();
            var val = Math.floor(easeInOutQuad(now - animationStart, start, change, duration));
            if (lastpos) {
                if (lastpos === element.scrollTop) {
                    lastpos = val;
                    element.scrollTop = val;
                } else {
                    animating = false;
                }
            } else {
                lastpos = val;
                element.scrollTop = val;
            }
            if (now > animationStart + duration) {
                element.scrollTop = to;
                animating = false;
                if (callback) { callback(); }
            }
        };
        requestAnimFrame(animateScroll);
    };

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = animatedScrollTo;
    } else {
        window.animatedScrollTo = animatedScrollTo;
    }
})(window);

},{}],29:[function(require,module,exports){
/*
 * classList.js: Cross-browser full element.classList implementation.
 * 2014-07-23
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

/* Copied from MDN:
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
 */

if ("document" in self) {

  // Full polyfill for browsers with no classList support
  if (!("classList" in document.createElement("_"))) {

  (function (view) {

    "use strict";

    if (!('Element' in view)) return;

    var
        classListProp = "classList"
      , protoProp = "prototype"
      , elemCtrProto = view.Element[protoProp]
      , objCtr = Object
      , strTrim = String[protoProp].trim || function () {
        return this.replace(/^\s+|\s+$/g, "");
      }
      , arrIndexOf = Array[protoProp].indexOf || function (item) {
        var
            i = 0
          , len = this.length
        ;
        for (; i < len; i++) {
          if (i in this && this[i] === item) {
            return i;
          }
        }
        return -1;
      }
      // Vendors: please allow content code to instantiate DOMExceptions
      , DOMEx = function (type, message) {
        this.name = type;
        this.code = DOMException[type];
        this.message = message;
      }
      , checkTokenAndGetIndex = function (classList, token) {
        if (token === "") {
          throw new DOMEx(
              "SYNTAX_ERR"
            , "An invalid or illegal string was specified"
          );
        }
        if (/\s/.test(token)) {
          throw new DOMEx(
              "INVALID_CHARACTER_ERR"
            , "String contains an invalid character"
          );
        }
        return arrIndexOf.call(classList, token);
      }
      , ClassList = function (elem) {
        var
            trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
          , classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
          , i = 0
          , len = classes.length
        ;
        for (; i < len; i++) {
          this.push(classes[i]);
        }
        this._updateClassName = function () {
          elem.setAttribute("class", this.toString());
        };
      }
      , classListProto = ClassList[protoProp] = []
      , classListGetter = function () {
        return new ClassList(this);
      }
    ;
    // Most DOMException implementations don't allow calling DOMException's toString()
    // on non-DOMExceptions. Error's toString() is sufficient here.
    DOMEx[protoProp] = Error[protoProp];
    classListProto.item = function (i) {
      return this[i] || null;
    };
    classListProto.contains = function (token) {
      token += "";
      return checkTokenAndGetIndex(this, token) !== -1;
    };
    classListProto.add = function () {
      var
          tokens = arguments
        , i = 0
        , l = tokens.length
        , token
        , updated = false
      ;
      do {
        token = tokens[i] + "";
        if (checkTokenAndGetIndex(this, token) === -1) {
          this.push(token);
          updated = true;
        }
      }
      while (++i < l);

      if (updated) {
        this._updateClassName();
      }
    };
    classListProto.remove = function () {
      var
          tokens = arguments
        , i = 0
        , l = tokens.length
        , token
        , updated = false
        , index
      ;
      do {
        token = tokens[i] + "";
        index = checkTokenAndGetIndex(this, token);
        while (index !== -1) {
          this.splice(index, 1);
          updated = true;
          index = checkTokenAndGetIndex(this, token);
        }
      }
      while (++i < l);

      if (updated) {
        this._updateClassName();
      }
    };
    classListProto.toggle = function (token, force) {
      token += "";

      var
          result = this.contains(token)
        , method = result ?
          force !== true && "remove"
        :
          force !== false && "add"
      ;

      if (method) {
        this[method](token);
      }

      if (force === true || force === false) {
        return force;
      } else {
        return !result;
      }
    };
    classListProto.toString = function () {
      return this.join(" ");
    };

    if (objCtr.defineProperty) {
      var classListPropDesc = {
          get: classListGetter
        , enumerable: true
        , configurable: true
      };
      try {
        objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
      } catch (ex) { // IE 8 doesn't support enumerable:true
        if (ex.number === -0x7FF5EC54) {
          classListPropDesc.enumerable = false;
          objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
        }
      }
    } else if (objCtr[protoProp].__defineGetter__) {
      elemCtrProto.__defineGetter__(classListProp, classListGetter);
    }

    }(self));

    } else {
    // There is full or partial native classList support, so just check if we need
    // to normalize the add/remove and toggle APIs.

    (function () {
      "use strict";

      var testElement = document.createElement("_");

      testElement.classList.add("c1", "c2");

      // Polyfill for IE 10/11 and Firefox <26, where classList.add and
      // classList.remove exist but support only one argument at a time.
      if (!testElement.classList.contains("c2")) {
        var createMethod = function(method) {
          var original = DOMTokenList.prototype[method];

          DOMTokenList.prototype[method] = function(token) {
            var i, len = arguments.length;

            for (i = 0; i < len; i++) {
              token = arguments[i];
              original.call(this, token);
            }
          };
        };
        createMethod('add');
        createMethod('remove');
      }

      testElement.classList.toggle("c3", false);

      // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
      // support the second argument.
      if (testElement.classList.contains("c3")) {
        var _toggle = DOMTokenList.prototype.toggle;

        DOMTokenList.prototype.toggle = function(token, force) {
          if (1 in arguments && !this.contains(token) === !force) {
            return force;
          } else {
            return _toggle.call(this, token);
          }
        };

      }

      testElement = null;
    }());
  }
}

},{}],30:[function(require,module,exports){
/*

© 2011 by Jerry Sievert

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

(function () {
    // constants
    var monthsAbbr = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
    ];

    var monthsFull = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];

    var daysAbbr = [
        'Sun',
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat'
    ];

    var daysFull = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
    ];

    var dayNames = {
        'su':         0,
        'sun':        0,
        'sunday':     0,
        'mo':         1,
        'mon':        1,
        'monday':     1,
        'tu':         2,
        'tue':        2,
        'tuesday':    2,
        'we':         3,
        'wed':        3,
        'wednesday':  3,
        'th':         4,
        'thu':        4,
        'thursday':   4,
        'fr':         5,
        'fri':        5,
        'friday':     5,
        'sa':         6,
        'sat':        6,
        'saturday':   6
    };
    var monthsAll = monthsFull.concat(monthsAbbr);
    var daysAll = [
        'su',
        'sun',
        'sunday',
        'mo',
        'mon',
        'monday',
        'tu',
        'tue',
        'tuesday',
        'we',
        'wed',
        'wednesday',
        'th',
        'thu',
        'thursday',
        'fr',
        'fri',
        'friday',
        'sa',
        'sat',
        'saturday'
    ];

    var monthNames = {
        'jan':        0,
        'january':    0,
        'feb':        1,
        'february':   1,
        'mar':        2,
        'march':      2,
        'apr':        3,
        'april':      3,
        'may':        4,
        'jun':        5,
        'june':       5,
        'jul':        6,
        'july':       6,
        'aug':        7,
        'august':     7,
        'sep':        8,
        'september':  8,
        'oct':        9,
        'october':    9,
        'nov':        10,
        'november':   10,
        'dec':        11,
        'december':   11
    };

    var daysInMonth = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];


    // private helper functions
    /** @ignore */
    function pad(str, length) {
        str = String(str);
        while (str.length < length) {
            str = '0' + str;
        }
        return str;
    }

    var isInteger = function (str) {
        if (str.match(/^(\d+)$/)) {
            return true;
        }
        return false;
    };
    var getInt = function (str, i, minlength, maxlength) {
        for (var x = maxlength; x >= minlength; x--) {
            var token = str.substring(i, i + x);
            if (token.length < minlength) {
                return null;
            }
            if (isInteger(token)) {
                return token;
            }
        }
        return null;
    };

    // static class methods
    var origParse = Date.parse;
    // ------------------------------------------------------------------
    // getDateFromFormat( date_string , format_string )
    //
    // This function takes a date string and a format string. It matches
    // If the date string matches the format string, it returns the
    // getTime() of the date. If it does not match, it returns NaN.
    // Original Author: Matt Kruse <matt@mattkruse.com>
    // WWW: http://www.mattkruse.com/
    // Adapted from: http://www.mattkruse.com/javascript/date/source.html
    // ------------------------------------------------------------------


    var getDateFromFormat = function (val, format) {
        val = val + "";
        format = format + "";
        var iVal = 0;
        var iFormat = 0;
        var c = "";
        var token = "";
        var token2 = "";
        var x, y;
        var now = new Date();
        var year = now.getYear();
        var month = now.getMonth() + 1;
        var date = 1;
        var hh = 0;
        var mm = 0;
        var ss = 0;
        var ampm = "";



        while (iFormat < format.length) {
            // Get next token from format string
            c = format.charAt(iFormat);
            token = "";
            while ((format.charAt(iFormat) === c) && (iFormat < format.length)) {
                token += format.charAt(iFormat++);
            }
            // Extract contents of value based on format token
            if (token === "yyyy" || token === "yy" || token === "y") {
                if (token === "yyyy") {
                    x = 4;
                    y = 4;
                }
                if (token === "yy") {
                    x = 2;
                    y = 2;
                }
                if (token === "y") {
                    x = 2;
                    y = 4;
                }
                year = getInt(val, iVal, x, y);
                if (year === null) {
                    return NaN;
                }
                iVal += year.length;
                if (year.length === 2) {
                    if (year > 70) {
                        year = 1900 + (year - 0);
                    } else {
                        year = 2000 + (year - 0);
                    }
                }
            } else if (token === "MMM" || token === "NNN") {
                month = 0;
                for (var i = 0; i < monthsAll.length; i++) {
                    var monthName = monthsAll[i];
                    if (val.substring(iVal, iVal + monthName.length).toLowerCase() === monthName.toLowerCase()) {
                        if (token === "MMM" || (token === "NNN" && i > 11)) {
                            month = i + 1;
                            if (month > 12) {
                                month -= 12;
                            }
                            iVal += monthName.length;
                            break;
                        }
                    }
                }
                if ((month < 1) || (month > 12)) {
                    return NaN;
                }
            } else if (token === "EE" || token === "E") {
                for (var n = 0; n < daysAll.length; n++) {
                    var dayName = daysAll[n];
                    if (val.substring(iVal, iVal + dayName.length).toLowerCase() === dayName.toLowerCase()) {
                        iVal += dayName.length;
                        break;
                    }
                }
            } else if (token === "MM" || token === "M") {
                month = getInt(val, iVal, token.length, 2);
                if (month === null || (month < 1) || (month > 12)) {
                    return NaN;
                }
                iVal += month.length;
            } else if (token === "dd" || token === "d") {
                date = getInt(val, iVal, token.length, 2);
                if (date === null || (date < 1) || (date > 31)) {
                    return NaN;
                }
                iVal += date.length;
            } else if (token === "hh" || token === "h") {
                hh = getInt(val, iVal, token.length, 2);
                if (hh === null || (hh < 1) || (hh > 12)) {
                    return NaN;
                }
                iVal += hh.length;
            } else if (token === "HH" || token === "H") {
                hh = getInt(val, iVal, token.length, 2);
                if (hh === null || (hh < 0) || (hh > 23)) {
                    return NaN;
                }
                iVal += hh.length;
            } else if (token === "KK" || token === "K") {
                hh = getInt(val, iVal, token.length, 2);
                if (hh === null || (hh < 0) || (hh > 11)) {
                    return NaN;
                }
                iVal += hh.length;
            } else if (token === "kk" || token === "k") {
                hh = getInt(val, iVal, token.length, 2);
                if (hh === null || (hh < 1) || (hh > 24)) {
                    return NaN;
                }
                iVal += hh.length;
                hh--;
            } else if (token === "mm" || token === "m") {
                mm = getInt(val, iVal, token.length, 2);
                if (mm === null || (mm < 0) || (mm > 59)) {
                    return NaN;
                }
                iVal += mm.length;
            } else if (token === "ss" || token === "s") {
                ss = getInt(val, iVal, token.length, 2);
                if (ss === null || (ss < 0) || (ss > 59)) {
                    return NaN;
                }
                iVal += ss.length;
            } else if (token === "a") {
                if (val.substring(iVal, iVal + 2).toLowerCase() === "am") {
                    ampm = "AM";
                } else if (val.substring(iVal, iVal + 2).toLowerCase() === "pm") {
                    ampm = "PM";
                } else {
                    return NaN;
                }
                iVal += 2;
            } else {
                if (val.substring(iVal, iVal + token.length) !== token) {
                    return NaN;
                } else {
                    iVal += token.length;
                }
            }
        }
        // If there are any trailing characters left in the value, it doesn't match
        if (iVal !== val.length) {
            return NaN;
        }
        // Is date valid for month?
        if (month === 2) {
            // Check for leap year
            if (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)) { // leap year
                if (date > 29) {
                    return NaN;
                }
            } else {
                if (date > 28) {
                    return NaN;
                }
            }
        }
        if ((month === 4) || (month === 6) || (month === 9) || (month === 11)) {
            if (date > 30) {
                return NaN;
            }
        }
        // Correct hours value
        if (hh < 12 && ampm === "PM") {
            hh = hh - 0 + 12;
        } else if (hh > 11 && ampm === "AM") {
            hh -= 12;
        }
        var newdate = new Date(year, month - 1, date, hh, mm, ss);
        return newdate.getTime();
    };


    /** @ignore */
    Date.parse = function (date, format) {
        if (format) {
            return getDateFromFormat(date, format);
        }
        var timestamp = origParse(date), minutesOffset = 0, match;
        if (isNaN(timestamp) && (match = /^(\d{4}|[+\-]\d{6})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3,}))?)?(?:(Z)|([+\-])(\d{2})(?::?(\d{2}))?))?/.exec(date))) {
            if (match[8] !== 'Z') {
                minutesOffset = +match[10] * 60 + (+match[11]);

                if (match[9] === '+') {
                    minutesOffset = 0 - minutesOffset;
                }
            }

            match[7] = match[7] || '000';

            timestamp = Date.UTC(+match[1], +match[2] - 1, +match[3], +match[4], +match[5] + minutesOffset, +match[6], +match[7].substr(0, 3));
        }

        return timestamp;
    };

    function polyfill(name, func) {
        if (Date.prototype[name] === undefined) {
            Date.prototype[name] = func;
        }
    }

    /**
        Returns new instance of Date object with the date set to today and
        the time set to midnight
        @returns {Date} Today's Date
        @function
     */
    Date.today = function () {
        return new Date().clearTime();
    };

    /**
        Returns new instance of Date object with the date set to today and
        the time set to midnight in UTC
        @returns {Date} Today's Date in UTC
        @function
     */
    Date.UTCtoday = function () {
        return new Date().clearUTCTime();
    };

    /**
        Returns new instance of Date object with the date set to tomorrow and
        the time set to midnight
        @returns {Date} Tomorrow's Date
        @function
     */
    Date.tomorrow = function () {
        return Date.today().add({days: 1});
    };

    /**
        Returns new instance of Date object with the date set to tomorrow and
        the time set to midnight in UTC
        @returns {Date} Tomorrow's Date in UTC
        @function
     */
    Date.UTCtomorrow = function () {
        return Date.UTCtoday().add({days: 1});
    };

    /**
        Returns new instance of Date object with the date set to yesterday and
        the time set to midnight
        @returns {Date} Yesterday's Date
        @function
     */
    Date.yesterday = function () {
        return Date.today().add({days: -1});
    };

    /**
        Returns new instance of Date object with the date set to yesterday and
        the time set to midnight in UTC
        @returns {Date} Yesterday's Date in UTC
        @function
     */
    Date.UTCyesterday = function () {
        return Date.UTCtoday().add({days: -1});
    };

    Date.validateDay = function (day, year, month) {
        var date = new Date(year, month, day);
        return (date.getFullYear() === year &&
            date.getMonth() === month &&
            date.getDate() === day);
    };

    Date.validateYear = function (year) {
        return (year >= 0 && year <= 9999);
    };

    Date.validateSecond = function (second) {
        return (second >= 0 && second < 60);
    };

    Date.validateMonth = function (month) {
        return (month >= 0 && month < 12);
    };

    Date.validateMinute = function (minute) {
        return (minute >= 0 && minute < 60);
    };

    Date.validateMillisecond = function (milli) {
        return (milli >= 0 && milli < 1000);
    };

    Date.validateHour = function (hour) {
        return (hour >= 0 && hour < 24);
    };

    Date.compare = function (date1, date2) {
        if (date1.valueOf() < date2.valueOf()) {
            return -1;
        } else if (date1.valueOf() > date2.valueOf()) {
            return 1;
        }
        return 0;
    };

    Date.equals = function (date1, date2) {
        return date1.valueOf() === date2.valueOf();
    };

    Date.equalsDay = function (date1, date2) {
        return date1.toYMD() === date2.toYMD();
    };

    Date.getDayNumberFromName = function (name) {
        return dayNames[name.toLowerCase()];
    };


    Date.getMonthNumberFromName = function (name) {
        return monthNames[name.toLowerCase()];
    };

    Date.getMonthNameFromNumber = function (number) {
        return monthsFull[number];
    };

    Date.getMonthAbbrFromNumber = function (number) {
        return monthsAbbr[number];
    };

    Date.isLeapYear = function (year) {
        return (new Date(year, 1, 29).getDate() === 29);
    };

    Date.getDaysInMonth = function (year, month) {
        if (month === 1) {
            return Date.isLeapYear(year) ? 29 : 28;
        }
        return daysInMonth[month];
    };

    polyfill('getMonthAbbr', function () {
        return monthsAbbr[this.getMonth()];
    });

    polyfill('getMonthName', function () {
        return monthsFull[this.getMonth()];
    });

    polyfill('getLastMonthName', function () {
        var i = this.getMonth();
        i = (i == 0 ? 11 : i - 1);
        return monthsFull[i];
    });

    polyfill('getUTCOffset', function () {
        var tz = pad(Math.abs(this.getTimezoneOffset() / 0.6), 4);
        if (this.getTimezoneOffset() > 0) {
            tz = '-' + tz;
        }
        return tz;
    });

    polyfill('toCLFString',  function () {
        return pad(this.getDate(), 2) + '/' + this.getMonthAbbr() + '/' +
               this.getFullYear() + ':' + pad(this.getHours(), 2) + ':' +
               pad(this.getMinutes(), 2) + ':' + pad(this.getSeconds(), 2) +
               ' ' + this.getUTCOffset();
    });

    polyfill('toYMD', function (separator) {
        separator = typeof separator === 'undefined' ? '-' : separator;
        return this.getFullYear() + separator + pad(this.getMonth() + 1, 2) +
            separator + pad(this.getDate(), 2);
    });

    polyfill('toDBString', function () {
        return this.getUTCFullYear() + '-' +  pad(this.getUTCMonth() + 1, 2) +
               '-' + pad(this.getUTCDate(), 2) + ' ' + pad(this.getUTCHours(), 2) +
               ':' + pad(this.getUTCMinutes(), 2) + ':' + pad(this.getUTCSeconds(), 2);
    });

    polyfill('clearTime', function () {
        this.setHours(0);
        this.setMinutes(0);
        this.setSeconds(0);
        this.setMilliseconds(0);

        return this;
    });

    polyfill('clearUTCTime', function () {
        this.setUTCHours(0);
        this.setUTCMinutes(0);
        this.setUTCSeconds(0);
        this.setUTCMilliseconds(0);

        return this;
    });

    polyfill('add', function (obj) {
        if (obj.milliseconds !== undefined) {
            this.setMilliseconds(this.getMilliseconds() + obj.milliseconds);
        }
        if (obj.seconds !== undefined) {
            this.setSeconds(this.getSeconds() + obj.seconds);
        }
        if (obj.minutes !== undefined) {
            this.setMinutes(this.getMinutes() + obj.minutes);
        }
        if (obj.hours !== undefined) {
            this.setHours(this.getHours() + obj.hours);
        }
        if (obj.days !== undefined) {
            this.setDate(this.getDate() + obj.days);
        }
        if (obj.weeks !== undefined) {
            this.setDate(this.getDate() + (obj.weeks * 7));
        }
        if (obj.months !== undefined) {
            this.setMonth(this.getMonth() + obj.months);
        }
        if (obj.years !== undefined) {
            this.setFullYear(this.getFullYear() + obj.years);
        }
        return this;
    });

    polyfill('addMilliseconds', function (milliseconds) {
        return this.add({ milliseconds: milliseconds });
    });

    polyfill('addSeconds', function (seconds) {
        return this.add({ seconds: seconds });
    });

    polyfill('addMinutes', function (minutes) {
        return this.add({ minutes: minutes });
    });

    polyfill('addHours', function (hours) {
        return this.add({ hours: hours });
    });

    polyfill('addDays', function (days) {
        return this.add({ days: days });
    });

    polyfill('addWeeks', function (weeks) {
        return this.add({ days: (weeks * 7) });
    });

    polyfill('addMonths', function (months) {
        return this.add({ months: months });
    });

    polyfill('addYears', function (years) {
        return this.add({ years: years });
    });

    polyfill('remove', function (obj) {
        if (obj.seconds !== undefined) {
            this.setSeconds(this.getSeconds() - obj.seconds);
        }
        if (obj.minutes !== undefined) {
            this.setMinutes(this.getMinutes() - obj.minutes);
        }
        if (obj.hours !== undefined) {
            this.setHours(this.getHours() - obj.hours);
        }
        if (obj.days !== undefined) {
            this.setDate(this.getDate() - obj.days);
        }
        if (obj.weeks !== undefined) {
            this.setDate(this.getDate() - (obj.weeks * 7));
        }
        if (obj.months !== undefined) {
            this.setMonth(this.getMonth() - obj.months);
        }
        if (obj.years !== undefined) {
            this.setFullYear(this.getFullYear() - obj.years);
        }
        return this;
    });

    polyfill('removeMilliseconds', function (milliseconds) {
        throw new Error('Not implemented');
    });

    polyfill('removeSeconds', function (seconds) {
        return this.remove({ seconds: seconds });
    });

    polyfill('removeMinutes', function (minutes) {
        return this.remove({ minutes: minutes });
    });

    polyfill('removeHours', function (hours) {
        return this.remove({ hours: hours });
    });

    polyfill('removeDays', function (days) {
        return this.remove({ days: days });
    });

    polyfill('removeWeeks', function (weeks) {
        return this.remove({ days: (weeks * 7) });
    });

    polyfill('removeMonths', function (months) {
        return this.remove({ months: months });
    });

    polyfill('removeYears', function (years) {
        return this.remove({ years: years });
    });
    
    //addWeekdays is based on the Mon-Fri work week schedule
    polyfill('addWeekdays', function (weekdays) {
        var day = this.getDay();
        if (day === 0) { day = 7; }
        var daysOffset = weekdays;
        var weekspan = Math.floor(( weekdays + day - 1 ) / 5.0);
        if (weekdays > 0){
            daysOffset += weekspan * 2;
            if ( day > 5 ) { daysOffset -= day - 5; }
        } else {
            daysOffset += Math.min( weekspan * 2, 0);
            if ( day > 6 ) { daysOffset -= 1; }
        }
        return this.addDays( daysOffset );
    });

    polyfill('setTimeToNow', function () {
        var n = new Date();
        this.setMilliseconds(n.getMilliseconds());
        this.setSeconds(n.getSeconds());
        this.setMinutes(n.getMinutes());
        this.setHours(n.getHours());
    });

    polyfill('clone', function () {
        return new Date(this.valueOf());
    });

    polyfill('between', function (start, end) {
        return (this.valueOf() >= start.valueOf() &&
                this.valueOf() <= end.valueOf());
    });

    polyfill('compareTo', function (date) {
        return Date.compare(this, date);
    });

    polyfill('equals', function (date) {
        return Date.equals(this, date);
    });

    polyfill('equalsDay', function (date) {
        return Date.equalsDay(this, date);
    });

    polyfill('isToday', function () {
        return Date.equalsDay(this, Date.today());
    });

    polyfill('isAfter', function (date) {
        date = date ? date : new Date();
        return (this.compareTo(date) > 0);
    });

    polyfill('isBefore', function (date) {
        date = date ? date : new Date();
        return (this.compareTo(date) < 0);
    });

    //isWeekend is based on the Sat, Sun weekend definition.
    polyfill('isWeekend', function (date) {
        return (this.getDay() % 6 === 0);
    });

    polyfill('getDaysBetween', function (date) {
        return ((date.clone().valueOf() - this.valueOf()) / 86400000) | 0;
    });

    polyfill('getHoursBetween', function (date) {
        return ((date.clone().valueOf() - this.valueOf()) / 3600000) | 0;
    });

    polyfill('getMinutesBetween', function (date) {
        return ((date.clone().valueOf() - this.valueOf()) / 60000) | 0;
    });

    polyfill('getSecondsBetween', function (date) {
        return ((date.clone().valueOf() - this.valueOf()) / 1000) | 0;
    });

    polyfill('getMillisecondsBetween', function (date) {
        return ((date.clone().valueOf() - this.valueOf())) | 0;
    });

    polyfill('getMonthsBetween', function (date) {
		// make a guess at the answer; using 31 means that we'll be close but won't exceed
		var daysDiff, daysInMonth,
			months = Math.ceil( new Date(date - this).getUTCDate() / 31 ) ,
			testDate = new Date( this.getTime() ),
			totalDays = Date.getDaysInMonth;

		// find the maximum number of months that's less than or equal to the end date
		testDate.setUTCMonth( testDate.getUTCMonth() + months );
		while ( testDate.getTime() < date.getTime() ) {
            testDate.setUTCMonth( testDate.getUTCMonth() + 1 );
			months++;
		}

		if ( testDate.getTime() !== date.getTime() ) {
			// back off 1 month since we exceeded the end date
			testDate.setUTCMonth( testDate.getUTCMonth() - 1 );
			months--;
		}

		if ( date.getUTCMonth() === testDate.getUTCMonth() ) {
			daysDiff = new Date( date - testDate ).getUTCDate();
			daysInMonth = totalDays( testDate.getUTCFullYear(), testDate.getUTCMonth() );

			return months + ( daysDiff / daysInMonth );
		} else {
			// if two dates are on different months,
			// the calculation must be done for each separate month
			// because their number of days can be different
			daysInMonth = totalDays( testDate.getUTCFullYear(), testDate.getUTCMonth() );
			daysDiff  = daysInMonth - testDate.getUTCDate() + 1;

			return months +
					(+( daysDiff / daysInMonth ).toFixed( 5 )) +
					(+( date.getUTCDate() / totalDays( date.getUTCFullYear(), date.getUTCMonth() ) ).toFixed( 5 ));
		}
	});

    polyfill('getOrdinalNumber', function () {
        return Math.ceil((this.clone().clearTime() - new Date(this.getFullYear(), 0, 1)) / 86400000) + 1;
    });

    polyfill('toFormat', function (format) {
        return toFormat(format, getReplaceMap(this));
    });

    polyfill('toUTCFormat', function (format) {
        return toFormat(format, getUTCReplaceMap(this));
    });

    polyfill('getWeekNumber', function() {
        var onejan = new Date(this.getFullYear(),0,1);
        return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()+1)/7);
    });

    polyfill('getFullWeekNumber', function() {
        var weekNumber = '' + this.getWeekNumber();
        if (weekNumber.length === 1) {
            weekNumber = "0" + weekNumber;
        }

        return weekNumber;
    });

    var toFormat = function(format, replaceMap) {
        var f = [ format ], i, l, s;
        var replace = function (str, rep) {
            var i = 0, l = f.length, j, ll, t, n = [];
            for (; i < l; i++) {
                if (typeof f[i] == 'string') {
                    t = f[i].split(str);
                    for (j = 0, ll = t.length - 1; j < ll; j++) {
                        n.push(t[j]);
                        n.push([rep]); // replacement pushed as non-string
                    }
                    n.push(t[ll]);
                } else {
                    // must be a replacement, don't process, just push
                    n.push(f[i]);
                }
            }
            f = n;
        };

        for (i in replaceMap) {
            replace(i, replaceMap[i]);
        }

        s = '';
        for (i = 0, l = f.length; i < l; i++)
          s += typeof f[i] == 'string' ? f[i] : f[i][0];
        return f.join('');
    };

    var getReplaceMap = function(date) {
        var hours = (date.getHours() % 12) ? date.getHours() % 12 : 12;
        return {
            'YYYY': date.getFullYear(),
            'YY': String(date.getFullYear()).slice(-2),
            'MMMM': monthsFull[date.getMonth()],
            'MMM': monthsAbbr[date.getMonth()],
            'MM': pad(date.getMonth() + 1, 2),
            'MI': pad(date.getMinutes(), 2),
            'M': date.getMonth() + 1,
            'DDDD': daysFull[date.getDay()],
            'DDD': daysAbbr[date.getDay()],
            'DD': pad(date.getDate(), 2),
            'D': date.getDate(),
            'HH24': pad(date.getHours(), 2),
            'HH': pad(hours, 2),
            'H': hours,
            'SS': pad(date.getSeconds(), 2),
            'PP': (date.getHours() >= 12) ? 'PM' : 'AM',
            'P': (date.getHours() >= 12) ? 'pm' : 'am',
            'LL': pad(date.getMilliseconds(), 3)
        };
    };

    var getUTCReplaceMap = function(date) {
        var hours = (date.getUTCHours() % 12) ? date.getUTCHours() % 12 : 12;
        return {
            'YYYY': date.getUTCFullYear(),
            'YY': String(date.getUTCFullYear()).slice(-2),
            'MMMM': monthsFull[date.getUTCMonth()],
            'MMM': monthsAbbr[date.getUTCMonth()],
            'MM': pad(date.getUTCMonth() + 1, 2),
            'MI': pad(date.getUTCMinutes(), 2),
            'M': date.getUTCMonth() + 1,
            'DDDD': daysFull[date.getUTCDay()],
            'DDD': daysAbbr[date.getUTCDay()],
            'DD': pad(date.getUTCDate(), 2),
            'D': date.getUTCDate(),
            'HH24': pad(date.getUTCHours(), 2),
            'HH': pad(hours, 2),
            'H': hours,
            'SS': pad(date.getUTCSeconds(), 2),
            'PP': (date.getUTCHours() >= 12) ? 'PM' : 'AM',
            'P': (date.getUTCHours() >= 12) ? 'pm' : 'am',
            'LL': pad(date.getUTCMilliseconds(), 3)
        };
    };
}());

},{}],31:[function(require,module,exports){
var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;
var undefined;

var isPlainObject = function isPlainObject(obj) {
	'use strict';
	if (!obj || toString.call(obj) !== '[object Object]') {
		return false;
	}

	var has_own_constructor = hasOwn.call(obj, 'constructor');
	var has_is_property_of_method = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !has_own_constructor && !has_is_property_of_method) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {}

	return key === undefined || hasOwn.call(obj, key);
};

module.exports = function extend() {
	'use strict';
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target === copy) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
					if (copyIsArray) {
						copyIsArray = false;
						clone = src && Array.isArray(src) ? src : [];
					} else {
						clone = src && isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[name] = extend(deep, clone, copy);

				// Don't bring in undefined values
				} else if (copy !== undefined) {
					target[name] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}],32:[function(require,module,exports){
// Generated by CoffeeScript 1.8.0
(function() {
  var Google, promiseError;

  if (typeof window === 'undefined') {
    throw new Error('Google-maps package can be used only in browser.');
  }

  promiseError = function() {
    throw new Error('Using promises is not supported anymore. Please take a look in new documentation and use callback instead.');
  };

  Google = (function() {
    function Google() {}

    Google.URL = 'https://maps.googleapis.com/maps/api/js';

    Google.KEY = null;

    Google.LIBRARIES = [];

    Google.CLIENT = null;

    Google.SENSOR = false;

    Google._VERSION = "3.14";

    Google.VERSION = Google._VERSION;

    Google.WINDOW_CALLBACK_NAME = '__google_maps_api_provider_initializator__';

    Google.script = null;

    Google.google = null;

    Google.loading = false;

    Google.callbacks = [];

    Google.onLoadEvents = [];

    Google.load = function(fn) {
      if (fn == null) {
        fn = null;
      }
      if (this.google === null) {
        if (this.loading === true) {
          if (fn !== null) {
            this.callbacks.push(fn);
          }
        } else {
          this.loading = true;
          window[this.WINDOW_CALLBACK_NAME] = (function(_this) {
            return function() {
              return _this._ready(fn);
            };
          })(this);
          this.script = document.createElement('script');
          this.script.type = 'text/javascript';
          this.script.src = this.createUrl();
          document.body.appendChild(this.script);
        }
      } else if (fn !== null) {
        fn(this.google);
      }
      return {
        then: function() {
          return promiseError();
        },
        "catch": function() {
          return promiseError();
        },
        fail: function() {
          return promiseError();
        }
      };
    };

    Google.createUrl = function() {
      var url;
      url = this.URL;
      if (this.SENSOR === true || this.SENSOR === "true") {
        url += "?sensor=true";
      } else {
        url += "?sensor=false";
      }
      if (this.KEY != null) {
        url += "&key=" + this.KEY;
      }
      if (this.LIBRARIES.length > 0) {
        url += "&libraries=" + (this.LIBRARIES.join(','));
      }
      if (this.CLIENT != null) {
        url += "&client=" + this.CLIENT + "&v=" + this.VERSION;
      }
      url += "&callback=" + this.WINDOW_CALLBACK_NAME;
      return url;
    };

    Google.release = function(fn) {
      var _release;
      _release = (function(_this) {
        return function() {
          _this.KEY = null;
          _this.LIBRARIES = [];
          _this.CLIENT = null;
          _this.SENSOR = false;
          _this.VERSION = _this._VERSION;
          _this.google = null;
          _this.loading = false;
          _this.callbacks = [];
          _this.onLoadEvents = [];
          if (typeof window.google !== 'undefined') {
            delete window.google;
          }
          if (typeof window[_this.WINDOW_CALLBACK_NAME] !== 'undefined') {
            delete window[_this.WINDOW_CALLBACK_NAME];
          }
          if (_this.script !== null) {
            _this.script.parentElement.removeChild(_this.script);
            _this.script = null;
          }
          return fn();
        };
      })(this);
      if (this.loading) {
        return this.load(function() {
          return _release();
        });
      } else {
        return _release();
      }
    };

    Google.onLoad = function(fn) {
      return this.onLoadEvents.push(fn);
    };

    Google._ready = function(fn) {
      var event, _i, _j, _len, _len1, _ref, _ref1;
      if (fn == null) {
        fn = null;
      }
      Google.loading = false;
      if (Google.google === null) {
        Google.google = window.google;
      }
      _ref = Google.onLoadEvents;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        event = _ref[_i];
        event(Google.google);
      }
      if (fn !== null) {
        fn(Google.google);
      }
      _ref1 = Google.callbacks;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        fn = _ref1[_j];
        fn(Google.google);
      }
      return Google.callbacks = [];
    };

    return Google;

  })();

  if (typeof module === 'object') {
    module.exports = Google;
  } else {
    window.GoogleMapsLoader = Google;
  }

}).call(this);

},{}],33:[function(require,module,exports){
/**
 * lodash 3.1.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var createWrapper = require('lodash._createwrapper'),
    replaceHolders = require('lodash._replaceholders'),
    restParam = require('lodash.restparam');

/** Used to compose bitmasks for wrapper metadata. */
var PARTIAL_FLAG = 32;

/**
 * Creates a `_.partial` or `_.partialRight` function.
 *
 * @private
 * @param {boolean} flag The partial bit flag.
 * @returns {Function} Returns the new partial function.
 */
function createPartial(flag) {
  var partialFunc = restParam(function(func, partials) {
    var holders = replaceHolders(partials, partialFunc.placeholder);
    return createWrapper(func, flag, undefined, partials, holders);
  });
  return partialFunc;
}

/**
 * Creates a function that invokes `func` with `partial` arguments prepended
 * to those provided to the new function. This method is like `_.bind` except
 * it does **not** alter the `this` binding.
 *
 * The `_.partial.placeholder` value, which defaults to `_` in monolithic
 * builds, may be used as a placeholder for partially applied arguments.
 *
 * **Note:** This method does not set the "length" property of partially
 * applied functions.
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {Function} func The function to partially apply arguments to.
 * @param {...*} [partials] The arguments to be partially applied.
 * @returns {Function} Returns the new partially applied function.
 * @example
 *
 * var greet = function(greeting, name) {
 *   return greeting + ' ' + name;
 * };
 *
 * var sayHelloTo = _.partial(greet, 'hello');
 * sayHelloTo('fred');
 * // => 'hello fred'
 *
 * // using placeholders
 * var greetFred = _.partial(greet, _, 'fred');
 * greetFred('hi');
 * // => 'hi fred'
 */
var partial = createPartial(PARTIAL_FLAG);

// Assign default placeholders.
partial.placeholder = {};

module.exports = partial;

},{"lodash._createwrapper":34,"lodash._replaceholders":37,"lodash.restparam":38}],34:[function(require,module,exports){
(function (global){
/**
 * lodash 3.0.7 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var arrayCopy = require('lodash._arraycopy'),
    baseCreate = require('lodash._basecreate'),
    replaceHolders = require('lodash._replaceholders');

/** Used to compose bitmasks for wrapper metadata. */
var BIND_FLAG = 1,
    BIND_KEY_FLAG = 2,
    CURRY_BOUND_FLAG = 4,
    CURRY_FLAG = 8,
    CURRY_RIGHT_FLAG = 16,
    PARTIAL_FLAG = 32,
    PARTIAL_RIGHT_FLAG = 64,
    ARY_FLAG = 128;

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used to detect unsigned integer values. */
var reIsUint = /^\d+$/;

/* Native method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Creates an array that is the composition of partially applied arguments,
 * placeholders, and provided arguments into a single array of arguments.
 *
 * @private
 * @param {Array|Object} args The provided arguments.
 * @param {Array} partials The arguments to prepend to those provided.
 * @param {Array} holders The `partials` placeholder indexes.
 * @returns {Array} Returns the new array of composed arguments.
 */
function composeArgs(args, partials, holders) {
  var holdersLength = holders.length,
      argsIndex = -1,
      argsLength = nativeMax(args.length - holdersLength, 0),
      leftIndex = -1,
      leftLength = partials.length,
      result = Array(leftLength + argsLength);

  while (++leftIndex < leftLength) {
    result[leftIndex] = partials[leftIndex];
  }
  while (++argsIndex < holdersLength) {
    result[holders[argsIndex]] = args[argsIndex];
  }
  while (argsLength--) {
    result[leftIndex++] = args[argsIndex++];
  }
  return result;
}

/**
 * This function is like `composeArgs` except that the arguments composition
 * is tailored for `_.partialRight`.
 *
 * @private
 * @param {Array|Object} args The provided arguments.
 * @param {Array} partials The arguments to append to those provided.
 * @param {Array} holders The `partials` placeholder indexes.
 * @returns {Array} Returns the new array of composed arguments.
 */
function composeArgsRight(args, partials, holders) {
  var holdersIndex = -1,
      holdersLength = holders.length,
      argsIndex = -1,
      argsLength = nativeMax(args.length - holdersLength, 0),
      rightIndex = -1,
      rightLength = partials.length,
      result = Array(argsLength + rightLength);

  while (++argsIndex < argsLength) {
    result[argsIndex] = args[argsIndex];
  }
  var offset = argsIndex;
  while (++rightIndex < rightLength) {
    result[offset + rightIndex] = partials[rightIndex];
  }
  while (++holdersIndex < holdersLength) {
    result[offset + holders[holdersIndex]] = args[argsIndex++];
  }
  return result;
}

/**
 * Creates a function that wraps `func` and invokes it with the `this`
 * binding of `thisArg`.
 *
 * @private
 * @param {Function} func The function to bind.
 * @param {*} [thisArg] The `this` binding of `func`.
 * @returns {Function} Returns the new bound function.
 */
function createBindWrapper(func, thisArg) {
  var Ctor = createCtorWrapper(func);

  function wrapper() {
    var fn = (this && this !== global && this instanceof wrapper) ? Ctor : func;
    return fn.apply(thisArg, arguments);
  }
  return wrapper;
}

/**
 * Creates a function that produces an instance of `Ctor` regardless of
 * whether it was invoked as part of a `new` expression or by `call` or `apply`.
 *
 * @private
 * @param {Function} Ctor The constructor to wrap.
 * @returns {Function} Returns the new wrapped function.
 */
function createCtorWrapper(Ctor) {
  return function() {
    // Use a `switch` statement to work with class constructors.
    // See http://ecma-international.org/ecma-262/6.0/#sec-ecmascript-function-objects-call-thisargument-argumentslist
    // for more details.
    var args = arguments;
    switch (args.length) {
      case 0: return new Ctor;
      case 1: return new Ctor(args[0]);
      case 2: return new Ctor(args[0], args[1]);
      case 3: return new Ctor(args[0], args[1], args[2]);
      case 4: return new Ctor(args[0], args[1], args[2], args[3]);
      case 5: return new Ctor(args[0], args[1], args[2], args[3], args[4]);
      case 6: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
      case 7: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
    }
    var thisBinding = baseCreate(Ctor.prototype),
        result = Ctor.apply(thisBinding, args);

    // Mimic the constructor's `return` behavior.
    // See https://es5.github.io/#x13.2.2 for more details.
    return isObject(result) ? result : thisBinding;
  };
}

/**
 * Creates a function that wraps `func` and invokes it with optional `this`
 * binding of, partial application, and currying.
 *
 * @private
 * @param {Function|string} func The function or method name to reference.
 * @param {number} bitmask The bitmask of flags. See `createWrapper` for more details.
 * @param {*} [thisArg] The `this` binding of `func`.
 * @param {Array} [partials] The arguments to prepend to those provided to the new function.
 * @param {Array} [holders] The `partials` placeholder indexes.
 * @param {Array} [partialsRight] The arguments to append to those provided to the new function.
 * @param {Array} [holdersRight] The `partialsRight` placeholder indexes.
 * @param {Array} [argPos] The argument positions of the new function.
 * @param {number} [ary] The arity cap of `func`.
 * @param {number} [arity] The arity of `func`.
 * @returns {Function} Returns the new wrapped function.
 */
function createHybridWrapper(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
  var isAry = bitmask & ARY_FLAG,
      isBind = bitmask & BIND_FLAG,
      isBindKey = bitmask & BIND_KEY_FLAG,
      isCurry = bitmask & CURRY_FLAG,
      isCurryBound = bitmask & CURRY_BOUND_FLAG,
      isCurryRight = bitmask & CURRY_RIGHT_FLAG,
      Ctor = isBindKey ? undefined : createCtorWrapper(func);

  function wrapper() {
    // Avoid `arguments` object use disqualifying optimizations by
    // converting it to an array before providing it to other functions.
    var length = arguments.length,
        index = length,
        args = Array(length);

    while (index--) {
      args[index] = arguments[index];
    }
    if (partials) {
      args = composeArgs(args, partials, holders);
    }
    if (partialsRight) {
      args = composeArgsRight(args, partialsRight, holdersRight);
    }
    if (isCurry || isCurryRight) {
      var placeholder = wrapper.placeholder,
          argsHolders = replaceHolders(args, placeholder);

      length -= argsHolders.length;
      if (length < arity) {
        var newArgPos = argPos ? arrayCopy(argPos) : undefined,
            newArity = nativeMax(arity - length, 0),
            newsHolders = isCurry ? argsHolders : undefined,
            newHoldersRight = isCurry ? undefined : argsHolders,
            newPartials = isCurry ? args : undefined,
            newPartialsRight = isCurry ? undefined : args;

        bitmask |= (isCurry ? PARTIAL_FLAG : PARTIAL_RIGHT_FLAG);
        bitmask &= ~(isCurry ? PARTIAL_RIGHT_FLAG : PARTIAL_FLAG);

        if (!isCurryBound) {
          bitmask &= ~(BIND_FLAG | BIND_KEY_FLAG);
        }
        var result = createHybridWrapper(func, bitmask, thisArg, newPartials, newsHolders, newPartialsRight, newHoldersRight, newArgPos, ary, newArity);

        result.placeholder = placeholder;
        return result;
      }
    }
    var thisBinding = isBind ? thisArg : this,
        fn = isBindKey ? thisBinding[func] : func;

    if (argPos) {
      args = reorder(args, argPos);
    }
    if (isAry && ary < args.length) {
      args.length = ary;
    }
    if (this && this !== global && this instanceof wrapper) {
      fn = Ctor || createCtorWrapper(func);
    }
    return fn.apply(thisBinding, args);
  }
  return wrapper;
}

/**
 * Creates a function that wraps `func` and invokes it with the optional `this`
 * binding of `thisArg` and the `partials` prepended to those provided to
 * the wrapper.
 *
 * @private
 * @param {Function} func The function to partially apply arguments to.
 * @param {number} bitmask The bitmask of flags. See `createWrapper` for more details.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} partials The arguments to prepend to those provided to the new function.
 * @returns {Function} Returns the new bound function.
 */
function createPartialWrapper(func, bitmask, thisArg, partials) {
  var isBind = bitmask & BIND_FLAG,
      Ctor = createCtorWrapper(func);

  function wrapper() {
    // Avoid `arguments` object use disqualifying optimizations by
    // converting it to an array before providing it `func`.
    var argsIndex = -1,
        argsLength = arguments.length,
        leftIndex = -1,
        leftLength = partials.length,
        args = Array(leftLength + argsLength);

    while (++leftIndex < leftLength) {
      args[leftIndex] = partials[leftIndex];
    }
    while (argsLength--) {
      args[leftIndex++] = arguments[++argsIndex];
    }
    var fn = (this && this !== global && this instanceof wrapper) ? Ctor : func;
    return fn.apply(isBind ? thisArg : this, args);
  }
  return wrapper;
}

/**
 * Creates a function that either curries or invokes `func` with optional
 * `this` binding and partially applied arguments.
 *
 * @private
 * @param {Function|string} func The function or method name to reference.
 * @param {number} bitmask The bitmask of flags.
 *  The bitmask may be composed of the following flags:
 *     1 - `_.bind`
 *     2 - `_.bindKey`
 *     4 - `_.curry` or `_.curryRight` of a bound function
 *     8 - `_.curry`
 *    16 - `_.curryRight`
 *    32 - `_.partial`
 *    64 - `_.partialRight`
 *   128 - `_.rearg`
 *   256 - `_.ary`
 * @param {*} [thisArg] The `this` binding of `func`.
 * @param {Array} [partials] The arguments to be partially applied.
 * @param {Array} [holders] The `partials` placeholder indexes.
 * @param {Array} [argPos] The argument positions of the new function.
 * @param {number} [ary] The arity cap of `func`.
 * @param {number} [arity] The arity of `func`.
 * @returns {Function} Returns the new wrapped function.
 */
function createWrapper(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {
  var isBindKey = bitmask & BIND_KEY_FLAG;
  if (!isBindKey && typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var length = partials ? partials.length : 0;
  if (!length) {
    bitmask &= ~(PARTIAL_FLAG | PARTIAL_RIGHT_FLAG);
    partials = holders = undefined;
  }
  length -= (holders ? holders.length : 0);
  if (bitmask & PARTIAL_RIGHT_FLAG) {
    var partialsRight = partials,
        holdersRight = holders;

    partials = holders = undefined;
  }
  var newData = [func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity];

  newData[9] = arity == null
    ? (isBindKey ? 0 : func.length)
    : (nativeMax(arity - length, 0) || 0);

  if (bitmask == BIND_FLAG) {
    var result = createBindWrapper(newData[0], newData[2]);
  } else if ((bitmask == PARTIAL_FLAG || bitmask == (BIND_FLAG | PARTIAL_FLAG)) && !newData[4].length) {
    result = createPartialWrapper.apply(undefined, newData);
  } else {
    result = createHybridWrapper.apply(undefined, newData);
  }
  return result;
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return value > -1 && value % 1 == 0 && value < length;
}

/**
 * Reorder `array` according to the specified indexes where the element at
 * the first index is assigned as the first element, the element at
 * the second index is assigned as the second element, and so on.
 *
 * @private
 * @param {Array} array The array to reorder.
 * @param {Array} indexes The arranged array indexes.
 * @returns {Array} Returns `array`.
 */
function reorder(array, indexes) {
  var arrLength = array.length,
      length = nativeMin(indexes.length, arrLength),
      oldArray = arrayCopy(array);

  while (length--) {
    var index = indexes[length];
    array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined;
  }
  return array;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = createWrapper;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"lodash._arraycopy":35,"lodash._basecreate":36,"lodash._replaceholders":37}],35:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function arrayCopy(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

module.exports = arrayCopy;

},{}],36:[function(require,module,exports){
/**
 * lodash 3.0.3 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} prototype The object to inherit from.
 * @returns {Object} Returns the new object.
 */
var baseCreate = (function() {
  function object() {}
  return function(prototype) {
    if (isObject(prototype)) {
      object.prototype = prototype;
      var result = new object;
      object.prototype = undefined;
    }
    return result || {};
  };
}());

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = baseCreate;

},{}],37:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** Used as the internal argument placeholder. */
var PLACEHOLDER = '__lodash_placeholder__';

/**
 * Replaces all `placeholder` elements in `array` with an internal placeholder
 * and returns an array of their indexes.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {*} placeholder The placeholder to replace.
 * @returns {Array} Returns the new array of placeholder indexes.
 */
function replaceHolders(array, placeholder) {
  var index = -1,
      length = array.length,
      resIndex = -1,
      result = [];

  while (++index < length) {
    if (array[index] === placeholder) {
      array[index] = PLACEHOLDER;
      result[++resIndex] = index;
    }
  }
  return result;
}

module.exports = replaceHolders;

},{}],38:[function(require,module,exports){
arguments[4][21][0].apply(exports,arguments)
},{"dup":21}],39:[function(require,module,exports){
(function(window) {
    var re = {
        not_string: /[^s]/,
        number: /[dief]/,
        text: /^[^\x25]+/,
        modulo: /^\x25{2}/,
        placeholder: /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fiosuxX])/,
        key: /^([a-z_][a-z_\d]*)/i,
        key_access: /^\.([a-z_][a-z_\d]*)/i,
        index_access: /^\[(\d+)\]/,
        sign: /^[\+\-]/
    }

    function sprintf() {
        var key = arguments[0], cache = sprintf.cache
        if (!(cache[key] && cache.hasOwnProperty(key))) {
            cache[key] = sprintf.parse(key)
        }
        return sprintf.format.call(null, cache[key], arguments)
    }

    sprintf.format = function(parse_tree, argv) {
        var cursor = 1, tree_length = parse_tree.length, node_type = "", arg, output = [], i, k, match, pad, pad_character, pad_length, is_positive = true, sign = ""
        for (i = 0; i < tree_length; i++) {
            node_type = get_type(parse_tree[i])
            if (node_type === "string") {
                output[output.length] = parse_tree[i]
            }
            else if (node_type === "array") {
                match = parse_tree[i] // convenience purposes only
                if (match[2]) { // keyword argument
                    arg = argv[cursor]
                    for (k = 0; k < match[2].length; k++) {
                        if (!arg.hasOwnProperty(match[2][k])) {
                            throw new Error(sprintf("[sprintf] property '%s' does not exist", match[2][k]))
                        }
                        arg = arg[match[2][k]]
                    }
                }
                else if (match[1]) { // positional argument (explicit)
                    arg = argv[match[1]]
                }
                else { // positional argument (implicit)
                    arg = argv[cursor++]
                }

                if (get_type(arg) == "function") {
                    arg = arg()
                }

                if (re.not_string.test(match[8]) && (get_type(arg) != "number" && isNaN(arg))) {
                    throw new TypeError(sprintf("[sprintf] expecting number but found %s", get_type(arg)))
                }

                if (re.number.test(match[8])) {
                    is_positive = arg >= 0
                }

                switch (match[8]) {
                    case "b":
                        arg = arg.toString(2)
                    break
                    case "c":
                        arg = String.fromCharCode(arg)
                    break
                    case "d":
                    case "i":
                        arg = parseInt(arg, 10)
                    break
                    case "e":
                        arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential()
                    break
                    case "f":
                        arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg)
                    break
                    case "o":
                        arg = arg.toString(8)
                    break
                    case "s":
                        arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg)
                    break
                    case "u":
                        arg = arg >>> 0
                    break
                    case "x":
                        arg = arg.toString(16)
                    break
                    case "X":
                        arg = arg.toString(16).toUpperCase()
                    break
                }
                if (re.number.test(match[8]) && (!is_positive || match[3])) {
                    sign = is_positive ? "+" : "-"
                    arg = arg.toString().replace(re.sign, "")
                }
                else {
                    sign = ""
                }
                pad_character = match[4] ? match[4] === "0" ? "0" : match[4].charAt(1) : " "
                pad_length = match[6] - (sign + arg).length
                pad = match[6] ? (pad_length > 0 ? str_repeat(pad_character, pad_length) : "") : ""
                output[output.length] = match[5] ? sign + arg + pad : (pad_character === "0" ? sign + pad + arg : pad + sign + arg)
            }
        }
        return output.join("")
    }

    sprintf.cache = {}

    sprintf.parse = function(fmt) {
        var _fmt = fmt, match = [], parse_tree = [], arg_names = 0
        while (_fmt) {
            if ((match = re.text.exec(_fmt)) !== null) {
                parse_tree[parse_tree.length] = match[0]
            }
            else if ((match = re.modulo.exec(_fmt)) !== null) {
                parse_tree[parse_tree.length] = "%"
            }
            else if ((match = re.placeholder.exec(_fmt)) !== null) {
                if (match[2]) {
                    arg_names |= 1
                    var field_list = [], replacement_field = match[2], field_match = []
                    if ((field_match = re.key.exec(replacement_field)) !== null) {
                        field_list[field_list.length] = field_match[1]
                        while ((replacement_field = replacement_field.substring(field_match[0].length)) !== "") {
                            if ((field_match = re.key_access.exec(replacement_field)) !== null) {
                                field_list[field_list.length] = field_match[1]
                            }
                            else if ((field_match = re.index_access.exec(replacement_field)) !== null) {
                                field_list[field_list.length] = field_match[1]
                            }
                            else {
                                throw new SyntaxError("[sprintf] failed to parse named argument key")
                            }
                        }
                    }
                    else {
                        throw new SyntaxError("[sprintf] failed to parse named argument key")
                    }
                    match[2] = field_list
                }
                else {
                    arg_names |= 2
                }
                if (arg_names === 3) {
                    throw new Error("[sprintf] mixing positional and named placeholders is not (yet) supported")
                }
                parse_tree[parse_tree.length] = match
            }
            else {
                throw new SyntaxError("[sprintf] unexpected placeholder")
            }
            _fmt = _fmt.substring(match[0].length)
        }
        return parse_tree
    }

    var vsprintf = function(fmt, argv, _argv) {
        _argv = (argv || []).slice(0)
        _argv.splice(0, 0, fmt)
        return sprintf.apply(null, _argv)
    }

    /**
     * helpers
     */
    function get_type(variable) {
        return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase()
    }

    function str_repeat(input, multiplier) {
        return Array(multiplier + 1).join(input)
    }

    /**
     * export to either browser or node.js
     */
    if (typeof exports !== "undefined") {
        exports.sprintf = sprintf
        exports.vsprintf = vsprintf
    }
    else {
        window.sprintf = sprintf
        window.vsprintf = vsprintf

        if (typeof define === "function" && define.amd) {
            define(function() {
                return {
                    sprintf: sprintf,
                    vsprintf: vsprintf
                }
            })
        }
    }
})(typeof window === "undefined" ? this : window);

},{}],40:[function(require,module,exports){
'use strict';


var canonicalize = function(phoneNumber) {
  if(! phoneNumber) {
    return null;
  }

  var canonicalPhone;
  var phoneString = '' + phoneNumber;
  var match = /^\+?[0-9()\-\s.]+$/.exec(phoneString);

  if(match === null) {
    console.error('Found invalid characters in phone number: ' + phoneString);

    return null;
  }

  canonicalPhone = phoneString.replace(/[()\-\s.]+/g, '');

  if(canonicalPhone[0] === '+') {
    return canonicalPhone;
  }

  if(canonicalPhone.length === 10) {
    return '+1' + canonicalPhone;
  }

  if(canonicalPhone.length === 11 && canonicalPhone[0] === '1') {
    return '+' + canonicalPhone;
  }

  return canonicalPhone;
};

module.exports = canonicalize;

},{}],41:[function(require,module,exports){
'use strict';

var cards = [];

var counter = {
  getCards: function() {
    return cards;
  },

  register: function(card) {
    cards.push(card);
    this.positionCards();
  },

  unregister: function(card) {
    var cardIndex = cards.indexOf(card);
    cards.splice(cardIndex, 1);
    this.positionCards();
  },

  /* This function is responsible for vertically positioning
   * stacked cards. The first card in the cards array will
   * be positioned at the top, and the second below it and
   * so on.
   */
  positionCards: function() {
    var cardEl;
    var cardHeight;
    var spacing = 15;
    var verticalSpacing = 0;

    for(var i = 0; i < cards.length; i++) {
      cardEl = cards[i].getCardEl();
      cardHeight = cards[i].getCardHeight();
      cardHeight += spacing;

      cardEl.style.top = (verticalSpacing + spacing) + 'px';
      verticalSpacing += cardHeight;
    }
  }
};

module.exports = counter;

},{}],42:[function(require,module,exports){
'use strict';

/*
  An identity function, returns the text provided (not a translation).
  The purpose of this function is to:
    - mark strings for extraction when updating translation catalogs
    - find/replace when translating during build
    - local dev, where we skip translation in favor of a swift build
*/

module.exports = function(text) {
  return text;
};


},{}],43:[function(require,module,exports){
'use strict';

var weekHTML = require('./templates/hours-table.hbs');
var gettext = require('./gettext');
var sprintf = require('sprintf-js').sprintf;
require('date-utils');

var hoursRenderer = {
  formatTime: function(time) {
    var formattedTime = '';
    var isPm;
    var timeSplat = time.split(':');
    var hourDigit = Number(timeSplat[0]);

    if(hourDigit > 12) {
      hourDigit -= 12;
      isPm = true;
    } else if (hourDigit === 12) {
      isPm = true;
    }

    formattedTime = hourDigit + ':' + timeSplat[1];

    formattedTime += isPm ? ' pm' : ' am';

    return formattedTime;
  },

  today: function(hours) {
    var date = new Date();
    var day = date.toFormat('DDD').toLowerCase();
    var todaysHours = hours[day];

    var openTime = this.formatTime(todaysHours.open);
    var closeTime = this.formatTime(todaysHours.close);

    return {
      open: openTime,
      close: closeTime
    };
  },

  openToday: function(hours) {
    var todaysHours = this.today(hours);

    return sprintf(gettext('Open today from %s to %s'), todaysHours.open, todaysHours.close);
  },

  isOpenNow: function() {
    return true;
  },

  week: function(hours) {
    var wrapper = document.createElement('div');
    var todaysHours = this.today(hours);
    var isOpenNow = this.isOpenNow(hours);
    var days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    var dayRow, openEl, closeEl, openTimeEl, closeTimeEl, openNowEl;
    var openCloseClass;

    wrapper.innerHTML = weekHTML;

    for(var i = 0; i < days.length; i++) {
      dayRow = wrapper.querySelector('.' + days[i]);
      openEl = dayRow.querySelector('td:nth-child(2)');
      closeEl = dayRow.querySelector('td:nth-child(3)');

      openEl.innerHTML = this.formatTime(hours[days[i]].open);
      closeEl.innerHTML = this.formatTime(hours[days[i]].close);
    }

    openTimeEl = wrapper.querySelector('.today .open');
    closeTimeEl = wrapper.querySelector('.today .close');
    openNowEl = wrapper.querySelector('.now');
    openCloseClass = isOpenNow ? 'open' : 'closed';

    openTimeEl.innerHTML = todaysHours.open;
    closeTimeEl.innerHTML = todaysHours.close;
    openNowEl.innerHTML = isOpenNow ? gettext('Open now') : gettext('Currently closed');
    openNowEl.classList.add(openCloseClass);
    return wrapper;
  }
};

module.exports = hoursRenderer;

},{"./gettext":42,"./templates/hours-table.hbs":51,"date-utils":30,"sprintf-js":39}],44:[function(require,module,exports){
'use strict';

var Router = require('./router');
var siteData = require('./site-data');

require('date-utils');
require('classlist-polyfill');


module.exports = {
  data: siteData,
  initialize: Router.initInstance
};

},{"./router":47,"./site-data":48,"classlist-polyfill":29,"date-utils":30}],45:[function(require,module,exports){
'use strict';

/* Hideable is a mixin for objects that can be shown  and hidden
 * from view.
 */

var hideable = {
  hide: function(cb, timeout) {
    var displayNone = function() {
      this[this.contentName].classList.add('hide');
      this[this.contentName].classList.remove('open');
      if(typeof cb === 'function') {
        cb();
      }
    };

    if(timeout === undefined) {
      timeout = 400;
    }

    if(this.noscroll) {
      this.removeNoScroll();
    }

    this[this.contentName].classList.remove(this.transIn || '');
    this[this.contentName].classList.add(this.transOut || '');
    setTimeout(displayNone.bind(this), timeout);
  },

  show: function() {
    if(this.noscroll) {
      this.addNoScroll();
    }

    this[this.contentName].classList.add('open');
    this[this.contentName].classList.remove('hide');
    this[this.contentName].classList.add(this.transIn || '');
    this[this.contentName].classList.remove(this.transOut || '');
  },

  addNoScroll: function() {
    document.body.classList.add('noscroll');
  },

  removeNoScroll: function() {
    document.body.classList.remove('noscroll');
  }
};

module.exports = hideable;

},{}],46:[function(require,module,exports){
'use strict';


var renderable = {
  render: function(cb) {
    if(! this.isRendered) {
      this[this.wrapperName].appendChild(this[this.contentName]);
    }

    if(typeof this.onRender === 'function') {
      this.onRender(cb);
    }

    this.isRendered = true;
  },

  remove: function() {
    if(this.isRendered) {
      this[this.wrapperName].removeChild(this[this.contentName]);
    }

    if(typeof this.onRemove === 'function') {
      this.onRemove();
    }

    this.isRendered = false;
  }
};

module.exports = renderable;

},{}],47:[function(require,module,exports){
'use strict';

var AmpersandRouter = require('ampersand-router');
var PageView = require('./views/page');

var SiteLocationRouter = AmpersandRouter.extend({
  routes: {
    'toolbar': 'toolbar',
    'exit': 'exit',
    'toolbar/map': 'map',
    'toolbar/hours': 'hours'
  },

  initialize: function() {
    this.pageView = new PageView();
  },

  toolbar: function() {
    this.pageView.renderToolbar();
  },

  exit: function() {
    this.pageView.removeAll();

    this.navigate('', {replace: true});
  },

  map: function() {
    this.pageView.renderMap();
  },

  hours: function() {
    this.pageView.renderHours();
  }
});

SiteLocationRouter.initInstance = function() {
  if(! PageView.shouldRender()) {
    console.info('No data for sitelocation to render.');
    return;
  }

  SiteLocationRouter.instance = new SiteLocationRouter();

  if(! SiteLocationRouter.instance.history.started) {
    SiteLocationRouter.instance.history.start();
  }

  return SiteLocationRouter.instance;
};

module.exports = SiteLocationRouter;

},{"./views/page":63,"ampersand-router":6}],48:[function(require,module,exports){
'use strict';


var siteData = {
  data: {},

  set: function(key, value) {
    this.data[key] = value;
  },

  get: function(key) {
    return this.data[key];
  }
};

module.exports = siteData;

},{}],49:[function(require,module,exports){
module.exports = "<div class=\"title\">Address:</div>\n<address>\n  <div class=\"line-one\"></div>\n  <div class=\"line-two\"></div>\n</address>\n";
},{}],50:[function(require,module,exports){
module.exports = "<div class=\"title\">Today's Hours:</div>\n<div class=\"hours\"></div>\n";
},{}],51:[function(require,module,exports){
module.exports = "<h2>Hours</h2>\n\n<h3>Today</h3>\n\n<div class=\"today\">\n    <span class=\"now\"></span> <time class=\"open\"></time> - <time class=\"close\"></time>\n</div>\n\n<h3>This Week</h3>\n\n<table>\n  <thead>\n    <tr>\n      <th>Day</th>\n      <th>Open</th>\n      <th>Close</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr class=\"sun\">\n      <td>Sunday</td>\n      <td></td>\n      <td></td>\n    </tr>\n    <tr class=\"mon\">\n      <td>Monday</td>\n      <td></td>\n      <td></td>\n    </tr>\n    <tr class=\"tue\">\n      <td>Tuesday</td>\n      <td></td>\n      <td></td>\n    </tr>\n    <tr class=\"wed\">\n      <td>Wednesday</td>\n      <td></td>\n      <td></td>\n    </tr>\n    <tr class=\"thu\">\n      <td>Thursday</td>\n      <td></td>\n      <td></td>\n    </tr>\n    <tr class=\"fri\">\n      <td>Friday</td>\n      <td></td>\n      <td></td>\n    </tr>\n    <tr class=\"sat\">\n      <td>Saturday</td>\n      <td></td>\n      <td></td>\n    </tr>\n  </tbody>\n</table>\n";
},{}],52:[function(require,module,exports){
module.exports = "<input class=\"animated\" placeholder=\"Current Location\">\n<div class=\"transport-toggle\">\n  <button class=\"walk-icon\" data-mode=\"WALKING\">\n    <svg id=\"walk-icon\" x=\"0px\" y=\"0px\" width=\"25px\" height=\"25px\" viewBox=\"0 0 100 100\" enable-background=\"new 0 0 100 100\" xml:space=\"preserve\">\n      <path d=\"M48.947,11.08c0-3.972-3.111-7.08-7.081-7.08c-3.974,0-7.082,3.108-7.082,7.08  c0,3.971,3.108,7.082,7.082,7.082C45.835,18.162,48.947,15.051,48.947,11.08z\"/>\n      <path d=\"M71.465,30.522c0,0-8.447-4.743-12.188-6.708c-3.744-1.97-11.175-7.06-17.801-1.17  C38.467,25.319,35,39,35,39l-14,8.634l2.299,3.204l15.251-5.544l4.262-5.516l4.513,9.945l-9.109,15.962l-7.188,26.828l7.438,2.508  l8.357-25.072l6.185-6.102l13.539,32.01l6.52-3.01L62.119,53.902c0,0,1.365-2.799,1.365-7.254c0-5.11-4.039-13.473-4.039-13.473  l6.611,1.518l1.48,16.639l4.162,0.391L71.465,30.522z\"/>\n    </svg>\n  </button>\n  <button class=\"drive-icon selected\" data-mode=\"DRIVING\">\n    <svg id=\"drive-icon\" x=\"0px\" y=\"0px\" width=\"25px\" height=\"20px\" viewBox=\"0 0 100 83.648\" enable-background=\"new 0 0 100 83.648\" xml:space=\"preserve\">\n      <path d=\"M15.727,43.753\"/>\n      <path d=\"M90.925,28.696L82.728,7.529C81.195,3.477,77.845,0.029,71.505,0h-11.56H40.188H28.427\n        c-6.311,0.029-9.661,3.477-11.222,7.529L9.006,28.696C5.751,29.116-0.01,32.941,0,40.187v26.951h7.999v8.603\n        c-0.02,10.606,14.989,10.48,14.985,0v-8.603H50h26.948v8.603c0.033,10.48,15.042,10.606,15.052,0v-8.603h8V40.187\n        C99.975,32.941,94.21,29.116,90.925,28.696z M15.727,50.874c-3.834,0.011-6.938-3.187-6.922-7.12\n        c-0.016-3.96,3.088-7.161,6.922-7.128c3.822-0.033,6.926,3.168,6.921,7.128C22.653,47.687,19.548,50.884,15.727,50.874z M50,28.497\n        h-0.067H17.541l6.182-16.668c0.746-2.366,1.904-4.059,4.639-4.1h21.571H50H71.64c2.693,0.041,3.854,1.733,4.636,4.1l6.183,16.668H50\n        z M84.274,50.874c-3.861,0.011-6.967-3.187-6.988-7.12c0.021-3.96,3.127-7.161,6.988-7.128c3.795-0.033,6.898,3.168,6.922,7.128\n        C91.172,47.687,88.069,50.884,84.274,50.874z\"/>\n      <path d=\"M84.274,43.753\"/>\n    </svg>\n  </button>\n</div>\n";
},{}],53:[function(require,module,exports){
module.exports = "<div>\n  <a id=\"location-tools-phone\" class=\"phone hide\" href=\"\">\n    <svg version=\"1.1\" id=\"Layer_1\" x=\"0px\" y=\"0px\"\n      viewBox=\"25 25 50 50\" enable-background=\"new 25 25 50 50\" xml:space=\"preserve\">\n      <path fill=\"#FFFFFF\" d=\"M54.2,60.6\"/>\n      <circle fill=\"#1E1E1E\" cx=\"50\" cy=\"50\" r=\"25\"/>\n      <path fill=\"#2196F3\" d=\"M62.5,60.5c-4,4-12.6,2.2-19.2-4.4c-6.4-6.4-8.4-15-4.4-19.2c3-3,6.6,4.2,4.8,6c-4,4-1.8,7.2,2.2,11.2\n        s6.8,4.8,10.6,1C58.3,53.3,65.3,57.7,62.5,60.5z\"/>\n    </svg>\n  </a>\n  <a id=\"location-tools-location\" class=\"map hide\" href=\"#toolbar/map\">\n    <svg version=\"1.1\" id=\"Layer_1\" x=\"0px\" y=\"0px\"\n      viewBox=\"25 25 50 50\" enable-background=\"new 25 25 50 50\" xml:space=\"preserve\">\n      <circle fill=\"#1E1E1E\" cx=\"50\" cy=\"50\" r=\"25\"/>\n      <path fill=\"#22A6FF\" d=\"M50.1,59c2,0.1,3.6,1.7,3.6,3.7c0,2.1-1.7,3.7-3.7,3.7s-3.7-1.7-3.7-3.7c0-2,1.6-3.7,3.6-3.7\n        c-0.8-1.7-6.6-14.1-7.7-18.2c0-4.4,3.4-7.8,7.8-7.8c4.2,0,7.8,3.4,7.8,7.8C56.7,45.3,50.9,57.4,50.1,59\"/>\n      <circle fill=\"#1E1E1E\" cx=\"50\" cy=\"62.8\" r=\"2.8\"/>\n      <circle fill=\"#1E1E1E\" cx=\"50\" cy=\"40.2\" r=\"4.1\"/>\n    </svg>\n  </a>\n  <a id=\"location-tools-hours\" class=\"hours hide\" href=\"#toolbar/hours\">\n    <svg version=\"1.1\" id=\"Layer_1\" x=\"0px\" y=\"0px\"\n      viewBox=\"24 24 52 52\" enable-background=\"new 24 24 52 52\" xml:space=\"preserve\">\n      <circle fill=\"#1E1E1E\" cx=\"50\" cy=\"50\" r=\"25\"/>\n      <path fill=\"#2196F3\" d=\"M52.7,32.7c0-1.3-1.1-2.4-2.4-2.4s-2.4,1.1-2.4,2.4v18.1l-8.8,7c-1.1,0.8-1.2,2.4-0.4,3.4l0,0\n        c0.8,1.1,2.4,1.2,3.4,0.4l9.7-7.7c0.6-0.5,0.9-1.2,0.9-1.9v-0.1V32.7z\"/>\n    </svg>\n  </a>\n</div>\n";
},{}],54:[function(require,module,exports){
module.exports = "<div class=\"title\">Phone:</div>\n<div class=\"phone\"></div>\n";
},{}],55:[function(require,module,exports){
module.exports = "<svg width=\"20\" height=\"20\">\n    <line x1=\"10\" y1=\"0\" x2=\"10\" y2=\"20\" stroke-width=\"2\"></line>\n    <line x1=\"0\" y1=\"10\" x2=\"20\" y2=\"10\" stroke-width=\"2\"></line>\n</svg>\n";
},{}],56:[function(require,module,exports){
'use strict';

var renderable = require('../mixins/renderable');
var windowManager = require('../window-manager');
var actionButtonHTML = require('../templates/plus.hbs');


function ActionButton(options) {
  this.options = options || {};
  this.actionButton = document.createElement('button');
  this.actionButton.setAttribute('class', 'action-button');
  this.actionButton.innerHTML = actionButtonHTML;
  this.wrapperEl = this.options.wrapperEl || document.body;
  this.wrapperName = 'wrapperEl';
  this.contentName = 'actionButton';

  this.actionButton.addEventListener('click', this.toggle.bind(this));
}

ActionButton.prototype = Object.create(renderable);

ActionButton.prototype.toggle = function(event) {
  var window = windowManager.get();

  if(this.actionButton.classList.contains('open')) {
    window.location.hash = 'exit';
    this.close();
  } else {
    window.location.hash = 'toolbar';
    this.open();
  }
};

ActionButton.prototype.destroy = function() {
  this.actionButton.parentNode.removeChild(this.actionButton);
};

ActionButton.prototype.open = function(event) {
  this.actionButton.classList.add('open');

  if(typeof this.openCallback === 'function') {
    this.openCallback(event);
  }
};

ActionButton.prototype.close = function(event) {
  this.actionButton.classList.remove('open');

  if(typeof this.closeCallback === 'function') {
    this.closeCallback(event);
  }
};

ActionButton.prototype.onOpen = function(func) {
  this.openCallback = func;
};

ActionButton.prototype.onClose = function(func) {
  this.closeCallback = func;
};

module.exports = ActionButton;

},{"../mixins/renderable":46,"../templates/plus.hbs":55,"../window-manager":65}],57:[function(require,module,exports){
'use strict';

var hideable = require('../mixins/hideable');
var renderable = require('../mixins/renderable');
var extend = require('extend');

function Backdrop(options) {
  this.options = options || {};
  this.backdropEl = document.createElement('div');
  this.backdropEl.setAttribute('class', 'backdrop animated hide');
  this.transIn = 'fadein';
  this.transOut = 'fadeout';
  this.contentName = 'backdropEl';
  this.wrapperName = 'wrapper';
  this.wrapper = this.options.wrapperEl || document.body;
}

extend(Backdrop.prototype, hideable, renderable);

Backdrop.prototype.onClick = function(route) {
  return this.backdropEl.addEventListener('click', function() {
    window.location.hash = route;
  });
};

Backdrop.prototype.destroy = function() {
  return this.backdropEl.parentNode.removeChild(this.backdropEl);
};

module.exports = Backdrop;

},{"../mixins/hideable":45,"../mixins/renderable":46,"extend":31}],58:[function(require,module,exports){
'use strict';


var siteData = require('../site-data');
var canonicalizePhone = require('../canonicalize-phone');
var Card = require('./card');
var hoursRenderer = require('../hours-renderer');
var addressHTML = require('../templates/address.hbs');
var hoursHTML = require('../templates/hours-card.hbs');
var phoneHTML = require('../templates/phone-card.hbs');


function CardListing(options) {
  var location = siteData.get('location');
  var hoursData = siteData.get('hours');
  var addrSecondLine;
  var phoneNumber = siteData.get('phone');

  this.cards = [];
  this.options = options || {};

  if(location) {
    addrSecondLine = location.city + ' ' + location.state + ', ';
    addrSecondLine += location.zipcode;

    this.addressCard = new Card({
      html: addressHTML,
      zLayer: 120
    });

    this.addressCard.inject('.line-one', location.address);
    this.addressCard.inject('.line-two', addrSecondLine);
    this.cards.push(this.addressCard);
  }

  if(hoursData) {
    this.hoursCard = new Card({
      html: hoursHTML,
      zLayer: 120
    });

    this.hoursCard.inject('.hours', hoursRenderer.openToday(hoursData));
    this.cards.push(this.hoursCard);
  }

  if(canonicalizePhone(phoneNumber) !== null) {
    this.phoneCard = new Card({
      html: phoneHTML,
      zLayer: 120
    });

    this.phoneCard.inject('.phone', phoneNumber);
    this.cards.push(this.phoneCard);
  }
}

CardListing.prototype.renderCards = function() {
  for(var i = 0; i < this.cards.length; i++) {
    this.cards[i].render();
    this.cards[i].show();
  }
};

CardListing.prototype.removeCards = function() {
  for(var i = 0; i < this.cards.length; i++) {
    this.cards[i].hideAndRemove();
  }
};

module.exports = CardListing;

},{"../canonicalize-phone":40,"../hours-renderer":43,"../site-data":48,"../templates/address.hbs":49,"../templates/hours-card.hbs":50,"../templates/phone-card.hbs":54,"./card":59}],59:[function(require,module,exports){
'use strict';

var cardCounter = require('../card-counter');
var renderable = require('../mixins/renderable');
var hideable = require('../mixins/hideable');
var extend = require('extend');

function Card(options) {
  this.options = options || {};
  this.html = options.html;

  this.contentName = 'cardEl';
  this.cardEl = document.createElement('div');
  this.cardEl.classList.add('info-card');
  this.cardEl.classList.add('animated');
  this.cardEl.classList.add('zoomIn');
  this.cardEl.innerHTML = options.html;
  this.cardEl.style['z-index'] = options.zLayer || 0;

  this.closeEl = document.createElement('button');
  this.closeEl.classList.add('close');
  this.closeEl.classList.add('fa');
  this.closeEl.classList.add('fa-times');

  this.closeEl.addEventListener('click', this.hideAndRemove.bind(this));
  this.cardEl.appendChild(this.closeEl);

  this.wrapperName = 'wrapper';
  this.wrapper = this.options.wrapperEl || document.body;

  this.transIn = 'zoomIn';
  this.transOut = 'zoomOut';
}

extend(Card.prototype, hideable, renderable);

Card.prototype.hideAndRemove = function() {
  this.hide(this.remove.bind(this));
};

Card.prototype.inject = function(selector, content) {
  this.cardEl.querySelector(selector).innerHTML = content;
};

Card.prototype.getCardEl = function() {
  return this.cardEl;
};

Card.prototype.getCardHeight = function() {
  var cardHeight = this.cardEl.offsetHeight;
  cardHeight += parseInt(this.cardEl.style['margin-top']) || 0;
  cardHeight += parseInt(this.cardEl.style['margin-bottom']) || 0;

  return cardHeight;
};

Card.prototype.onRender = function() {
  cardCounter.register(this);
};

Card.prototype.onRemove = function() {
  cardCounter.unregister(this);
};

module.exports = Card;

},{"../card-counter":41,"../mixins/hideable":45,"../mixins/renderable":46,"extend":31}],60:[function(require,module,exports){
'use strict';

var hoursRenderer = require('../hours-renderer');
var hideable = require('../mixins/hideable');
var renderable = require('../mixins/renderable');
var extend = require('extend');


function HoursView(options) {
  this.options = options || {};
  this.hours = options.hours;
  this.hoursEl = hoursRenderer.week(this.hours);
  this.contentEl = document.createElement('div');
  this.contentEl.classList.add('hours-view');
  this.contentEl.classList.add('animated');
  this.contentEl.classList.add('hide');
  this.contentEl.appendChild(this.hoursEl);
  this.contentName = 'contentEl';
  this.wrapper = this.options.wrapperEl || document.body;

  /* Properties to be consumed by hideable mixin */
  this.transIn = 'fadein';
  this.transOut = 'fadeout';
  this.contentName = 'contentEl';
  this.wrapperName = 'wrapper';

  this.setHeight(options.height || 500);
}

extend(HoursView.prototype, hideable, renderable);

HoursView.prototype.setHeight = function(newHeight) {
  this.contentEl.style.height = newHeight + 'px';
};

module.exports = HoursView;

},{"../hours-renderer":43,"../mixins/hideable":45,"../mixins/renderable":46,"extend":31}],61:[function(require,module,exports){
'use strict';

var toolbarTemplate = require('../templates/map-toolbar.hbs');
var renderable = require('../mixins/renderable');
var hideable = require('../mixins/hideable');
var extend = require('extend');

function MapToolbarView(options) {
  options = options || {};
  this.options = options;
  this.wrapperName = options.wrapperName;
  this.wrapper = options.wrapper;
  this.contentName = 'contentEl';
  this.contentEl = document.createElement('section');
  this.contentEl.innerHTML = toolbarTemplate;
  this.contentEl.classList.add('animated');
  this.contentEl.classList.add('map-toolbar');
  this.searchInput = this.contentEl.querySelector('input');
  this.toggleDrive = this.contentEl.querySelector('.drive-icon');
  this.toggleWalk = this.contentEl.querySelector('.walk-icon');
  this.transIn = 'fadein';
  this.transOut = 'fadeout';
  this.selectedMode = 'DRIVING';
}

extend(MapToolbarView.prototype, renderable, hideable);


/* This function handles the UI of the walk/drive selection.
 * It removes the style from the currently selected button and
 * adds it to the button passed in from the event handler.
 */
MapToolbarView.prototype.select = function(button) {
  var selectedEl = this.contentEl.querySelector('.selected');
  selectedEl.classList.remove('selected');
  button.classList.add('selected');
  this.selectedMode = button.getAttribute('data-mode');
};

module.exports = MapToolbarView;

},{"../mixins/hideable":45,"../mixins/renderable":46,"../templates/map-toolbar.hbs":52,"extend":31}],62:[function(require,module,exports){
/* global google, navigator */

'use strict';

var GoogleMapsLoader = require('google-maps');
var debounce = require('debounce');
var renderable = require('../mixins/renderable');
var extend = require('extend');
var partial = require('lodash.partial');
var MapToolbarView = require('./map-toolbar');


/* This function is the Map cunstructor.
 * Options include:
 *
 * - height: the height of the map view
 * - address, city, state, zipcode
 * - loadedCallback: called once the Map has been fully rendered
 */
function MapView(options) {
  options = options || {};
  this.options = options;
  this.height = options.height || '100%';
  this.loadedCallback = options.loadedCallback || function() {};

  this.address = options.address + ' ' + options.city + ', ' + options.state;
  this.address += ' ' + options.zipcode;

  this.contentName = 'contentEl';
  this.contentEl = document.createElement('div');

  this.wrapperName = 'wrapper';
  this.wrapper = this.options.wrapperEl || document.body;

  this.mapToolbar = new MapToolbarView({
    wrapper: this.contentEl,
    wrapperName: this.wrapperName
  });
  this.mapToolbar.render();

  this.mapWrapper = document.createElement('div');
  this.mapWrapper.style.width = '100%';
  this.mapWrapper.style.position = 'absolute';
  this.mapWrapper.style['z-index'] = '199';
  this.mapWrapper.classList.add('google-map');
  this.mapWrapper.classList.add('animated');

  this.contentEl.appendChild(this.mapWrapper);
}

extend(MapView.prototype, renderable);

/* Checks if google maps global is present, if it is
 * this function manually calls the google maps loaded
 * callback. If not it uses the Google Maps Loader
 * to load the Google Maps v3 Javascript API.
 */
MapView.prototype.loadGoogleMaps = function(cb) {
  var googleMapsLoaded = this.googleMapsLoaded.bind(this);
  var loadedCallback = function(google) {
    googleMapsLoaded(google, cb);
  };

  if(! window.google){
    return GoogleMapsLoader.load(loadedCallback);
  }

  return loadedCallback(window.google);
};

/* This is a callback function that is called when
 * the Google Maps v3 Javascript API has been loaded.
 * It also initializes all Google Maps objects, and
 * stores them as attributes of this object.
 */
MapView.prototype.googleMapsLoaded = function(google, cb) {

  var debounceCurrentLocation = debounce(
    this.getCurrectLocation.bind(this), 1000);
  var addressObject = {
    address: this.address
  };
  var getLatLng = partial(this.getLatLng.bind(this), cb);

  var toggleTransportMode = function(mode) {
    var initializeDirections = this.initializeDirections.bind(this);
    initializeDirections(mode);
  }.bind(this);

  var setTransportMode = function(event) {
    var button = event.currentTarget;

    if (!button.classList.contains('selected')) {
      var mode = button.getAttribute('data-mode');

      this.mapToolbar.select(button);
      toggleTransportMode(mode);
    }
  }.bind(this);

  this.geocoder = new google.maps.Geocoder();
  this.geocoder.geocode(addressObject, getLatLng);
  this.directionsService = new google.maps.DirectionsService();
  this.directionsDisplay = new google.maps.DirectionsRenderer();

  this.mapToolbar.searchInput.addEventListener(
    'input', debounceCurrentLocation);

  this.mapToolbar.toggleDrive.addEventListener(
    'click', setTransportMode, false);

  this.mapToolbar.toggleWalk.addEventListener(
    'click', setTransportMode, false);

  this.google = google;
};

/* Given a Google Maps Latitude and Logintude this function
 * stores the destination location locally. It then calls
 * functions to get the users current location and
 * inject the map into the dom.
 */
MapView.prototype.getLatLng = function(cb, location) {
  if(location.length <= 0) {
    return;
  }

  this.center = location[0].geometry.location;
  this.getCurrectLocation();
  this.injectMap(cb);
};

/* This function gets the users current location
 * using one of two methods.
 *
 * 1. If the user has entered a value via the seach
 *    box at the top of the view, it will search
 *    for this location using the Google Maps
 *    Geolocation API.
 *
 * 2. If the user has not entered a value in the
 *    search box at the top of the view and the
 *    user has a geolocation enabled device, then
 *    the function will use that as the current
 *    location.
 *
 * If 1 and 2 are not availabe, the map will
 * simply display a marker where the entity
 * is located.
 */
MapView.prototype.getCurrectLocation = function() {
  var setCurrectLocation = function(position) {
    this.currentLocation =  new this.google.maps.LatLng(
      position.coords.latitude, position.coords.longitude);

    this.initializeDirections();
  };

  var setCustomLocation = function(location) {
    if(location.length <= 0) {
      return;
    }

    this.currentLocation = location[0].geometry.location;
    this.initializeDirections();
  };

  if(this.mapToolbar.searchInput.value) {
    // Google Maps Geolcation API
    var address = {
      address: this.mapToolbar.searchInput.value
    };

    this.geocoder.geocode(address, setCustomLocation.bind(this));
  }
  else if(navigator.geolocation) {
    // HTML5 Geolocation API
    navigator.geolocation.getCurrentPosition(setCurrectLocation.bind(this));
  }
};

/* This function wraps the calls the Google Maps API v3
 * to initialize directions on the Google Map.
 */
MapView.prototype.initializeDirections = function(mode) {
  mode = mode || this.mapToolbar.selectedMode;
  var request = {
      origin: this.currentLocation,
      destination: this.center,
      travelMode: google.maps.TravelMode[mode]
  };


  if(this.currentLocation) {
    this.directionsService.route(request, this.renderDirections.bind(this));
  }
};

/* This function injects the map into the dom
 * using Google Maps API v3.
 */
MapView.prototype.injectMap = function(cb) {
  this.map = new this.google.maps.Map(this.mapWrapper, {
    center: this.center,
    zoom: 12
  });

  this.marker = new this.google.maps.Marker({
    position: this.center,
    map: this.map
  });

  this.directionsDisplay.setMap(this.map);
  this.setHeight(this.height);

  /* Call loaded callback to allow asynchronous code to be executed once
   * google is loaded.
   */
  this.loadedCallback(undefined);

  if(typeof cb === 'function') {
    cb(this);
  }
};

/* This function wraps the Google Maps API v3
 * to render the directions on the Google Map.
 */
MapView.prototype.renderDirections = function(response, status) {
  if (status === google.maps.DirectionsStatus.OK) {
    this.directionsDisplay.setDirections(response);
  }
};

MapView.prototype.getWrapper = function() {
  return this.mapWrapper;
};

/* Show the Map
 * Also calls the resize map function to
 * ensure the map is filling the view
 * properly.
 */
MapView.prototype.show = function() {
  this.mapWrapper.classList.add('open');
  this.mapWrapper.classList.add('fadein');
  this.mapWrapper.classList.remove('fadeout');
  this.mapToolbar.show();

  /* Only resize the map if Google Maps has been loaded
   * If Google Maps has not loaded yet, then there is no
   * map to resize. Add a delay to wait for the DOM to
   * have all the elements needed to resize the map.
   */
  if(this.google) {
    setTimeout(this.resizeMap.bind(this), 10);
  }
};

/* Hide the Map */
MapView.prototype.hide = function(cb, timeout) {
  if(timeout === undefined) {
    timeout = 400;
  }

  this.mapWrapper.classList.add('fadeout');
  this.mapWrapper.classList.remove('fadein');
  this.mapToolbar.hide();

  var removeOpenClass = function() {
    this.mapWrapper.classList.remove('open');
    this.mapToolbar.contentEl.classList.remove('open');
    if(typeof cb === 'function') {
      cb();
    }
  };

  setTimeout(removeOpenClass.bind(this), timeout);
};

/* Resize the map */
MapView.prototype.resizeMap = function() {
  /* This fixes a rendering bug in Google Maps V3 where the
   * map is only rendered in the top left corner of the page
   */

  this.google.maps.event.trigger(this.map, 'resize');
  this.map.setCenter(this.center);
  this.mapWrapper.style.position = 'absolute';
};

/* Set the height of the map wrapper
 * To do this, we must subtract away the height of the
 * toolbar at the top of the Map view.
 */
MapView.prototype.setHeight = function(newHeight) {
  var searchOffset = this.mapToolbar.offsetHeight || 50;

  this.mapWrapper.style.height = newHeight - searchOffset + 'px';
  this.resizeMap.bind(this)();
};

/* Remove the map wrapper and toolbar from the dom */
MapView.prototype.destroy = function() {
  this.mapWrapper.parentNode.removeChild(this.mapWrapper);
  this.mapToolbar.parentNode.removeChild(this.mapToolbar);
};

MapView.prototype.onRender = function(cb) {
  this.loadGoogleMaps(cb);
};

module.exports = MapView;

},{"../mixins/renderable":46,"./map-toolbar":61,"debounce":2,"extend":31,"google-maps":32,"lodash.partial":33}],63:[function(require,module,exports){
'use strict';

var MapView = require('./map');
var Backdrop = require('./backdrop');
var Toolbar = require('./toolbar');
var ActionButton = require('./action-button');
var HoursView = require('./hours');
var animatedScrollTo = require('animated-scrollto');
var siteData = require('../site-data');
var CardListing = require('./card-listing');
var canonicalizePhone = require('../canonicalize-phone');


var getViewportHeight = function() {
  return Math.max(
    document.documentElement.clientHeight, window.innerHeight || 0);
};

function PageView(options) {
  this.options = options || {};
  this.actionButton = new ActionButton();
  this.toolbar = new Toolbar();
  this.backdrop = new Backdrop();
  this.mapHoursHeight = getViewportHeight() - this.toolbar.getHeight();

  this.cardListing = new CardListing();

  this.initializePhone();

  if(siteData.get('hours')) {
    this.initializeHours();
  }

  if(siteData.get('location')) {
    this.initializeMap();
  }


  this.actionButton.render();
  this.backdrop.onClick('exit');

  var resize = function(event) {
    var mapHoursHeight = getViewportHeight() - this.toolbar.getHeight();
    if(this.mapView && this.mapView.google) {
      this.mapView.setHeight(mapHoursHeight);
    }

    if(this.hoursView) {
      this.hoursView.setHeight(mapHoursHeight);
    }
  };

  window.addEventListener('resize', resize.bind(this));
}

PageView.prototype.initializeMap = function() {
  var location = siteData.get('location');

  this.mapView = new MapView({
    address: location.address,
    city: location.city,
    state: location.state,
    zipcode: location.zipcode,
    height: this.mapHoursHeight
  });

  this.toolbar.showButton('map');
};

PageView.prototype.initializeHours = function() {
  this.hoursView = new HoursView({
    hours: siteData.get('hours'),
    height: this.mapHoursHeight
  });

  this.toolbar.showButton('hours');
};

PageView.prototype.initializePhone = function() {
  var phoneNumber = siteData.get('phone');
  var canonicalPhone = canonicalizePhone(phoneNumber);

  if(canonicalPhone !== null) {
    this.toolbar.phoneNumber(canonicalPhone);
    this.toolbar.showButton('phone');
  }
};

PageView.prototype.open = function() {
  animatedScrollTo(document.body, 0, 400);
  this.backdrop.render();
  this.backdrop.show();
  this.actionButton.open();
  this.toolbar.render();
  this.toolbar.show();
  this.actionButton.open();
};

PageView.prototype.renderToolbar = function() {
  this.open();
  this.cardListing.renderCards();
};

PageView.prototype.renderHours = function() {
  if(this.hoursView) {
    this.hoursView.render();
    this.hoursView.show();
  }

  this.removeMap();
  this.open();
  this.cardListing.removeCards();
};

PageView.prototype.renderMap = function() {
  if(this.mapView) {
    this.mapView.render();
    this.mapView.show();
  }

  this.removeHours();
  this.open();
  this.cardListing.removeCards();
};

PageView.prototype.removeMap = function() {
  if(this.mapView) {
    this.mapView.hide(this.mapView.remove.bind(this.mapView));
  }
};

PageView.prototype.removeHours = function() {
  if(this.hoursView) {
    this.hoursView.hide(this.hoursView.remove.bind(this.hoursView));
  }
};

PageView.prototype.removeToolbar = function() {
  this.toolbar.hide(this.toolbar.remove.bind(this.toolbar));
};

PageView.prototype.removeBackdrop = function() {
  this.backdrop.hide(this.backdrop.remove.bind(this.backdrop));
};

PageView.prototype.removeAll = function() {
  this.removeHours();
  this.removeMap();
  this.removeBackdrop();
  this.removeToolbar();
  this.actionButton.close();

  this.cardListing.removeCards();
};

PageView.shouldRender = function() {
  var phone = siteData.get('phone');
  var hours = siteData.get('hours');
  var location = siteData.get('location');

  return phone || hours || location;
};

module.exports = PageView;

},{"../canonicalize-phone":40,"../site-data":48,"./action-button":56,"./backdrop":57,"./card-listing":58,"./hours":60,"./map":62,"./toolbar":64,"animated-scrollto":28}],64:[function(require,module,exports){
'use strict';

var hideable = require('../mixins/hideable');
var renderable = require('../mixins/renderable');
var extend = require('extend');
var toolbarHTML = require('../templates/mobile-features.hbs');

function Toolbar(options) {
  this.options = options || {};
  this.contentEl = document.createElement('section');
  this.contentName = 'contentEl';

  this.wrapperEl = this.options.wrapperEl || document.body;
  this.wrapperName = 'wrapperEl';

  this.transIn = 'fadeinup';
  this.transOut = 'fadeoutdown';

  this.contentEl.innerHTML = toolbarHTML;

  this.contentEl.classList.add('mobile-features');
  this.contentEl.classList.add('animated');
  this.contentEl.classList.add('hide');

  this.noscroll = true;
}

extend(Toolbar.prototype, hideable, renderable);

Toolbar.prototype.destroy = function() {
  this.contentEl.parentNode.removeChild(this.contentEl);
};

Toolbar.prototype.getWrapperEl = function() {
  return this.contentEl;
};

Toolbar.prototype.showButton = function(buttonName) {
  var buttonEl = this.contentEl.querySelector('.' + buttonName);

  buttonEl.classList.remove('hide');
};

Toolbar.prototype.phoneNumber = function(phoneNumber) {
  var callEl = this.contentEl.querySelector('#location-tools-phone');

  callEl.href = 'tel:' + phoneNumber;
};

Toolbar.prototype.getHeight = function() {
  return this.contentEl.offsetHeight || 70;
};

Toolbar.prototype.onDirectionsClick = function(func) {
  this.contentEl.querySelector('#location-tools-map')
    .addEventListener('click', func);
};

Toolbar.prototype.onPhoneClick = function(func) {
  this.contentEl.querySelector('#location-tools-phone')
    .addEventListener('click', func);
};

Toolbar.prototype.onHoursClick = function(func) {
  this.contentEl.querySelector('#location-tools-hours')
    .addEventListener('click', func);
};

module.exports = Toolbar;

},{"../mixins/hideable":45,"../mixins/renderable":46,"../templates/mobile-features.hbs":53,"extend":31}],65:[function(require,module,exports){
'use strict';


var windowManager = {
  set: function(_window) {
    this.window = _window;
  },

  get: function() {
    return this.window;
  },

  reset: function() {
    this.window = this.originalWindow;
  },

  init: function(_window) {
    this.window = _window;
    this.originalWindow = _window;
  }
};

windowManager.init(window);

module.exports = windowManager;

},{}],66:[function(require,module,exports){
module.exports = function(func) {
  setTimeout(func, 0);
};

},{}],67:[function(require,module,exports){
var checkEmpty = function(locationData) {
  if(! locationData || locationData.trim().length === 0 ) {
    return null;
  }
  return locationData;
};

var parseJsonLocationData = function(tagId) {
  var jsonLocationDataEl = document.getElementById(tagId);

  if(! jsonLocationDataEl) {
    return {address: {}};
  }

  return JSON.parse(jsonLocationDataEl.textContent);
};

var initializeSiteLocation = function(siteLocation, jsonldId) {
  var initializeHelper = function() {
    var jsonld = parseJsonLocationData(jsonldId);
    var locationData, address, city, state, zipcode, country;
    address = checkEmpty(jsonld.address.streetAddress);
    city = checkEmpty(jsonld.address.addressLocality);
    state = checkEmpty(jsonld.address.addressRegion);
    zipcode = checkEmpty(jsonld.address.postalCode);
    country = checkEmpty(jsonld.address.addressCountry);

    if(address || city || state || zipcode || country) {
      locationData = {
        address: address,
        city: city,
        state: state,
        zipcode: zipcode,
        country: country
      };
    }

    var cleintWidth = document.documentElement.clientWidth;
    var innerWidth = window.innerWidth || 0;
    var viewportWidth = Math.max(cleintWidth, innerWidth);

    siteLocation.data.set('location', locationData);
    siteLocation.data.set('phone', checkEmpty(jsonld.telephone));

    /* Only initialize the sitelocation view if the viewport is smaller than
     * 736 pixels.
     */
    if(viewportWidth <= 736) {
      siteLocation.initialize();
    }
  };

  return initializeHelper;
};

module.exports = initializeSiteLocation;

},{}]},{},[1]);
