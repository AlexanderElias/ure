console.warn('oxe: need to handle delete property');

type task = (path?: string) => Promise<any>;
type tasks = task[];

const $path = Symbol('$path');
const $task = Symbol('$task');
const $tasks = Symbol('$tasks');
const $proxy = Symbol('$proxy');
const $setup = Symbol('$setup');

// const tick = Promise.resolve();

const run = async function (tasks: tasks) {
    let task;
    while (task = tasks.shift()) {
        await task();
    }
};

const set = function (target: any, key: any, value: any, receiver: any) {
    if (key === $path) return true;
    if (key === $task) return true;
    if (key === $tasks) return true;
    if (key === $proxy) return true;
    if (key === $setup) return true;
    if (key === 'length') return target[ $tasks ].push(target[ $task ].bind(null, target[ $path ]));

    const current = target[ key ];
    if (current !== current && value !== value) return true; // NaN check
    if (current === value && target[ $setup ]) return true;
    // if (current === value) return true;

    const path = target[ $path ] ? `${target[ $path ]}.${key}` : `${key}`;
    const initial = !target[ $tasks ].length;
    // console.log(path);

    if (value && typeof value === 'object') {
        if (value[ $proxy ]) return true;

        target[ $tasks ].push(target[ $task ].bind(null, path));

        // const clone = value.constructor();
        // clone[ $path ] = path;
        // clone[ $proxy ] = true;
        // clone[ $task ] = target[ $task ];
        // clone[ $tasks ] = target[ $tasks ];
        // const proxy = new Proxy(clone, handler);
        // Object.assign(proxy, value);
        // target[ key ] = proxy;

        value[ $path ] = path;
        value[ $proxy ] = true;
        value[ $setup ] = false;
        value[ $task ] = target[ $task ];
        value[ $tasks ] = target[ $tasks ];
        const proxy = new Proxy(value, handler);
        Object.assign(proxy, value);
        value[ $setup ] = true;
        target[ key ] = proxy;
    } else {
        target[ $tasks ].push(target[ $task ].bind(null, path));
        target[ key ] = value;
    }

    if (initial) run(target[ $tasks ]);

    return true;
};

const handler = { set };

const observer = function (source: any, task: task) {
    source[ $path ] = '';
    source[ $tasks ] = [];
    source[ $task ] = task;
    source[ $proxy ] = true;
    source[ $setup ] = false;
    const proxy = new Proxy(source, handler);
    Object.assign(proxy, source);
    source[ $setup ] = true;
    return proxy;
};

export default observer;
