
/*!
    Name: oxe
    Version: 5.2.9
    License: MPL-2.0
    Author: Alexander Elias
    Email: alex.steven.elis@gmail.com
    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Oxe = factory());
}(this, (function () { 'use strict';

    const tick$4 = Promise.resolve();
    // const run = async function (tasks: tasks) {
    //     let task;
    //     while (task = tasks.shift()) {
    //         task();
    //     }
    // };
    const deleteProperty = function (task, tasks, path, target, key) {
        const initial = !tasks.length;
        tasks.push(path ? `${path}.${key}` : key);
        delete target[key];
        if (initial)
            tick$4.then(task.bind(null, tasks));
        return true;
    };
    const set = function (task, tasks, path, target, key, value) {
        if (key === 'length') {
            const initial = !tasks.length;
            tasks.push(path);
            tasks.push(path ? `${path}.${key}` : key);
            if (initial)
                tick$4.then(task.bind(null, tasks));
            return true;
        }
        else if (target[key] === value || `${target[key]}${value}` === 'NaNNaN') {
            return true;
        }
        const initial = !tasks.length;
        tasks.push(path ? `${path}.${key}` : key);
        target[key] = observer(value, task, tasks, path ? `${path}.${key}` : key);
        if (initial)
            tick$4.then(task.bind(null, tasks));
        return true;
    };
    const observer = function (source, task, tasks = [], path = '') {
        let target;
        if (source?.constructor === Array) {
            target = [];
            for (let key = 0, length = source.length; key < length; key++) {
                target[key] = observer(source[key], task, tasks, path ? `${path}.${key}` : `${key}`);
            }
            target = new Proxy(target, {
                set: set.bind(null, task, tasks, path),
                deleteProperty: deleteProperty.bind(null, task, tasks, path)
            });
        }
        else if (source?.constructor === Object) {
            target = {};
            for (const key in source) {
                target[key] = observer(source[key], task, tasks, path ? `${path}.${key}` : key);
            }
            target = new Proxy(target, {
                set: set.bind(null, task, tasks, path),
                deleteProperty: deleteProperty.bind(null, task, tasks, path)
            });
        }
        else {
            target = source;
        }
        return target;
    };

    var booleanTypes = [
        'allowfullscreen', 'async', 'autofocus', 'autoplay', 'checked', 'compact', 'controls', 'declare', 'default',
        'defaultchecked', 'defaultmuted', 'defaultselected', 'defer', 'disabled', 'draggable', 'enabled', 'formnovalidate',
        'indeterminate', 'inert', 'ismap', 'itemscope', 'loop', 'multiple', 'muted', 'nohref', 'noresize', 'noshade', 'hidden',
        'novalidate', 'nowrap', 'open', 'pauseonexit', 'readonly', 'required', 'reversed', 'scoped', 'seamless', 'selected',
        'sortable', 'spellcheck', 'translate', 'truespeed', 'typemustmatch', 'visible'
    ];

    const format = (data) => data === undefined ? '' : typeof data === 'object' ? JSON.stringify(data) : data;

    const standard = async function (binder) {
        const { name, owner, node } = binder;
        let data = await binder.compute();
        const boolean = booleanTypes.includes(name);
        if (boolean) {
            data = data ? true : false;
            if (data)
                owner.setAttributeNode(node);
            else
                owner.removeAttribute(name);
        }
        else {
            data = format(data);
            owner[name] = data;
            owner.setAttribute(name, data);
        }
    };

    const handler = async function (binder, checked, event) {
        const { owner, node } = binder;
        const { value } = owner;
        const computed = await binder.compute({ event, checked, value });
        owner.checked = computed;
        if (owner.checked) {
            owner.setAttributeNode(node);
        }
        else {
            owner.removeAttribute('checked');
        }
    };
    const checked = async function (binder) {
        const { owner, meta } = binder;
        if (!meta.setup) {
            meta.setup = true;
            owner.removeAttribute('checked');
            owner.addEventListener('input', async (event) => {
                const checked = owner.checked;
                await handler(binder, checked, event);
            });
            if (owner.type === 'radio') {
                const parent = owner.form || owner.getRootNode();
                const radios = parent.querySelectorAll(`[type="radio"][name="${owner.name}"]`);
                owner.addEventListener('input', async () => {
                    for (const radio of radios) {
                        const radioBinders = binder.binder.get(radio.getAttributeNode('checked'));
                        if (radioBinders) {
                            for (const radioBinder of radioBinders) {
                                // radioBinder.busy = true;
                                await radioBinder.compute({ checked: radio.checked, value: radio.value });
                                // radioBinder.busy = false;
                            }
                        }
                        else {
                            if (radio.checked) {
                                radio.setAttribute('checked', '');
                            }
                            else {
                                radio.removeAttribute('checked');
                            }
                        }
                    }
                });
            }
        }
        const checked = binder.assignee();
        await handler(binder, checked);
    };

    var dateTypes = ['date', 'datetime-local', 'month', 'time', 'week'];

    console.warn('need to handle default select-one value');
    const stampFromView = function (data) {
        const date = new Date(data);
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()).getTime();
    };
    const stampToView = function (data) {
        const date = new Date(data);
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())).getTime();
    };
    // const valueFromView = function (element) {
    //     if (!element) return undefined;
    //     else if ('$value' in element) {
    //         if (typeof element.$value === 'string') {
    //             return element.value;
    //         } else {
    //             JSON.parse(element.value);
    //         }
    //     }
    //     else if (element.type === 'number' || element.type === 'range') {
    //         return element.valueAsNumber;
    //     } else {
    //         return element.value;
    //     }
    // };
    const input = async function (binder, event) {
        const { owner } = binder;
        const { type } = owner;
        let display, computed;
        if (type === 'select-one') {
            const [option] = owner.selectedOptions;
            const value = option ? '$value' in option ? option.$value : option.value : undefined;
            computed = await binder.compute({ event, value });
            display = format(computed);
        }
        else if (type === 'select-multiple') {
            const value = [];
            for (const option of owner.selectedOptions) {
                value.push('$value' in option ? option.$value : option.value);
            }
            computed = await binder.compute({ event, value });
            display = format(computed);
        }
        else if (type === 'number' || type === 'range') {
            computed = await binder.compute({ event, value: owner.valueAsNumber });
            if (typeof computed === 'number' && computed !== Infinity)
                owner.valueAsNumber = computed;
            else
                owner.value = computed;
            display = owner.value;
        }
        else if (dateTypes.includes(type)) {
            const value = typeof owner.$value === 'string' ? owner.value : stampFromView(owner.valueAsNumber);
            computed = await binder.compute({ event, value });
            if (typeof owner.$value === 'string')
                owner.value = computed;
            else
                owner.valueAsNumber = stampToView(computed);
            display = owner.value;
        }
        else {
            const { checked } = owner;
            const value = owner.$value !== null && owner.$value !== undefined && typeof owner.$value !== 'string' ? JSON.parse(owner.value) : owner.value;
            computed = await binder.compute({ event, value, checked });
            display = format(computed);
            owner.value = display;
        }
        owner.$value = computed;
        owner.setAttribute('value', display);
    };
    const value = async function value(binder) {
        const { owner, meta } = binder;
        if (!meta.setup) {
            meta.setup = true;
            meta.type = owner.type;
            meta.nodeName = owner.nodeName;
            if (owner.type === 'select-one' || owner.type === 'select-multiple') {
                owner.addEventListener('$renderSelect', () => binder.render());
            }
            owner.addEventListener('input', event => input(binder, event));
        }
        const { type, nodeName } = meta;
        let display, computed;
        if (type === 'select-one') {
            if ('each' in owner.attributes && !owner.$ready)
                return;
            // if ('each' in owner.attributes && (
            //     typeof owner.$optionsReady !== 'number' ||
            //     typeof owner.$optionsLength !== 'number' ||
            //     owner.$optionsReady !== owner.$optionsLength)) return;
            let value = binder.assignee();
            owner.value = undefined;
            for (const option of owner.options) {
                const optionValue = '$value' in option ? option.$value : option.value;
                if (option.selected = optionValue === value)
                    break;
            }
            if (owner.options.length && !owner.selectedOptions.length) {
                const [option] = owner.options;
                value = '$value' in option ? option.$value : option.value;
                option.selected = true;
            }
            computed = await binder.compute({ value });
            display = format(computed);
            owner.value = display;
        }
        else if (type === 'select-multiple') {
            const value = binder.assignee();
            for (const option of owner.options) {
                const optionValue = '$value' in option ? option.$value : option.value;
                option.selected = value?.includes(optionValue);
            }
            computed = await binder.compute({ value });
            display = format(computed);
        }
        else if (type === 'number' || type === 'range') {
            const value = binder.assignee();
            computed = await binder.compute({ value });
            if (typeof computed === 'number' && computed !== Infinity)
                owner.valueAsNumber = computed;
            else
                owner.value = computed;
            display = owner.value;
        }
        else if (dateTypes.includes(type)) {
            const value = binder.assignee();
            computed = await binder.compute({ value });
            if (typeof computed === 'string')
                owner.value = computed;
            else
                owner.valueAsNumber = stampToView(computed);
            display = owner.value;
        }
        else {
            const { checked } = owner;
            const value = binder.assignee();
            computed = await binder.compute({ value, checked });
            display = format(computed);
            owner.value = display;
        }
        owner.$value = computed;
        owner.setAttribute('value', display);
        // if (nodeName === 'OPTION') {
        //     const parent = owner.parentElement?.nodeName === 'SELECT' ? owner?.parentElement :
        //         owner.parentElement?.parentElement?.nodeName === 'SELECT' ? owner.parentElement?.parentElement : undefined;
        //     if (parent) {
        //         parent.$optionsReady++;
        //         parent.dispatchEvent(new Event('$renderSelect'));
        //     }
        // }
    };

    const tick$3 = Promise.resolve();
    const prepare = /{{\s*(.*?)\s+(of|in)\s+(.*?)\s*}}/;
    const each = async function (binder) {
        if (binder.meta.busy)
            return;
        else
            binder.meta.busy = true;
        if (!binder.meta.setup) {
            let [path, variable, index, key] = binder.value.replace(prepare, '$1,$3').split(/\s*,\s*/).reverse();
            if (binder.rewrites) {
                for (const [name, value] of binder.rewrites) {
                    path = path.replace(new RegExp(`^(${name})\\b`), value);
                }
            }
            binder.meta.path = path;
            binder.meta.keyName = key;
            binder.meta.indexName = index;
            binder.meta.variableName = variable;
            binder.meta.parts = path.split('.');
            binder.meta.tasks = [];
            binder.meta.keys = [];
            binder.meta.setup = true;
            binder.meta.targetLength = 0;
            binder.meta.currentLength = 0;
            binder.meta.templateLength = 0;
            binder.meta.queueElement = document.createElement('template');
            binder.meta.templateElement = document.createElement('template');
            // if (binder.owner.nodeName === 'SELECT') {
            //     binder.owner.$optionsReady = null;
            //     binder.owner.$optionsLength = 0;
            // }
            let node = binder.owner.firstChild;
            while (node) {
                binder.meta.templateLength++;
                binder.meta.templateElement.content.appendChild(node);
                node = binder.owner.firstChild;
            }
        }
        // const time = `each ${binder.meta.targetLength}`;
        // console.time(time);
        const tasks = [];
        const data = await binder.compute();
        if (data?.constructor === Array) {
            binder.meta.targetLength = data.length;
        }
        else {
            binder.meta.keys = Object.keys(data || {});
            binder.meta.targetLength = binder.meta.keys.length;
        }
        if (binder.meta.currentLength > binder.meta.targetLength) {
            while (binder.meta.currentLength > binder.meta.targetLength) {
                let count = binder.meta.templateLength;
                while (count--) {
                    const node = binder.owner.lastChild;
                    binder.owner.removeChild(node);
                    tick$3.then(binder.binder.remove.bind(binder.binder, node));
                }
                binder.meta.currentLength--;
            }
        }
        else if (binder.meta.currentLength < binder.meta.targetLength) {
            while (binder.meta.currentLength < binder.meta.targetLength) {
                const indexValue = binder.meta.currentLength;
                const keyValue = binder.meta.keys[indexValue] ?? indexValue;
                const variableValue = `${binder.meta.path}.${keyValue}`;
                const dynamics = new Proxy(binder.meta.dynamics || {}, {
                    has(target, key) {
                        return key === binder.meta.indexName || key === binder.meta.keyName || key === binder.meta.variableName || key in target;
                    },
                    get(target, key) {
                        if (key === binder.meta.variableName) {
                            let result = binder.container.data;
                            for (const key of binder.meta.parts) {
                                result = result[key];
                                if (!result)
                                    return;
                            }
                            return typeof result === 'object' ? result[keyValue] : undefined;
                        }
                        else if (key === binder.meta.indexName) {
                            return indexValue;
                        }
                        else if (key === binder.meta.keyName) {
                            return keyValue;
                        }
                        else {
                            return target[key];
                        }
                    },
                    set(target, key, value) {
                        if (key === binder.meta.variableName) {
                            let result = binder.container.data;
                            for (const key of binder.meta.parts) {
                                result = result[key];
                                if (!result)
                                    return true;
                            }
                            typeof result === 'object' ? result[keyValue] = value : undefined;
                        }
                        else {
                            target[key] = value;
                        }
                        return true;
                    }
                });
                const rewrites = [];
                if (binder.meta.indexName)
                    rewrites.push([binder.meta.indexName, indexValue]);
                if (binder.meta.keyName)
                    rewrites.push([binder.meta.keyName, keyValue]);
                if (binder.meta.variableName)
                    rewrites.push([binder.meta.variableName, variableValue]);
                if (binder.rewrites)
                    rewrites.push(...binder.rewrites);
                // const d = document.createElement('div');
                // d.className = 'box';
                // const t = document.createTextNode('{{item.number}}');
                // tick.then(binder.binder.add.bind(binder.binder, t, binder.container, dynamics));
                // d.appendChild(t);
                // binder.meta.queueElement.content.appendChild(d)
                // const template = binder.meta.templateElement.content.cloneNode(true);
                // let node = template.firstChild;
                // while (node) {
                //     // binder.meta.tasks.push(tick.then(binder.binder.add.bind(binder.binder, node, binder.container, dynamics, rewrites)));
                //     tick.then(binder.binder.add.bind(binder.binder, node, binder.container, dynamics, rewrites, binder.meta.tasks));
                //     node = node.nextSibling;
                // }
                // binder.meta.queueElement.content.appendChild(template)
                binder.meta.queueElement.content.appendChild(binder.meta.templateElement.content.cloneNode(true));
                tasks.push(tick$3.then(function (length, dynamics, rewrites) {
                    const start = length * binder.meta.templateLength;
                    const stop = start + binder.meta.templateLength;
                    let index = start;
                    while (index < stop) {
                        binder.binder.add(binder.meta.queueElement.content.childNodes[index], binder.container, dynamics, rewrites, binder.meta.tasks);
                        // tick.then(binder.binder.add.bind(binder.binder, binder.meta.queueElement.content.childNodes[ index ], binder.container, dynamics, rewrites, binder.meta.tasks));
                        index++;
                    }
                }.bind(null, binder.meta.currentLength, dynamics, rewrites)));
                binder.meta.currentLength++;
            }
        }
        if (binder.meta.currentLength === binder.meta.targetLength) {
            tick$3.then(async () => {
                await Promise.all(tasks);
                await Promise.all(binder.meta.tasks);
                binder.owner.appendChild(binder.meta.queueElement.content);
                binder.meta.busy = false;
                if (binder.owner.nodeName === 'SELECT') {
                    binder.owner.$ready = true;
                    // binder.owner.$optionsReady = binder.owner.$optionsLength;
                    // binder.owner.$optionsLength = binder.owner.options.length;
                    binder.owner.dispatchEvent(new Event('$renderSelect'));
                }
            });
        }
    };

    const tick$2 = Promise.resolve();
    const html = async function (binder) {
        let data = await binder.compute();
        if (typeof data !== 'string') {
            data = '';
            console.warn('html binder requires a string');
        }
        while (binder.owner.firstChild) {
            const node = binder.owner.removeChild(binder.owner.firstChild);
            binder.binder.remove(node);
        }
        const template = document.createElement('template');
        template.innerHTML = data;
        let node = template.content.firstChild;
        while (node) {
            tick$2.then(binder.binder.add.bind(binder.binder, node, binder.container));
            node = node.nextSibling;
        }
        binder.owner.appendChild(template.content);
    };

    const text = async function text(binder) {
        let data = await binder.compute();
        binder.owner.nodeValue = format(data);
    };

    const Value = function (element) {
        if (!element)
            return undefined;
        else if ('$value' in element)
            return element.$value ? JSON.parse(JSON.stringify(element.$value)) : element.$value;
        else if (element.type === 'number' || element.type === 'range')
            return element.valueAsNumber;
        else
            return element.value;
    };
    const submit = async function (event, binder) {
        event.preventDefault();
        const form = {};
        const target = event.target;
        const elements = target?.elements || target?.form?.elements;
        for (const element of elements) {
            const { type, name, checked, hidden } = element;
            if (!name)
                continue;
            if (hidden)
                continue;
            if (type === 'radio' && !checked)
                continue;
            if (type === 'submit' || type === 'button')
                continue;
            // if (type === 'checkbox' && !checked) continue;
            let value;
            if (type === 'select-multiple') {
                value = [];
                for (const option of element.selectedOptions) {
                    value.push(Value(option));
                }
            }
            else if (type === 'select-one') {
                const [option] = element.selectedOptions;
                value = Value(option);
            }
            else {
                value = Value(element);
            }
            let data = form;
            name.split(/\s*\.\s*/).forEach((part, index, parts) => {
                const next = parts[index + 1];
                if (next) {
                    if (!data[part]) {
                        data[part] = /[0-9]+/.test(next) ? [] : {};
                    }
                    data = data[part];
                }
                else {
                    data[part] = value;
                }
            });
        }
        await binder.compute({ form, event });
        if (target.getAttribute('reset'))
            target.reset();
        return false;
    };
    const reset = async function (event, binder) {
        event.preventDefault();
        const target = event.target;
        const elements = target?.elements || target?.form?.elements;
        for (const element of elements) {
            const { type, nodeName } = element;
            if ((!type && nodeName !== 'TEXTAREA') ||
                type === 'submit' || type === 'button' || !type)
                continue;
            if (type === 'select-one') {
                element.selectedIndex = 0;
            }
            else if (type === 'select-multiple') {
                element.selectedIndex = -1;
            }
            else if (type === 'radio' || type === 'checkbox') {
                element.checked = false;
            }
            else {
                element.value = undefined;
            }
            element.dispatchEvent(new Event('input'));
        }
        await binder.compute({ event });
        return false;
    };
    const on = async function on(binder) {
        binder.owner[binder.name] = null;
        const name = binder.name.slice(2);
        if (binder.meta.method) {
            binder.owner.removeEventListener(name, binder.meta.method);
        }
        binder.meta.method = event => {
            if (name === 'reset') {
                return reset(event, binder);
            }
            else if (name === 'submit') {
                return submit(event, binder);
            }
            else {
                return binder.compute({ event });
            }
        };
        binder.owner.addEventListener(name, binder.meta.method);
    };

    const isOfIn = /{{.*?\s+(of|in)\s+.*?}}/;
    const shouldNotConvert = /^\s*{{[^{}]*}}\s*$/;
    const replaceOfIn = /{{.*?\s+(of|in)\s+(.*?)}}/;
    const cache = new Map();
    const computer = function (statement, context) {
        let compute = cache.get(statement);
        if (!compute) {
            if (isOfIn.test(statement)) {
                statement = statement.replace(replaceOfIn, '{{$2}}');
            }
            const convert = !shouldNotConvert.test(statement);
            // const assignee = statement.match(/{{.*?([a-zA-Z0-9.?\[\]]+)\s*=[^=]*}}/)?.[ 1 ];
            let code = statement;
            code = code.replace(/{{/g, convert ? `' + (` : '(');
            code = code.replace(/}}/g, convert ? `) + '` : ')');
            code = convert ? `'${code}'` : code;
            // $context.$render = $render;
            // ${assignee ? `if (!$render || !('value' in $render)) $v = $value = ${assignee}` : ''}
            // ${assignee ? `if (!$render || !('checked' in $render)) $c = $checked = ${assignee}` : ''}
            code = `
        if ($render) {
            for (let key in $render) {
                let value = $render[ key ];
                $context[ '$' + key ] = value;
                $context[ '$' + key[ 0 ] ] = value;
            }
        }
        with ($context) {
            try {
                return ${code};
            } catch (error) {
                if (error.message.indexOf('Cannot read property') === 0) return undefined;
                else console.error(error);
                // return undefined;
            }
        }
        `;
            compute = new Function('$context', '$render', code);
            cache.set(statement, compute);
        }
        return compute.bind(null, context);
    };

    // const isString = '\'`"';
    // const isNumber = /^[0-9]+$/;
    // const referenceConnector = '.[]';
    // const referenceStart = '_$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    // const referenceInner = '_$0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    // const referenceFirstSkips = [
    //     '$event', '$value', '$checked', '$form', '$e', '$v', '$c', '$f',
    //     'window', 'document', 'console', 'location',
    //     'Math', 'Date', 'Number', 'Object', 'Array', 'Infinity',
    //     'this', 'true', 'false', 'null', 'undefined', 'NaN', 'of', 'in', 'do', 'if', 'for',
    //     'var', 'let', 'const',
    //     'new', 'try', 'case', 'else', 'with', 'await', 'break', 'catch', 'class',
    //     'super', 'throw', 'while', 'yield', 'delete', 'export', 'import', 'return', 'switch', 'default',
    //     'extends', 'finally', 'continue', 'debugger', 'function', 'arguments', 'typeof', 'instanceof', 'void'
    // ];
    // const parse = function (data, rewrites?: string[][]) {
    //     let inString = false;
    //     let inSyntax = false;
    //     let inReference = false;
    //     let skipReference = false;
    //     let part = '';
    //     let first = '';
    //     let reference = '';
    //     const assignees = [];
    //     const references = [];
    //     data = data.replace(/\s*[?+-]?\s*(\.|=)\s*/g, '$1');
    //     let current, next, previous;
    //     for (let i = 0, l = data.length; i < l; i++) {
    //         current = data[ i ];
    //         next = data[ i + 1 ];
    //         previous = data[ i - 1 ];
    //         if (inString && first === current && previous !== '\\') {
    //             inString = false;
    //             first = '';
    //         } else if (!inString && isString.includes(current)) {
    //             inString = true;
    //             first = current;
    //             if (skipReference || !part || !reference && !part) {
    //                 inReference = false;
    //                 skipReference = false;
    //                 reference = part = '';
    //                 continue;
    //             }
    //             inReference = false;
    //             if (!reference && referenceFirstSkips.includes(part)) {
    //                 reference = part = '';
    //             } else {
    //                 if (rewrites && !reference) for (const [ name, value ] of rewrites) part === name ? part = value : null;
    //                 reference += (reference ? '.' + part : part);
    //                 if (!isNumber.test(reference)) references.push(reference);
    //                 reference = part = '';
    //             }
    //         } else if (inString) {
    //             continue;
    //         } else if (!inSyntax && current === '{' && next === '{') {
    //             inSyntax = true;
    //             i++;
    //         } else if (inSyntax && current === '}' && next === '}') {
    //             inSyntax = false;
    //             if (skipReference || !part || !reference && !part) {
    //                 inReference = false;
    //                 skipReference = false;
    //                 reference = part = '';
    //                 continue;
    //             }
    //             inReference = false;
    //             if (!reference && referenceFirstSkips.includes(part)) {
    //                 reference = part = '';
    //             } else {
    //                 if (rewrites && !reference) for (const [ name, value ] of rewrites) part === name ? part = value : null;
    //                 reference += (reference ? '.' + part : part);
    //                 if (!isNumber.test(reference)) references.push(reference);
    //                 reference = part = '';
    //             }
    //             i++;
    //         } else if (inSyntax) {
    //             if (inReference) {
    //                 if (referenceConnector.includes(current)) {
    //                     // if ((current === '?' && next === '.') || referenceConnector.includes(current)) {
    //                     if (skipReference || !part || !reference && !part) continue;
    //                     if (!reference && referenceFirstSkips.includes(part)) {
    //                         skipReference = true;
    //                         part = '';
    //                     } else {
    //                         if (rewrites && !reference) for (const [ name, value ] of rewrites) part === name ? part = value : null;
    //                         reference += (reference ? '.' + part : part);
    //                         part = '';
    //                     }
    //                 } else if (referenceInner.includes(current)) {
    //                     part += current;
    //                 } else {
    //                     if (skipReference || !part || !reference && !part) {
    //                         inReference = false;
    //                         skipReference = false;
    //                         reference = part = '';
    //                         continue;
    //                     }
    //                     inReference = false;
    //                     if (part === 'of' || part === 'in') {
    //                         references.length = 0;
    //                         reference = part = '';
    //                     } else if (!reference && referenceFirstSkips.includes(part)) {
    //                         skipReference = true;
    //                         reference = part = '';
    //                     } else {
    //                         if (rewrites && reference) for (const [ name, value ] of rewrites) part === name ? part = value : null;
    //                         reference += (reference ? '.' + part : part);
    //                         if (!isNumber.test(reference)) {
    //                             references.push(reference);
    //                             if (current === '=' && next !== '=') assignees.push(reference);
    //                         }
    //                         reference = part = '';
    //                     }
    //                 }
    //             } else {
    //                 if (referenceStart.includes(current)) {
    //                     inReference = true;
    //                     part += current;
    //                 }
    //             }
    //         }
    //     };
    //     // console.log(o, data, references, assignee);
    //     // console.log(data, references, assignees);
    //     return { references, assignees };
    // };
    // const matchAssignee = /{{.*?([a-zA-Z0-9.?\[\]]+)\s*=[^=]*}}/;
    const matchAssignee = /([a-zA-Z0-9$_.]+)\s*[!%^&*+|/<>-]*=\s*[^=>]/;
    const replaceEndBracket = /\s*\][^;]*/g;
    const removeStrings = /".*?[^\\]*"|'.*?[^\\]*\'|`.*?[^\\]*`/g;
    const normalizeReference = /\s*(\??\.|\[\s*([0-9]+)\s*\])\s*/g;
    const replaceOutside = /[^{}]*{{.*?\s+of\s+|[^{}]*{{|}}[^{}]*/g;
    const replaceSeperator = /\s+|\|+|\/+|\(+|\)+|\[+|\^+|\?+|\*+|\++|{+|}+|<+|>+|-+|=+|!+|&+|:+|~+|%+|,+/g; // \]+
    const replaceProtected = new RegExp([
        `;(
        [0-9]+|
        \\$event|\\$value|\\$checked|\\$form|\\$e|\\$v|\\$c|\\$f|
        this|window|document|console|location|Object|Array|Math|Date|Number|String|Boolean|
        true|false|null|undefined|NaN|of|in|do|if|for|new|try|case|else|with|await|break|catch|class|super|throw|while|
        yield|delete|export|import|return|switch|default|extends|finally|continue|debugger|function|arguments|typeof|instanceof|void
    )[^;]*;`,
    ].join('').replace(/\s|\t|\n/g, ''), 'g');
    const parse = function (data, rewrites) {
        // const o = data;
        data = data.replace(replaceOutside, ';');
        data = data.replace(removeStrings, '');
        data = data.replace(normalizeReference, '.$2');
        const assignee = data.match(matchAssignee)?.[1];
        data = data.replace(replaceSeperator, ';');
        data = data.replace(replaceEndBracket, ';');
        if (rewrites) {
            for (const [name, value] of rewrites) {
                data = data.replace(new RegExp(`;(${name})\\b`, 'g'), `;${value}`);
            }
        }
        data = data.replace(replaceProtected, ';');
        const references = data.split(/;+/).slice(1, -1) || [];
        const assignees = assignee ? [assignee] : [];
        // console.log(o, data, references, assignees);
        return { references, assignees };
    };

    const ignores = [
        // '$render', '$event', '$value', '$checked', '$form', '$e', '$v', '$c', '$f',
        'window', 'document', 'console', 'location', 'Math', 'Date', 'Number', 'Array', 'Object'
    ];
    const contexter = function (data, dynamics) {
        // dynamics = dynamics || {};
        // const context = new Proxy({}, {
        const context = new Proxy(dynamics || {}, 
        // dynamics ? Object.defineProperties({}, Object.getOwnPropertyDescriptors(dynamics)) : {},
        {
            has(target, key) {
                if (typeof key !== 'string')
                    return true;
                return ignores.includes(key) ? false : true;
            },
            set: (target, key, value) => {
                if (typeof key !== 'string')
                    return true;
                if (key === '$f' || key === '$form' ||
                    key === '$e' || key === '$event' ||
                    key === '$v' || key === '$value' ||
                    key === '$r' || key === '$render' ||
                    key === '$c' || key === '$checked')
                    target[key] = value;
                // else if (key in dynamics) dynamics[ key ] = value;
                else if (key in target)
                    target[key] = value;
                else
                    data[key] = value;
                return true;
            },
            get: (target, key) => {
                if (typeof key !== 'string')
                    return;
                if (key in target)
                    return target[key];
                // if (key in dynamics) return dynamics[ key ];
                if (key in data)
                    return data[key];
            }
        });
        return context;
    };

    const TN = Node.TEXT_NODE;
    const EN = Node.ELEMENT_NODE;
    const AN = Node.ATTRIBUTE_NODE;
    const tick$1 = Promise.resolve();
    class Binder {
        prefix = 'o-';
        prefixEach = 'o-each';
        syntaxEnd = '}}';
        syntaxStart = '{{';
        syntaxLength = 2;
        syntaxMatch = new RegExp('{{.*?}}');
        prefixReplace = new RegExp('^o-');
        syntaxReplace = new RegExp('{{|}}', 'g');
        // nodeBinders: Map<Node, Map<string, any>> = new Map();
        // pathBinders: Map<string, Map<Node, any>> = new Map();
        nodeBinders = new Map();
        pathBinders = new Map();
        binders = {
            standard,
            checked,
            value,
            each,
            html,
            text,
            on,
        };
        get(data) {
            if (typeof data === 'string') {
                return this.pathBinders.get(data);
            }
            else {
                return this.nodeBinders.get(data);
            }
        }
        async unbind(node) {
            // need to figureout how to handle boolean attributes
            const nodeBinders = this.nodeBinders.get(node);
            if (!nodeBinders)
                return;
            for (const nodeBinder of nodeBinders) {
                for (const path of nodeBinder.paths) {
                    this.pathBinders.get(path).delete(nodeBinder);
                }
            }
            this.nodeBinders.delete(node);
        }
        async bind(node, container, name, value, owner, dynamics, rewrites, tasks) {
            const type = name.startsWith('on') ? 'on' : name in this.binders ? name : 'standard';
            const context = contexter(container.data, dynamics);
            const parsed = parse(value, rewrites);
            const compute = computer(value, context);
            // const assignee = parsed.assignees[ 0 ] ? traverse.bind(null, context, parsed.assignees[ 0 ]) : () => undefined;
            const assignee = () => {
                if (!parsed.assignees[0])
                    return;
                let result = context;
                const parts = parsed.assignees[0].split('.');
                for (const part of parts) {
                    if (typeof result !== 'object')
                        return;
                    result = result[part];
                }
                return result;
            };
            const paths = parsed.references;
            const binder = {
                render: undefined,
                binder: this, meta: {}, busy: false,
                type,
                assignee,
                compute, paths,
                node, owner, name, value,
                dynamics, rewrites, context,
                container,
            };
            binder.render = this.binders[type].bind(null, binder);
            if (!this.nodeBinders.has(node)) {
                this.nodeBinders.set(node, new Set([binder]));
            }
            else {
                this.nodeBinders.get(node).add(binder);
            }
            for (const path of paths) {
                if (path) {
                    if (!this.pathBinders.has(path)) {
                        this.pathBinders.set(path, new Set([binder]));
                    }
                    else {
                        this.pathBinders.get(path).add(binder);
                    }
                }
            }
            if (tasks) {
                tasks.push(tick$1.then(binder.render));
            }
            else {
                return tick$1.then(binder.render);
            }
        }
        ;
        async remove(node) {
            if (node.nodeType === AN || node.nodeType === TN) {
                tick$1.then(this.unbind.bind(this, node));
            }
            else if (node.nodeType === EN) {
                const attributes = node.attributes;
                for (const attribute of attributes) {
                    tick$1.then(this.unbind.bind(this, attribute));
                }
                let child = node.firstChild;
                while (child) {
                    tick$1.then(this.remove.bind(this, child));
                    child = child.nextSibling;
                }
            }
        }
        async add(node, container, dynamics, rewrites, tasks) {
            if (!tasks) {
                var instanceTasks = [];
            }
            if (node.nodeType === AN) {
                const attribute = node;
                if (this.syntaxMatch.test(attribute.value)) {
                    if (tasks) {
                        tasks.push(tick$1.then(this.bind.bind(this, node, container, attribute.name, attribute.value, attribute.ownerElement, dynamics, rewrites, tasks)));
                    }
                    else {
                        return this.bind(node, container, attribute.name, attribute.value, attribute.ownerElement, dynamics, rewrites, tasks);
                    }
                }
            }
            else if (node.nodeType === TN) {
                const start = node.nodeValue.indexOf(this.syntaxStart);
                if (start === -1)
                    return;
                if (start !== 0)
                    node = node.splitText(start);
                const end = node.nodeValue.indexOf(this.syntaxEnd);
                if (end === -1)
                    return;
                if (end + this.syntaxLength !== node.nodeValue.length) {
                    const split = node.splitText(end + this.syntaxLength);
                    if (tasks) {
                        tasks.push(tick$1.then(this.add.bind(this, split, container, dynamics, rewrites, tasks)));
                    }
                    else {
                        instanceTasks.push(this.add(split, container, dynamics, rewrites));
                    }
                }
                if (tasks) {
                    tasks.push(tick$1.then(this.bind.bind(this, node, container, 'text', node.nodeValue, node, dynamics, rewrites, tasks)));
                }
                else {
                    instanceTasks.push(this.bind(node, container, 'text', node.nodeValue, node, dynamics, rewrites));
                }
            }
            else if (node.nodeType === EN) {
                const attributes = node.attributes;
                let each = false;
                for (const attribute of attributes) {
                    if (attribute.name === 'each' || attribute.name === this.prefixEach)
                        each = true;
                    if (this.syntaxMatch.test(attribute.value)) {
                        if (tasks) {
                            tasks.push(tick$1.then(this.bind.bind(this, attribute, container, attribute.name, attribute.value, attribute.ownerElement, dynamics, rewrites, tasks)));
                        }
                        else {
                            instanceTasks.push(this.bind(attribute, container, attribute.name, attribute.value, attribute.ownerElement, dynamics, rewrites));
                        }
                        attribute.value = '';
                    }
                }
                if (!each) {
                    let child = node.firstChild;
                    while (child) {
                        if (tasks) {
                            tasks.push(tick$1.then(this.add.bind(this, child, container, dynamics, rewrites, tasks)));
                        }
                        else {
                            instanceTasks.push(this.add(child, container, dynamics, rewrites));
                        }
                        child = child.nextSibling;
                    }
                }
            }
            return tasks ? undefined : Promise.all(instanceTasks);
        }
    }

    var Css = new class Css {
        #data = new Map();
        #style = document.createElement('style');
        #support = !window.CSS || !window.CSS.supports || !window.CSS.supports('(--t: black)');
        constructor() {
            this.#style.appendChild(document.createTextNode(':not(:defined){visibility:hidden;}'));
            this.#style.setAttribute('title', 'oxe');
            document.head.appendChild(this.#style);
        }
        scope(name, text) {
            return text
                .replace(/\t|\n\s*/g, '')
                // .replace(/(^\s*|}\s*|,\s*)(\.?[a-zA-Z_-]+)/g, `$1${name} $2`)
                .replace(/:host/g, name);
        }
        transform(text = '') {
            if (!this.#support) {
                const matches = text.match(/--\w+(?:-+\w+)*:\s*.*?;/g) || [];
                for (let i = 0; i < matches.length; i++) {
                    const match = matches[i];
                    const rule = match.match(/(--\w+(?:-+\w+)*):\s*(.*?);/);
                    const pattern = new RegExp('var\\(' + rule[1] + '\\)', 'g');
                    text = text.replace(rule[0], '');
                    text = text.replace(pattern, rule[2]);
                }
            }
            return text;
        }
        detach(name) {
            const item = this.#data.get(name);
            if (!item || item.count === 0)
                return;
            item.count--;
            if (item.count === 0 && this.#style.contains(item.node)) {
                this.#style.removeChild(item.node);
            }
        }
        attach(name, text) {
            const item = this.#data.get(name) || { count: 0, node: this.node(name, text) };
            if (item) {
                item.count++;
            }
            else {
                this.#data.set(name, item);
            }
            if (!this.#style.contains(item.node)) {
                this.#style.appendChild(item.node);
            }
        }
        node(name, text) {
            return document.createTextNode(this.scope(name, this.transform(text)));
        }
    };

    const tick = Promise.resolve();
    class Component extends HTMLElement {
        static attributes;
        static get observedAttributes() { return this.attributes; }
        static set observedAttributes(attributes) { this.attributes = attributes; }
        #root;
        #binder;
        #flag = false;
        #name = this.nodeName.toLowerCase();
        // this overwrites extends methods
        // adopted: () => void;
        // rendered: () => void;
        // connected: () => void;
        // disconnected: () => void;
        // attributed: (name: string, from: string, to: string) => void;
        #adopted;
        #rendered;
        #connected;
        #disconnected;
        #attributed;
        #beforeConnectedEvent = new Event('beforeconnected');
        #afterConnectedEvent = new Event('afterconnected');
        // #css: string = typeof (this as any).css === 'string' ? (this as any).css : '';
        // #html: string = typeof (this as any).html === 'string' ? (this as any).html : '';
        // #data: object = typeof (this as any).data === 'object' ? (this as any).data : {};
        // #adopt: boolean = typeof (this as any).adopt === 'boolean' ? (this as any).adopt : false;
        // #shadow: boolean = typeof (this as any).shadow === 'boolean' ? (this as any).shadow : false;
        css = '';
        html = '';
        data = {};
        adopt = false;
        shadow = false;
        get root() { return this.#root; }
        get binder() { return Binder; }
        constructor() {
            super();
            this.#binder = new Binder();
            this.#adopted = this.adopted;
            this.#rendered = this.rendered;
            this.#connected = this.connected;
            this.#attributed = this.attributed;
            this.#disconnected = this.disconnected;
            if (this.shadow && 'attachShadow' in document.body) {
                this.#root = this.attachShadow({ mode: 'open' });
            }
            else if (this.shadow && 'createShadowRoot' in document.body) {
                this.#root = this.createShadowRoot();
            }
            else {
                this.#root = this;
            }
        }
        async render() {
            const tasks = [];
            this.data = observer(this.data, async (paths) => {
                let path;
                while (path = paths.shift()) {
                    for (const [key, value] of this.#binder.pathBinders) {
                        if (value && (key === path || key.startsWith(`${path}.`))) {
                            for (const binder of value) {
                                tick.then(binder.render);
                            }
                        }
                    }
                }
            });
            if (this.adopt) {
                let child = this.firstChild;
                while (child) {
                    // tasks.push(this.#binder.add(child, this));
                    this.#binder.add(child, this, null, null, tasks);
                    child = child.nextSibling;
                }
            }
            const template = document.createElement('template');
            template.innerHTML = this.html;
            if (!this.shadow ||
                !('attachShadow' in document.body) &&
                    !('createShadowRoot' in document.body)) {
                const templateSlots = template.content.querySelectorAll('slot[name]');
                const defaultSlot = template.content.querySelector('slot:not([name])');
                for (let i = 0; i < templateSlots.length; i++) {
                    const templateSlot = templateSlots[i];
                    const name = templateSlot.getAttribute('name');
                    const instanceSlot = this.querySelector('[slot="' + name + '"]');
                    if (instanceSlot)
                        templateSlot.parentNode.replaceChild(instanceSlot, templateSlot);
                    else
                        templateSlot.parentNode.removeChild(templateSlot);
                }
                if (this.children.length) {
                    while (this.firstChild) {
                        if (defaultSlot)
                            defaultSlot.parentNode.insertBefore(this.firstChild, defaultSlot);
                        else
                            this.removeChild(this.firstChild);
                    }
                }
                if (defaultSlot)
                    defaultSlot.parentNode.removeChild(defaultSlot);
            }
            let child = template.content.firstChild;
            while (child) {
                this.#binder.add(child, this, null, null, tasks);
                // tasks.push(this.#binder.add(child, this));
                child = child.nextSibling;
            }
            await Promise.all(tasks);
            this.#root.appendChild(template.content);
        }
        async attributeChangedCallback(name, from, to) {
            await this.#attributed(name, from, to);
        }
        async adoptedCallback() {
            if (this.#adopted)
                await this.#adopted();
        }
        async disconnectedCallback() {
            Css.detach(this.#name);
            if (this.#disconnected)
                await this.#disconnected();
        }
        async connectedCallback() {
            try {
                Css.attach(this.#name, this.css);
                if (!this.#flag) {
                    this.#flag = true;
                    await this.render();
                    if (this.#rendered)
                        await this.#rendered();
                }
                this.dispatchEvent(this.#beforeConnectedEvent);
                if (this.#connected)
                    await this.#connected();
                this.dispatchEvent(this.#afterConnectedEvent);
            }
            catch (error) {
                console.error(error);
            }
        }
    }

    var Fetcher = new class Fetcher {
        option = {};
        types = [
            'json',
            'text',
            'blob',
            'formData',
            'arrayBuffer'
        ];
        mime = {
            xml: 'text/xml; charset=utf-8',
            html: 'text/html; charset=utf-8',
            text: 'text/plain; charset=utf-8',
            json: 'application/json; charset=utf-8',
            js: 'application/javascript; charset=utf-8'
        };
        async setup(option = {}) {
            this.option.path = option.path;
            this.option.method = option.method;
            this.option.origin = option.origin;
            this.option.before = option.before;
            this.option.headers = option.headers;
            this.option.after = option.after;
            this.option.acceptType = option.acceptType;
            this.option.credentials = option.credentials;
            this.option.contentType = option.contentType;
            this.option.responseType = option.responseType;
        }
        async method(method, data) {
            data = typeof data === 'string' ? { url: data } : data;
            return this.fetch({ ...data, method });
        }
        async get() {
            return this.method('get', ...arguments);
        }
        async put() {
            return this.method('put', ...arguments);
        }
        async post() {
            return this.method('post', ...arguments);
        }
        async head() {
            return this.method('head', ...arguments);
        }
        async patch() {
            return this.method('patch', ...arguments);
        }
        async delete() {
            return this.method('delete', ...arguments);
        }
        async options() {
            return this.method('options', ...arguments);
        }
        async connect() {
            return this.method('connect', ...arguments);
        }
        async serialize(data) {
            let query = '';
            for (const name in data) {
                query = query.length > 0 ? query + '&' : query;
                query = query + encodeURIComponent(name) + '=' + encodeURIComponent(data[name]);
            }
            return query;
        }
        async fetch(data = {}) {
            const { option } = this;
            const context = { ...option, ...data };
            if (context.path && typeof context.path === 'string' && context.path.charAt(0) === '/')
                context.path = context.path.slice(1);
            if (context.origin && typeof context.origin === 'string' && context.origin.charAt(context.origin.length - 1) === '/')
                context.origin = context.origin.slice(0, -1);
            if (context.path && context.origin && !context.url)
                context.url = context.origin + '/' + context.path;
            if (!context.method)
                throw new Error('Oxe.fetcher.fetch - requires method option');
            if (!context.url)
                throw new Error('Oxe.fetcher.fetch - requires url or origin and path option');
            context.aborted = false;
            context.headers = context.headers || {};
            context.method = context.method.toUpperCase();
            Object.defineProperty(context, 'abort', {
                enumerable: true,
                value() { context.aborted = true; return context; }
            });
            if (context.contentType) {
                switch (context.contentType) {
                    case 'js':
                        context.headers['Content-Type'] = this.mime.js;
                        break;
                    case 'xml':
                        context.headers['Content-Type'] = this.mime.xml;
                        break;
                    case 'html':
                        context.headers['Content-Type'] = this.mime.html;
                        break;
                    case 'json':
                        context.headers['Content-Type'] = this.mime.json;
                        break;
                    default: context.headers['Content-Type'] = context.contentType;
                }
            }
            if (context.acceptType) {
                switch (context.acceptType) {
                    case 'js':
                        context.headers['Accept'] = this.mime.js;
                        break;
                    case 'xml':
                        context.headers['Accept'] = this.mime.xml;
                        break;
                    case 'html':
                        context.headers['Accept'] = this.mime.html;
                        break;
                    case 'json':
                        context.headers['Accept'] = this.mime.json;
                        break;
                    default: context.headers['Accept'] = context.acceptType;
                }
            }
            if (typeof option.before === 'function')
                await option.before(context);
            if (context.aborted)
                return;
            if (context.body) {
                if (context.method === 'GET') {
                    context.url = context.url + '?' + await this.serialize(context.body);
                    // } else if (context.contentType === 'json') {
                }
                else if (typeof context.body === 'object') {
                    context.body = JSON.stringify(context.body);
                }
            }
            const result = await window.fetch(context.url, context);
            Object.defineProperties(context, {
                result: { enumerable: true, value: result },
                code: { enumerable: true, value: result.status }
                // headers: { enumerable: true, value: result.headers }
                // message: { enumerable: true, value: result.statusText }
            });
            const responseType = context.responseType === 'buffer' ? 'arrayBuffer' : context.responseType || '';
            const contentType = result.headers.get('content-type') || result.headers.get('Content-Type') || '';
            let type;
            if (responseType)
                type = responseType;
            else if (contentType.includes('application/json'))
                type = 'json';
            else if (contentType.includes('text/plain'))
                type = 'text';
            if (!this.types.includes(type))
                throw new Error('Oxe.fetcher.fetch - invalid responseType');
            context.body = await result[type]();
            if (typeof option.after === 'function')
                await option.after(context);
            if (context.aborted)
                return;
            return context;
        }
    };

    // https://regexr.com/5nj32
    const S_EXPORT = `

    ^export\\b
    (?:
        \\s*(default)\\s*
    )?
    (?:
        \\s*(var|let|const|function|class)\\s*
    )?
    (\\s*?:{\\s*)?
    (
        (?:\\w+\\s*,?\\s*)*
    )?
    (\\s*?:}\\s*)?

`.replace(/\s+/g, '');
    // https://regexr.com/5nj38
    const S_IMPORT = `

    import
    (?:
        (?:
            \\s+(\\w+)(?:\\s+|\\s*,\\s*)
        )
        ?
        (?:
            (?:\\s+(\\*\\s+as\\s+\\w+)\\s+)
            |
            (?:
                \\s*{\\s*
                (
                    (?:
                        (?:
                            (?:\\w+)
                            |
                            (?:\\w+\\s+as\\s+\\w+)
                        )
                        \\s*,?\\s*
                    )
                    *
                )
                \\s*}\\s*
            )
        )
        ?
        from
    )
    ?
    \\s*
    (?:"|')
    (.*?)
    (?:'|")
    (?:\\s*;)?
   
`.replace(/\s+/g, '');
    const R_IMPORT = new RegExp(S_IMPORT);
    const R_EXPORT = new RegExp(S_EXPORT);
    const R_IMPORTS = new RegExp(S_IMPORT, 'g');
    const R_EXPORTS = new RegExp(S_EXPORT, 'gm');
    const R_TEMPLATES = /[^\\]`(.|[\r\n])*?[^\\]`/g;
    const isAbsolute = function (path) {
        if (path.startsWith('/') ||
            path.startsWith('//') ||
            path.startsWith('://') ||
            path.startsWith('ftp://') ||
            path.startsWith('file://') ||
            path.startsWith('http://') ||
            path.startsWith('https://')) {
            return true;
        }
        else {
            return false;
        }
    };
    const resolve = function (...paths) {
        let path = (paths[0] || '').trim();
        for (let i = 1; i < paths.length; i++) {
            const part = paths[i].trim();
            if (path[path.length - 1] !== '/' && part[0] !== '/') {
                path += '/';
            }
            path += part;
        }
        const a = window.document.createElement('a');
        a.href = path;
        return a.href;
    };
    const fetch = function (url) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200 || xhr.status === 0) {
                        resolve(xhr.responseText);
                    }
                    else {
                        reject(new Error(`failed to import: ${url}`));
                    }
                }
            };
            try {
                xhr.open('GET', url, true);
                xhr.send();
            }
            catch {
                reject(new Error(`failed to import: ${url}`));
            }
        });
    };
    const run = function (code) {
        return new Promise(function (resolve, reject) {
            const blob = new Blob([code], { type: 'text/javascript' });
            const script = document.createElement('script');
            if ('noModule' in script) {
                script.type = 'module';
            }
            script.onerror = function (error) {
                reject(error);
                script.remove();
                URL.revokeObjectURL(script.src);
            };
            script.onload = function (error) {
                resolve(error);
                script.remove();
                URL.revokeObjectURL(script.src);
            };
            script.src = URL.createObjectURL(blob);
            document.head.appendChild(script);
        });
    };
    const transform = function (code, url) {
        let before = `window.MODULES["${url}"] = Promise.all([\n`;
        let after = ']).then(function ($MODULES) {\n';
        const templateMatches = code.match(R_TEMPLATES) || [];
        for (let i = 0; i < templateMatches.length; i++) {
            const templateMatch = templateMatches[i];
            code = code.replace(templateMatch, templateMatch
                .replace(/'/g, '\\' + '\'')
                .replace(/^([^\\])?`/, '$1\'')
                .replace(/([^\\])?`$/, '$1\'')
                .replace(/\${(.*)?}/g, '\'+$1+\'')
                .replace(/\n/g, '\\n'));
        }
        const parentImport = url.slice(0, url.lastIndexOf('/') + 1);
        const importMatches = code.match(R_IMPORTS) || [];
        for (let i = 0, l = importMatches.length; i < l; i++) {
            const importMatch = importMatches[i].match(R_IMPORT);
            if (!importMatch)
                continue;
            const rawImport = importMatch[0];
            const nameImport = importMatch[1]; // default
            let pathImport = importMatch[4] || importMatch[5];
            if (isAbsolute(pathImport)) {
                pathImport = resolve(pathImport);
            }
            else {
                pathImport = resolve(parentImport, pathImport);
            }
            before = `${before} \twindow.LOAD("${pathImport}"),\n`;
            after = `${after}var ${nameImport} = $MODULES[${i}].default;\n`;
            code = code.replace(rawImport, '') || [];
        }
        let hasDefault = false;
        const exportMatches = code.match(R_EXPORTS) || [];
        for (let i = 0, l = exportMatches.length; i < l; i++) {
            const exportMatch = exportMatches[i].match(R_EXPORT) || [];
            const rawExport = exportMatch[0];
            const defaultExport = exportMatch[1] || '';
            const typeExport = exportMatch[2] || '';
            const nameExport = exportMatch[3] || '';
            if (defaultExport) {
                if (hasDefault) {
                    code = code.replace(rawExport, `$DEFAULT = ${typeExport} ${nameExport}`);
                }
                else {
                    hasDefault = true;
                    code = code.replace(rawExport, `var $DEFAULT = ${typeExport} ${nameExport}`);
                }
            }
        }
        if (hasDefault) {
            code += '\n\nreturn { default: $DEFAULT };\n';
        }
        code = '"use strict";\n' + before + after + code + '});';
        return code;
    };
    const load = async function (url) {
        if (!url)
            throw new Error('Oxe.load - url required');
        url = resolve(url);
        // window.REGULAR_SUPPORT = false;
        // window.DYNAMIC_SUPPORT = false;
        if (typeof window.DYNAMIC_SUPPORT !== 'boolean') {
            await run('try { window.DYNAMIC_SUPPORT = true; import("data:text/javascript;base64,"); } catch (e) { /*e*/ }');
            window.DYNAMIC_SUPPORT = window.DYNAMIC_SUPPORT || false;
        }
        if (window.DYNAMIC_SUPPORT === true) {
            // console.log('native import');
            await run(`window.MODULES["${url}"] = import("${url}");`);
            return window.MODULES[url];
        }
        // console.log('not native import');
        if (window.MODULES[url]) {
            // maybe clean up
            return window.MODULES[url];
        }
        if (typeof window.REGULAR_SUPPORT !== 'boolean') {
            const script = document.createElement('script');
            window.REGULAR_SUPPORT = 'noModule' in script;
        }
        let code;
        if (window.REGULAR_SUPPORT) {
            // console.log('noModule: yes');
            code = `import * as m from "${url}"; window.MODULES["${url}"] = m;`;
        }
        else {
            // console.log('noModule: no');
            code = await fetch(url);
            code = transform(code, url);
        }
        try {
            await run(code);
        }
        catch {
            throw new Error(`Oxe.load - failed to import: ${url}`);
        }
        return this.modules[url];
    };
    window.LOAD = window.LOAD || load;
    window.MODULES = window.MODULES || {};

    const absolute = function (path) {
        const a = document.createElement('a');
        a.href = path;
        return a.pathname;
    };
    var Router = new class Router {
        #target;
        #data = {};
        #folder = '';
        #dynamic = true;
        #contain = false;
        #external;
        #after;
        #before;
        get hash() { return window.location.hash; }
        get host() { return window.location.host; }
        get hostname() { return window.location.hostname; }
        get href() { return window.location.href; }
        get origin() { return window.location.origin; }
        get pathname() { return window.location.pathname; }
        get port() { return window.location.port; }
        get protocol() { return window.location.protocol; }
        get search() { return window.location.search; }
        get query() {
            const result = {};
            const search = window.location.search;
            if (!search)
                return result;
            const queries = search.slice(1).split('&');
            for (const query of queries) {
                let [name, value] = query.split('=');
                name = decodeURIComponent(name.replace(/\+/g, ' '));
                value = decodeURIComponent(value.replace(/\+/g, ' '));
                if (name in result) {
                    if (typeof result[name] === 'object') {
                        result[name].push(value);
                    }
                    else {
                        result[name] = [result[name], value];
                    }
                }
                else {
                    result[name] = value;
                }
            }
            return result;
        }
        // set query (search) { }
        back() { window.history.back(); }
        forward() { window.history.forward(); }
        reload() { window.location.reload(); }
        redirect(href) { window.location.href = href; }
        async setup(option) {
            if ('folder' in option)
                this.#folder = option.folder;
            if ('contain' in option)
                this.#contain = option.contain;
            if ('dynamic' in option)
                this.#dynamic = option.dynamic;
            if ('external' in option)
                this.#external = option.external;
            if ('before' in option)
                this.#before = option.before;
            if ('after' in option)
                this.#after = option.after;
            // if ('beforeConnected' in option) this.#beforeConnected = option.beforeConnected;
            // if ('afterConnected' in option) this.#afterConnected = option.afterConnected;
            this.#target = option.target instanceof Element ? option.target : document.body.querySelector(option.target);
            if (this.#dynamic) {
                window.addEventListener('popstate', this.#state.bind(this), true);
                if (this.#contain) {
                    this.#target.addEventListener('click', this.#click.bind(this), true);
                }
                else {
                    window.document.addEventListener('click', this.#click.bind(this), true);
                }
            }
            return this.replace(window.location.href);
        }
        async assign(data) {
            return this.#go(data, { mode: 'push' });
        }
        async replace(data) {
            return this.#go(data, { mode: 'replace' });
        }
        #location(href = window.location.href) {
            const parser = document.createElement('a');
            parser.href = href;
            return {
                // path: '',
                // path: parser.pathname,
                href: parser.href,
                host: parser.host,
                port: parser.port,
                hash: parser.hash,
                search: parser.search,
                protocol: parser.protocol,
                hostname: parser.hostname,
                pathname: parser.pathname
                // pathname: parser.pathname[0] === '/' ? parser.pathname : '/' + parser.pathname
            };
            // location.path = location.pathname + location.search + location.hash;
            // return location;
        }
        async #go(path, options = {}) {
            // if (options.query) {
            //     path += Query(options.query);
            // }
            const mode = options.mode || 'push';
            const location = this.#location(path);
            let element;
            if (location.pathname in this.#data) {
                element = this.#data[location.pathname].element;
            }
            else {
                const path = location.pathname === '/' ? '/index' : location.pathname;
                let load$1 = path;
                if (load$1.slice(0, 2) === './')
                    load$1 = load$1.slice(2);
                if (load$1.slice(0, 1) !== '/')
                    load$1 = '/' + load$1;
                if (load$1.slice(0, 1) === '/')
                    load$1 = load$1.slice(1);
                load$1 = `${this.#folder}/${load$1}.js`.replace(/\/+/g, '/');
                load$1 = absolute(load$1);
                let component;
                try {
                    component = (await load(load$1)).default;
                }
                catch (error) {
                    if (error.message === `Failed to fetch dynamically imported module: ${window.location.origin}${load$1}`) {
                        component = (await load(absolute(`${this.#folder}/all.js`))).default;
                    }
                    else {
                        throw error;
                    }
                }
                const name = 'route' + path.replace(/\/+/g, '-');
                window.customElements.define(name, component);
                element = window.document.createElement(name);
                this.#data[location.pathname] = { element };
            }
            if (this.#before)
                await this.#before(location, element);
            if (!this.#dynamic) {
                return window.location[mode === 'push' ? 'assign' : mode](location.href);
            }
            window.history.replaceState({
                href: window.location.href,
                top: document.documentElement.scrollTop || document.body.scrollTop || 0
            }, '', window.location.href);
            window.history[mode + 'State']({
                top: 0,
                href: location.href
            }, '', location.href);
            const keywords = document.querySelector('meta[name="keywords"]');
            const description = document.querySelector('meta[name="description"]');
            if (element.title)
                window.document.title = element.title;
            if (element.keywords && keywords)
                keywords.setAttribute('content', element.keywords);
            if (element.description && description)
                description.setAttribute('content', element.description);
            while (this.#target.firstChild) {
                this.#target.removeChild(this.#target.firstChild);
            }
            if (this.#after) {
                element.removeEventListener('afterconnected', this.#data[location.pathname].after);
                const after = this.#after.bind(this.#after, location, element);
                this.#data[location.pathname].after = after;
                element.addEventListener('afterconnected', after);
            }
            this.#target.appendChild(element);
            window.dispatchEvent(new CustomEvent('router', { detail: location }));
        }
        async #state(event) {
            await this.replace(event.state?.href || window.location.href);
            window.scroll(event.state?.top || 0, 0);
        }
        async #click(event) {
            // ignore canceled events, modified clicks, and right clicks
            if (event.target.type ||
                event.button !== 0 ||
                event.defaultPrevented ||
                event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
                return;
            // if shadow dom use
            let target = event.path ? event.path[0] : event.target;
            let parent = target.parentElement;
            if (this.#contain) {
                while (parent) {
                    if (parent.nodeName === this.#target.nodeName) {
                        break;
                    }
                    else {
                        parent = parent.parentElement;
                    }
                }
                if (parent.nodeName !== this.#target.nodeName) {
                    return;
                }
            }
            while (target && 'A' !== target.nodeName) {
                target = target.parentElement;
            }
            if (!target || 'A' !== target.nodeName) {
                return;
            }
            if (target.hasAttribute('download') ||
                target.hasAttribute('external') ||
                target.hasAttribute('o-external') ||
                target.href.startsWith('tel:') ||
                target.href.startsWith('ftp:') ||
                target.href.startsWith('file:)') ||
                target.href.startsWith('mailto:') ||
                !target.href.startsWith(window.location.origin)
            // ||
            // (target.hash !== '' &&
            //     target.origin === window.location.origin &&
            //     target.pathname === window.location.pathname)
            )
                return;
            // if external is true then default action
            if (this.#external &&
                (this.#external instanceof RegExp && this.#external.test(target.href) ||
                    typeof this.#external === 'function' && this.#external(target.href) ||
                    typeof this.#external === 'string' && this.#external === target.href))
                return;
            event.preventDefault();
            this.assign(target.href);
        }
    };
    // function Query (data) {
    //     data = data || window.location.search;
    //     if (typeof data === 'string') {
    //         const result = {};
    //         if (data.indexOf('?') === 0) data = data.slice(1);
    //         const queries = data.split('&');
    //         for (let i = 0; i < queries.length; i++) {
    //             const [ name, value ] = queries[i].split('=');
    //             if (name !== undefined && value !== undefined) {
    //                 if (name in result) {
    //                     if (typeof result[name] === 'string') {
    //                         result[name] = [ value ];
    //                     } else {
    //                         result[name].push(value);
    //                     }
    //                 } else {
    //                     result[name] = value;
    //                 }
    //             }
    //         }
    //         return result;
    //     } else {
    //         const result = [];
    //         for (const key in data) {
    //             const value = data[key];
    //             result.push(`${key}=${value}`);
    //         }
    //         return `?${result.join('&')}`;
    //     }
    // }

    const toDash = (data) => data.replace(/[a-zA-Z][A-Z]/g, c => `${c[0]}-${c[1]}`.toLowerCase());
    async function Define(component) {
        if (typeof component === 'string') {
            const loaded = await load(component);
            return Define(loaded.default);
        }
        else if (component instanceof Array) {
            return Promise.all(component.map(data => Define(data)));
        }
        else {
            const name = toDash(component.name);
            window.customElements.define(name, component);
        }
    }

    // declare global {
    //     interface Window {
    //         Reflect: any;
    //         NodeList: any;
    //         CustomEvent: any;
    //     }
    // }
    // if (typeof window.CustomEvent !== 'function') {
    //     window.CustomEvent = function CustomEvent (event, options) {
    //         'use strict';
    //         options = options || { bubbles: false, cancelable: false, detail: null };
    //         var customEvent = document.createEvent('CustomEvent');
    //         customEvent.initCustomEvent(event, options.bubbles, options.cancelable, options.detail);
    //         return customEvent;
    //     };
    // }
    // if (typeof window.Reflect !== 'object' && typeof window.Reflect.construct !== 'function') {
    //     window.Reflect = window.Reflect || {};
    //     window.Reflect.construct = function construct (parent, args, child) {
    //         'use strict';
    //         var target = child === undefined ? parent : child;
    //         var prototype = Object.create(target.prototype || Object.prototype);
    //         return Function.prototype.apply.call(parent, prototype, args) || prototype;
    //     };
    // }
    // if (window.NodeList && !window.NodeList.prototype.forEach) {
    //     window.NodeList.prototype.forEach = window.Array.prototype.forEach;
    // }
    if (!window.String.prototype.startsWith) {
        window.String.prototype.startsWith = function startsWith(search, rawPos) {
            var pos = rawPos > 0 ? rawPos | 0 : 0;
            return this.substring(pos, pos + search.length) === search;
        };
    }
    if (!window.String.prototype.includes) {
        window.String.prototype.includes = function includes(search, start) {
            if (search instanceof RegExp)
                throw TypeError('first argument must not be a RegExp');
            if (start === undefined) {
                start = 0;
            }
            return this.indexOf(search, start) !== -1;
        };
    }
    if (!window.Node.prototype.getRootNode) {
        window.Node.prototype.getRootNode = function getRootNode(opt) {
            var composed = typeof opt === 'object' && Boolean(opt.composed);
            return composed ? getShadowIncludingRoot(this) : getRoot(this);
        };
        function getShadowIncludingRoot(node) {
            var root = getRoot(node);
            if (isShadowRoot(root))
                return getShadowIncludingRoot(root.host);
            return root;
        }
        function getRoot(node) {
            if (node.parentNode != null)
                return getRoot(node.parentNode);
            return node;
        }
        function isShadowRoot(node) {
            return node.nodeName === '#document-fragment' && node.constructor.name === 'ShadowRoot';
        }
    }
    var index = Object.freeze(new class Oxe {
        Component = Component;
        component = Component;
        Fetcher = Fetcher;
        fetcher = Fetcher;
        Router = Router;
        router = Router;
        Define = Define;
        define = Define;
        Load = load;
        load = load;
        Css = Css;
        css = Css;
    });

    return index;

})));
