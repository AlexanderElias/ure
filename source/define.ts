import context from './context';
import bind from './bind';
import dash from './dash';

import {
    Internal,
    DefineInit,
    Instance,
    Constructor,
} from './types';

import {
    tag,
    adopted,
    attributed,
    connected,
    create,
    created,
    disconnected,
    internal,
    render,
    rendered,
    state,
    update,
    extend,
    shadow,
} from './symbols';

import {
    createdEvent,
    creatingEvent,

    renderedEvent,
    renderingEvent,

    adoptedEvent,
    adoptingEvent,

    connectedEvent,
    connectingEvent,

    attributedEvent,
    attributingEvent,

    disconnectedEvent,
    disconnectingEvent,
} from './events';
import { replaceChildren } from './poly';

const tick = () => Promise.resolve();

const createMethod = async function (this: Instance) {
    this[ internal ].created = true;
    this[ internal ].queued = true;
    this[ internal ].started = true;

    // const constructor = this.constructor as typeof Component;
    // const observedProperties = constructor.observedProperties;
    // const prototype = Object.getPrototypeOf(this);
    // const properties = observedProperties ?
    //     observedProperties ?? [] :
    //     [ ...Object.getOwnPropertyNames(this),
    //     ...Object.getOwnPropertyNames(prototype) ];
    // for (const property of properties) {
    //     if (
    //         'attributeChangedCallback' === property ||
    //         'disconnectedCallback' === property ||
    //         'connectedCallback' === property ||
    //         'adoptedCallback' === property ||
    //         'constructor' === property ||
    //         'disconnected' === property ||
    //         'attribute' === property ||
    //         'connected' === property ||
    //         'rendered' === property ||
    //         'created' === property ||
    //         'adopted' === property ||
    //         'render' === property ||
    //         'setup' === property
    //     ) continue;
    //     const descriptor = Object.getOwnPropertyDescriptor(this, property) ?? Object.getOwnPropertyDescriptor(prototype, property);
    //     if (!descriptor) continue;
    //     if (!descriptor.configurable) continue;
    //     if (typeof descriptor.value === 'function') descriptor.value = descriptor.value.bind(this);
    //     if (typeof descriptor.get === 'function') descriptor.get = descriptor.get.bind(this);
    //     if (typeof descriptor.set === 'function') descriptor.set = descriptor.set.bind(this);
    //     Object.defineProperty(this.#context, property, descriptor);
    //     Object.defineProperty(this, property, {
    //         configurable: false,
    //         enumerable: descriptor.enumerable,
    //         // configurable: descriptor.configurable,
    //         get () {
    //             return (this.#context as Record<any, any>)[ property ];
    //         },
    //         set (value) {
    //             (this.#context as Record<any, any>)[ property ] = value;
    //             this[ update ]();
    //         }
    //     });
    // }

    this.dispatchEvent(renderingEvent);

    await this.$state?.(this[ internal ].state);

    const template = await this.$render?.(this[ internal ].state);
    if (template) {

        // const fragment = document.importNode(template.template.content, true);
        const fragment = template.template.content.cloneNode(true) as DocumentFragment;

        this[ internal ].marker = template.marker;
        this[ internal ].expressions = template.expressions;

        bind(fragment, this[internal ].actions, this[ internal ].marker);

        for (let index = 0; index < this[ internal ].actions.length; index++) {
            const newExpression = template.expressions[ index ];
            try {
                this[ internal ].actions[ index ](undefined, newExpression);
            } catch (error) {
                console.error(error);
            }
        }

        document.adoptNode(fragment);

        this[ internal ].root.appendChild(fragment);
    }

    this.dispatchEvent(creatingEvent);
    await this.$created?.(this[ internal ].state)?.catch(console.error);
    this.dispatchEvent(createdEvent);

    this.dispatchEvent(connectingEvent);
    await this.$connected?.(this[ internal ].state)?.catch(console.error);
    this.dispatchEvent(connectedEvent);

    this[ internal ].queued = false;
    this[ internal ].started = false;
    this[ internal ].restart = false;
    await this[ update ]();
};

