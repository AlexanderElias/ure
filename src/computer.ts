// import parser from "./parser";

console.warn('should return just assignee if not $value');

const caches = new Map();
const shouldNotConvert = /^\s*{{[^{}]*}}\s*$/;
const replaceOfIn = /{{.*?\s+(of|in)\s+(.*?)}}/;
const assigneePattern = /({{.*?)([_$a-zA-Z0-9.?\[\]]+)(\s*[-+?^*%$|\\]?=[-+?^*%$|\\]?\s*[_$a-zA-Z0-9.?\[\]]+.*?}})/;

const ignores = [
    'window', 'document', 'console', 'location',
    '$assignee',
    '$instance', '$binder', '$event', '$value', '$checked', '$form', '$e', '$v', '$c', '$f',
    'globalThis', 'Infinity', 'NaN', 'undefined',
    'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent ',
    'Error', 'EvalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError', 'AggregateError',
    'Object', 'Function', 'Boolean', 'Symbole', 'Array',
    'Number', 'Math', 'Date', 'BigInt',
    'String', 'RegExp',
    'Array', 'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array',
    'Int32Array', 'Uint32Array', 'BigInt64Array', 'BigUint64Array', 'Float32Array', 'Float64Array',
    'Map', 'Set', 'WeakMap', 'WeakSet',
    'ArrayBuffer', 'SharedArrayBuffer', 'DataView', 'Atomics', 'JSON',
    'Promise', 'GeneratorFunction', 'AsyncGeneratorFunction', 'Generator', 'AsyncGenerator', 'AsyncFunction',
    'Reflect', 'Proxy',
];

const bind = async function (binder, path) {
    const binders = binder.binders.get(path);
    if (binders) {
        binders.add(binder);
    } else {
        binder.binders.set(path, new Set([ binder ]));
    }
};

const has = function (target, key) {
    if (typeof key !== 'string') return true;
    return ignores.includes(key) ? false : true;
};

const set = function (path, binder, target, key, value) {
    if (typeof key !== 'string') return true;

    if (!path && binder.rewrites?.length) {

        let rewrite = key;
        for (const [ name, value ] of binder.rewrites) {
            rewrite = rewrite.replace(new RegExp(`^(${name})\\b`), value);
        }

        for (const part of rewrite.split('.')) {
            path = path ? `${path}.${part}` : part;
            bind(binder, path);
        }
    } else {
        path = path ? `${path}.${key}` : `${key}`;
        bind(binder, path);
    }

    if (target[ key ] !== value) {
        target[ key ] = value;
    }

    return true;
};

const get = function (path, binder, target, key) {
    // if (typeof key !== 'string') return target[ key ];
    if (typeof key !== 'string') return;

    if (!path && binder.rewrites?.length) {

        let rewrite = key;
        for (const [ name, value ] of binder.rewrites) {
            rewrite = rewrite.replace(new RegExp(`^(${name})\\b`), value);
        }

        for (const part of rewrite.split('.')) {
            path = path ? `${path}.${part}` : part;
            bind(binder, path);
        }
    } else {
        path = path ? `${path}.${key}` : `${key}`;
        bind(binder, path);
    }

    const value = target[ key ];

    if (value && typeof value === 'object') {
        return new Proxy(value, {
            set: set.bind(null, path, binder),
            get: get.bind(null, path, binder),
        });
    } else if (typeof value === 'function') {
        return value.bind(target);
    } else {
        return value;
    }

};

const computer = function (binder: any) {
    let cache = caches.get(binder.value);

    if (!cache) {
        let code = binder.value;

        // const parsed = parser(code);

        code = code.replace(replaceOfIn, '{{$2}}');

        const convert = !shouldNotConvert.test(code);
        const isValue = binder.node.name === 'value';
        const isChecked = binder.node.name === 'checked';
        const assignee = isValue || isChecked ? code.match(assigneePattern)?.[ 2 ] || '' : '';

        code = code.replace(/{{/g, convert ? `' + (` : '(');
        code = code.replace(/}}/g, convert ? `) + '` : ')');
        code = convert ? `'${code}'` : code;

        code = `
        $instance = $instance || {};
        var $f = $form = $instance.form;
        var $e = $event = $instance.event;
        with ($context) {
            try {
                ${isValue || isChecked ? `
                ${isValue ? `var $v = $value = $instance && 'value' in $instance ? $instance.value : ${assignee || 'undefined'};` : ''}
                ${isChecked ? `var $c = $checked = $instance && 'checked' in $instance ? $instance.checked : ${assignee || 'undefined'};` : ''}
                if ('value' in $instance || 'checked' in $instance) {
                    return ${code};
                } else {
                    return ${assignee ? assignee : code};
                }
            ` : `return ${code};`}
           } catch (error) {
                // console.warn(error);
                if (error.message.indexOf('Cannot set property') === 0) return;
                else if (error.message.indexOf('Cannot read property') === 0) return;
                else if (error.message.indexOf('Cannot set properties') === 0) return;
                else if (error.message.indexOf('Cannot read properties') === 0) return;
                else console.error(error);
            }
        }
        `;

        cache = new Function('$context', '$binder', '$instance', code);
        caches.set(binder.value, cache);
    }

    const context = new Proxy(binder.context, {
        has: has,
        set: set.bind(null, '', binder),
        get: get.bind(null, '', binder)
    });

    return cache.bind(null, context, binder);
};

export default computer;