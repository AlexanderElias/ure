
export default {

	PREFIX: /data-o-|o-/,
	ROOT: /^(https?:)?\/?\//,

	DOT: /\.+/,
	PIPE: /\s?\|\s?/,
	PIPES: /\s?,\s?|\s+/,
	VARIABLE_START: '(\\|*\\,*\\s*)',
	VARIABLE_END: '([^a-zA-z]|$)',

	binderNames (data) {
		data = data.split(this.PREFIX)[1];
		return data ? data.split('-') : [];
	},

	binderValues (data) {
		data = data.split(this.PIPE)[0];
		return data ? data.split('.') : [];
	},

	binderPipes (data) {
		data = data.split(this.PIPE)[1];
		return data ? data.split(this.PIPES) : [];
	},

	ensureElement (data) {
		data.query = data.query || '';
		data.scope = data.scope || document.body;

		var element = data.scope.querySelector(`${data.name}${data.query}`);

		if (!element) {
			element = document.createElement(data.name);

			if (data.position === 'afterbegin') {
				data.scope.insertBefore(element, data.scope.firstChild);
			} else if (data.position === 'beforeend') {
				data.scope.appendChild(element);
			} else {
				data.scope.appendChild(element);
			}

		}

		for (var attribute of data.attributes) {
			element.setAttribute(attribute.name, attribute.value);
		}

		return element;
	},

	formData (form, model) {
		var elements = form.querySelectorAll('[o-value]');
		var data = {};

		for (var i = 0, l = elements.length; i < l; i++) {
			var element = elements[i];

			if (element.nodeName === 'OPTION') continue;

			var value = element.getAttribute('o-value');

			if (!value) continue;

			var values = this.binderValues(value);

			data[values[values.length-1]] = this.getByPath(model, values);
		}

		return data;
	},

	formReset (form, model) {
		var elements = form.querySelectorAll('[o-value]');

		for (var i = 0, l = elements.length; i < l; i++) {
			var element = elements[i];

			if (element.nodeName === 'OPTION') continue;

			var value = element.getAttribute('o-value');

			if (!value) continue;

			var values = this.binderValues(value);

			this.setByPath(model, values, '');
		}

	},

	walker (node, callback) {
		callback(node);
		// node = node.firstElementChild;
		node = node.firstChild;
		while (node) {
		    this.walker(node, callback);
		    // node = node.nextElementSibling;
		    node = node.nextSibling;
		}
	},

	replaceEachVariable (element, variable, path, key) {
		var self = this;
		var pattern = new RegExp(this.VARIABLE_START + variable + this.VARIABLE_END, 'g');

		self.walker(element, function (node) {
			if (node.nodeType === 3) {
				if (node.nodeValue === `$${variable}` || node.nodeValue === '$index') {
					node.nodeValue = key;
				}
			} else if (node.nodeType === 1) {
				for (var i = 0, l = node.attributes.length; i < l; i++) {
					var attribute = node.attributes[i];
					if (attribute.name.indexOf('o-') === 0 || attribute.name.indexOf('data-o-') === 0) {
						attribute.value = attribute.value.replace(pattern, `$1${path}.${key}$2`);
					}
				}
			}
		});
	},

	traverse (data, path, callback) {
		var keys = typeof path === 'string' ? path.split('.') : path;
		var last = keys.length - 1;

		for (var i = 0; i < last; i++) {
			var key = keys[i];

			if (!(key in data)) {
				if (typeof callback === 'function') {
					callback(data, key, i, keys);
				} else {
					return undefined;
				}
			}

			data = data[key];
		}

		return {
			data: data,
			key: keys[last]
		}
	},

	setByPath (data, path, value) {
		var keys = typeof path === 'string' ? path.split('.') : path;
		var last = keys.length - 1;

		for (var i = 0; i < last; i++) {
			var key = keys[i];

			if (!(key in data)) {

				if (isNaN(keys[i+1])) {
					data[key] = {};
				} else {
					data[key] = [];
				}

			}

			data = data[key];
		}

		return data[keys[last]] = value;
	},

	getByPath (data, path) {
		var keys = typeof path === 'string' ? path.split('.') : path;
		var last = keys.length - 1;

		for (var i = 0; i < last; i++) {
			var key = keys[i];

			if (!(key in data)) {
				return undefined;
			} else {
				data = data[key];
			}

		}

		return data[keys[last]];
	},

	joinDot () {
		return Array.prototype.join
			.call(arguments, '.')
			.replace(/\.{2,}/g, '.');
	},

	// getScope (element) {
	//
	// 	if (!element) {
	// 		return;
	// 	}
	//
	// 	if (element.hasAttribute('o-scope') || element.hasAttribute('data-o-scope')) {
	// 		return element;
	// 	}
	//
	// 	if (element.parentNode) {
	// 		return this.getScope(element.parentNode);
	// 	}
	//
	// 	// console.warn('Oxe.utility - could not find container scope');
	// },

	ready (callback) {
		if (callback) {
			if (window.document.readyState !== 'interactive' && window.document.readyState !== 'complete') {
				window.document.addEventListener('DOMContentLoaded', function _ () {
					callback();
					window.document.removeEventListener('DOMContentLoaded', _);
				}, true);
			} else {
				callback();
			}
		}
	}

}
