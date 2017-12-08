import Global from '../global';

var Transformer = {};

/*

	templates

*/

Transformer._innerHandler = function (char) {
	if (char === '\'') return '\\\'';
	if (char === '\"') return '\\"';
	if (char === '\t') return '\\t';
	if (char === '\n') return '\\n';
};

Transformer._updateString = function (value, index, string) {
	return string.slice(0, index) + value + string.slice(index+1);
};

Transformer._updateIndex = function (value, index) {
	return index + value.length-1;
};

Transformer.template = function (data) {
	// NOTE: double backtick in strings or regex could possibly causes issues

	var first = data.indexOf('`');
	var second = data.indexOf('`', first+1);

	if (first === -1 || second === -1) return data;

	var value;
	var ends = 0;
	var starts = 0;
	var string = data;
	var isInner = false;

	for (var index = 0; index < string.length; index++) {
		var char = string[index];

		if (char === '`' && string[index-1] !== '\\') {

			if (isInner) {
				ends++;
				value = '\'';
				isInner = false;
				string = this._updateString(value, index, string);
				index = this._updateIndex(value, index);
			} else {
				starts++;
				value = '\'';
				isInner = true;
				string = this._updateString(value, index, string);
				index = this._updateIndex(value, index);
			}

		} else if (isInner) {

			if (value = this._innerHandler(char, index, string)) {
				string = this._updateString(value, index, string);
				index = this._updateIndex(value, index);
			}

		}

	}

	string = string.replace(/\${(.*?)}/g, '\'+$1+\'');

	if (starts === ends) {
		return string;
	} else {
		throw new Error('Transformer miss matched backticks');
	}

};

/*

	modules

*/

Transformer.patterns = {
	imps: /import\s+\w+\s+from\s+(?:'|").*?(?:'|")/g,
	imp: /import\s+(\w+)\s+from\s+(?:'|")(.*?)(?:'|")/,
	exps: /export\s+(?:default|var|let|const)?\s+/g
};

Transformer.getImports = function (text) {
	var result = [];
	var imps = text.match(this.patterns.imps) || [];

	for (var i = 0, l = imps.length; i < l; i++) {
		var imp = imps[i].match(this.patterns.imp);

		result[i] = {
			raw: imp[0],
			name: imp[1],
			url: imp[2]
		};

	}

	return result;
};

Transformer.getExports = function (text) {
	var result = [];
	var exps = text.match(this.patterns.exps) || [];

	for (var i = 0, l = exps.length; i < l; i++) {
		var exp = exps[i];

		result[i] = {
			raw: exp,
			default: exp.indexOf('default') !== -1,
		};

	}

	return result;
};

Transformer.replaceImports = function (text, imps) {

	if (!imps.length) {
		return text;
	}

	for (var i = 0, l = imps.length; i < l; i++) {
		var imp = imps[i];

		imp.url = Global.utility.resolve(imp.url);
		imp.extension = Global.utility.extension(imp.url);

		if (!imp.extension) {
			imp.url = imp.url + '.js';
		}

		var pattern = 'var ' + imp.name + ' = $LOADER.modules[\'' + imp.url + '\'].code';

		text = text.replace(imp.raw, pattern);
	}

	return text;
};

Transformer.replaceExports = function (text, exps) {

	if (!exps.length) {
		return text;
	}

	if (exps.length === 1) {
		return text.replace(exps[0].raw, 'return ');
	}

	var i, l, pattern;

	text = 'var $EXPORT = {};\n' + text;
	text = text + '\nreturn $EXPORT;\n';

	for (i = 0, l = exps.length; i < l; i++) {
		text = text.replace(exps[i].raw, '$EXPORT.');
	}

	return text;
};

Transformer.ast = function (data) {
	var ast = {};

	ast.raw = data;
	ast.cooked = data;

	ast.imports = this.getImports(ast.raw);
	ast.exports = this.getExports(ast.raw);

	ast.cooked = this.replaceImports(ast.cooked, ast.imports);
	ast.cooked = this.replaceExports(ast.cooked, ast.exports);

	return ast;
};

export default Transformer;
