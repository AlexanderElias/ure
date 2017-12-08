import Events from './lib/events';
import Global from './global';

var Router = {};

Router = Object.assign(Router, Events.prototype);
Events.call(Router);

Router.cache = {};
Router.routes = [];
Router.hash = false;
Router.auth = false;
Router.isRan = false;
Router.location = {};
Router.view = 'o-view';
Router.trailing = false;

Router.setup = function (options) {
	options = options || {};
	this.container = options.container;
	this.auth = options.auth === undefined ? this.auth : options.auth;
	this.view = options.view === undefined ? this.view : options.view;
	this.hash = options.hash === undefined ? this.hash : options.hash;
	this.routes = options.routes === undefined ? this.routes: options.routes;
	this.external = options.external === undefined ? this.external : options.external;
	this.trailing = options.trailing === undefined ? this.trailing : options.trailing;
};

Router.scroll = function (x, y) {
	window.scroll(x, y);
};

Router.back = function () {
	window.history.back();
};

Router.redirect = function (path) {
	window.location.href = path;
};

Router.add = function (route) {

	if (route.constructor.name === 'Object') {
		this.routes.push(route);
	} else if (route.constructor.name === 'Array') {
		this.routes = this.routes.concat(route);
	}

};

Router.remove = function (path) {

	for (var i = 0, l = this.routes.length; i < l; i++) {

		if (path === this.routes[i].path) {
			this.routes.splice(i, 1);
		}

	}

};

Router.get = function (path) {

	for (var i = 0, l = this.routes.length; i < l; i++) {
		var route = this.routes[i];

		if (path === route.path) {
			return route;
		}

	}

};

Router.find = function (path) {

	for (var i = 0, l = this.routes.length; i < l; i++) {
		var route = this.routes[i];

		if (this.isPath(route.path, path)) {
			return route;
		}

	}

};

Router.isPath = function (routePath, userPath) {
	return new RegExp(
		'^' + routePath
		.replace(/{\*}/g, '(?:.*)')
		.replace(/{(\w+)}/g, '([^\/]+)')
		+ '(\/)?$'
	).test(userPath);
};

Router.toParameter = function (routePath, userPath) {
	var result = {};
	var brackets = /{|}/g;
	var pattern = /{(\w+)}/;
	var userPaths = userPath.split('/');
	var routePaths = routePath.split('/');

	for (var i = 0, l = routePaths.length; i < l; i++) {

		if (pattern.test(routePaths[i])) {
			var name = routePaths[i].replace(brackets, '');
			result[name] = userPaths[i];
		}

	}

	return result;
};

Router.toQuery = function (path) {
	var result = {};
	if (path.indexOf('?') === 0) path = path.slice(1);
	var queries = path.split('&');

	for (var i = 0, l = queries.length; i < l; i++) {
		var query = queries[i].split('=');

		if (query[0] && query[1]) {
			result[query[0]] = query[1];
		}

	}

	return result;
};

Router.toLocation = function (path) {
	var location = {};

	location.pathname = decodeURI(path);
	location.origin = window.location.origin;

	location.base = Global.utility.base();
	location.port = window.location.port;
	location.host = window.location.host;
	location.hash = window.location.hash;
	location.hostname = window.location.hostname;
	location.protocol = window.location.protocol;

	if (location.base.indexOf(location.origin) === 0) {
		location.basename = location.base.slice(location.origin.length);
	}

	if (location.pathname.indexOf(location.origin) === 0) {
		location.pathname = location.pathname.slice(location.origin.length);
	}

	if (this.hash) {
		location.pathname = location.pathname.replace(location.basename + '#/', location.basename);
	}

	var hashIndex = location.pathname.indexOf('#');
	if (hashIndex !== -1) {
		location.hash = location.pathname.slice(hashIndex);
		location.pathname = location.pathname.slice(0, hashIndex);
	} else {
		location.hash = '';
	}

	var searchIndex = location.pathname.indexOf('?');
	if (searchIndex !== -1) {
		location.search = location.pathname.slice(searchIndex);
		location.pathname = location.pathname.slice(0, searchIndex);
	} else {
		location.search = '';
	}

	if (this.trailing) {
		location.pathname = location.pathname + '/';
	} else {
		location.pathname = location.pathname.replace(/\/{1,}$/, '');
	}

	if (location.pathname.charAt(0) !== '/') {
		location._pathname = '/' + location.pathname;
		location.pathname = Global.utility.join(location.basename, location.pathname);
	} else {
		location._pathname = location.pathname;
	}

	location._href =  Global.utility.join(location.origin, this.hash ? '/#/' : '/', location.pathname);
	location._href += location.search;
	location._href += location.hash;

	location.href =  Global.utility.join(location.origin, location.pathname);
	location.href += location.search;
	location.href += location.hash;

	return location;
};

Router.batch = function (route) {
	var self = this, component;

	component = self.cache[route.component];

	if (!component) {
		component = self.cache[route.component] = document.createElement(route.component);
		component.inRouterCache = false;
		component.isRouterComponent = true;
	}

	Global.batcher.write(function () {
		var child;
		while (child = self.view.firstChild) self.view.removeChild(child);
		self.view.appendChild(component);
		self.scroll(0, 0);
		self.emit('navigated');
	});

};

Router.render = function (route) {

	if (route.title) {
		document.title = route.title;
	}

	if (route.url && !(route.component in this.cache)) {
		Global.loader.load(route.url, this.batch.bind(this, route));
	} else {
		this.batch(route);
	}

};

Router.navigate = function (data, replace) {
	var location, routePath;

	if (typeof data === 'string') {
		location = this.toLocation(data);
		location.route = this.find(location._pathname) || {};
		location.title = location.route.title || '';
		location.query = this.toQuery(location.search);
		location.parameters = this.toParameter(location.route.path, location.pathname);
	} else {
		location = data;
	}

	if (
		this.auth &&
		(location.route.auth === true ||
		location.route.auth === undefined)
	) {

		if (Global.keeper.route(location.route) === false) {
			return;
		}

	}

	this.location = location;
	window.history[replace ? 'replaceState' : 'pushState'](this.location, this.location.title, this.location._href);

	if (this.location.route.handler) {
		this.location.route.handler(this.location);
	} else if (this.location.route.redirect) {
		this.redirect(this.location.route.redirect);
	} else {
		this.render(this.location.route);
	}
};

Router.run = function () {

	if (this.isRan) {
		return;
	}

	this.isRan = true;

	if (typeof this.view === 'string') {
		this.view = document.body.querySelector(this.view);
	}

	if (!this.view) {
		throw new Error('Oxe.router - requires a view element');
	}

	this.navigate(window.location.href, true);
};

export default Router;