const updateMethod = async function (this: Instance) {

    if (this[ internal ].queued && !this[ internal ].started) {
        // console.debug('Update: queued and not started');
        return this[ internal ].task;
    }

    if (this[ internal ].queued && this[ internal ].started) {
        // console.debug('Update: queued and started');
        this[ internal ].restart = true;
        return this[ internal ].task;
    }

    this[ internal ].queued = true;
    this[ internal ].task = this[ internal ].task.then(async () => {
        // console.debug('Update: in progress');
        // await tick();

        this.dispatchEvent(renderingEvent);
        const template = await this.$render?.(this[ internal ].state);

        this[ internal ].started = true;

        if (template) {
            for (let index = 0; index < this[ internal ].actions.length; index++) {

                if (this[ internal ].restart) {
                    // console.debug('Update: restart');
                    await tick();
                    index = -1;
                    this[ internal ].restart = false;
                    continue;
                }

                const newExpression = template.expressions[ index ];
                const oldExpression = this[ internal ].expressions[ index ];

                try {
                    this[ internal ].actions[ index ](oldExpression, newExpression);
                } catch (error) {
                    console.error(error);
                }

                this[ internal ].expressions[ index ] = template.expressions[ index ];
            }

        }

        this[ internal ].queued = false;
        this[ internal ].started = false;

        await this.$rendered?.(this[ internal ].state)?.catch(console.error);;
        this.dispatchEvent(renderedEvent);

    }).catch(console.error);

    return this[ internal ].task;
};

const attributeChangedCallback = async function (this: Instance, name: string, oldValue: string, newValue: string) {
    this.dispatchEvent(attributingEvent);
    await this.$attributed?.(name, oldValue, newValue)?.catch(console.error);
    this.dispatchEvent(attributedEvent);
};

const adoptedCallback = async function (this: Instance) {
    this.dispatchEvent(adoptingEvent);
    await this.$adopted?.(this[ internal ].state)?.catch(console.error);
    this.dispatchEvent(adoptedEvent);
};

const connectedCallback = async function (this: Instance) {
    if (!this[ internal ].created) {
        await this[ create ]();
    } else {
        this.dispatchEvent(connectingEvent);
        await this.$connected?.(this[ internal ].state)?.catch(console.error);
        this.dispatchEvent(connectedEvent);
    }
};

const disconnectedCallback = async function (this: Instance) {
    this.dispatchEvent(disconnectingEvent);
    await this.$disconnected?.(this[ internal ].state)?.catch(console.error);
    this.dispatchEvent(disconnectedEvent);
};

const init = (target: Constructor) => {
// const init = (target: Constructor, defineInit?: DefineInit) => {
    // defineInit = typeof defineInit === 'string' ? { tag: defineInit } : { ...defineInit };

    // const $extend = defineInit.extend ?? target.$extend;
    // const $shadow = defineInit.shadow ?? target.$shadow ?? 'open';
    // const $tag = dash(defineInit.tag ?? target.$tag ?? target.name);

    const $mount = target.$mount;
    const $extend = target.$extend;
    const $shadow =  target.$shadow ?? 'open';
    const $tag = dash(target.$tag ?? target.name);

    Object.defineProperties(target, {
        $tag: { value: $tag },
        $shadow: { value: $shadow },
        $extend: { value: $extend },
        $mount: { value: $mount },
    });

    Object.defineProperties(target.prototype, {
        [ internal ]: {
            get: function () {
                const value: Internal = {
                    queued: false,
                    created: false,
                    restart: false,
                    started: false,
                    marker: '',
                    actions: [],
                    expressions: [],
                    task: Promise.resolve(),
                    state: context({}, this[ update ].bind(this)),
                    root: $shadow == 'open' || $shadow == 'closed' ? this.attachShadow({ mode: $shadow }) : this
                };
                Object.defineProperty(this, internal, {
                    value,
                    configurable: false,
                    enumerable: false,
                    writable: false
                });
                return value;
            }
        },
        [create]: { value: createMethod },
        [update]: { value: updateMethod },
        adoptedCallback: { value: adoptedCallback },
        connectedCallback: { value: connectedCallback },
        disconnectedCallback: { value: disconnectedCallback },
        attributeChangedCallback: { value: attributeChangedCallback },
    });

    if (customElements.get($tag) !== target) {
        customElements.define($tag, target, { extends: $extend });
    }

    if ($mount) {
        const ready = () => {
            const container = $mount === 'body' ? document.body : document.querySelector($mount);
            if (!container) throw new Error('XElement mount - container not found');

            const $tag = dash(target.$tag ?? target.name);
            const $extend = target.$extend;
            const element = document.createElement($extend || $tag, $extend ? { is: $tag } : undefined);

            customElements.upgrade(element);
            replaceChildren(container, element)
        };
        if (document.readyState === 'loading') {
            document.addEventListener('readystatechange', ready, { once: true });
        } else {
            ready();
        }
    }

    // return target;
};

export const define = () => (constructor: Constructor, context?: ClassDecoratorContext) => {
// export const define = (defineInit?: DefineInit) => (constructor: Constructor, context?: ClassDecoratorContext) => {
    const target = constructor;

    if (context !== undefined) {
        return context.addInitializer(() => init(target));
        // return context.addInitializer(() => init(target, defineInit));
    } else {
        return init(target);
        // return init(target, defineInit);
    }

};

export default define;
