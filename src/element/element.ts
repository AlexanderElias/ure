import { dataDelete, dataEvent, dataGet, dataSet } from './data.ts';

import StandardBinder from './standard.ts';
import CheckedBinder from './checked.ts';
import InheritBinder from './inherit.ts';
import ValueBinder from './value.ts';
import EachBinder from './each.ts';
import HtmlBinder from './html.ts';
import TextBinder from './text.ts';
import OnBinder from './on.ts';

import dash from './dash.ts';

const TEXT = Node.TEXT_NODE;
const ELEMENT = Node.ELEMENT_NODE;
const FRAGMENT = Node.DOCUMENT_FRAGMENT_NODE;

if ('shadowRoot' in HTMLTemplateElement.prototype === false) {
    (function attachShadowRoots (root: Document | ShadowRoot) {
        const templates: NodeListOf<HTMLTemplateElement> = root.querySelectorAll('template[shadowroot]');
        for (const template of templates) {
            const mode = (template.getAttribute('shadowroot') || 'closed') as ShadowRootMode;
            const shadowRoot = (template.parentNode as HTMLElement).attachShadow({ mode });
            shadowRoot.appendChild(template.content);
            template.remove();
            attachShadowRoots(shadowRoot);
        }
    })(document);
}

export default class XElement extends HTMLElement {

    static define (name?: string, constructor?: typeof XElement) {
        constructor = constructor ?? this;
        name = name ?? dash(this.name);
        customElements.define(name, constructor);
    }

    static defined (name: string) {
        name = name ?? dash(this.name);
        return customElements.whenDefined(name);
    }

    static observedProperties: string[] = [];

    #mutator: any;
    #data = {};
    #setup = false;
    #syntaxEnd = '}}';
    #syntaxStart = '{{';
    #syntaxLength = 2;
    binders: Map<string | Node, any> = new Map();
    #syntaxMatch = new RegExp('{{.*?}}');
    #adoptedEvent = new Event('adopted');
    #adoptingEvent = new Event('adopting');
    #connectedEvent = new Event('connected');
    #connectingEvent = new Event('connecting');
    #attributedEvent = new Event('attributed');
    #attributingEvent = new Event('attributing');
    #disconnectedEvent = new Event('disconnected');
    #disconnectingEvent = new Event('disconnecting');

    constructor () {
        super();
        if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
        this.#mutator = new MutationObserver(this.#mutation.bind(this));
        this.#mutator.observe(this, { childList: true });
        this.#mutator.observe((this.shadowRoot as ShadowRoot), { childList: true });
        // this.#mutator.observe(this, { childList: true, subtree: true });
        // this.#mutator.observe((this.shadowRoot as ShadowRoot), { childList: true, subtree: true });
    }

    setup () {
        if (this.#setup) return;
        else this.#setup = true;

        // (this as any).initialized?.();

        const data: Record<any, any> = {};
        const properties = (this.constructor as any).observedProperties;

        for (const property of properties) {

            const descriptor = Object.getOwnPropertyDescriptor(this, property) ??
                Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), property) ?? {};

            if ('set' in descriptor) descriptor.set = descriptor.set?.bind(this);
            if ('get' in descriptor) descriptor.get = descriptor.get?.bind(this);
            if (typeof descriptor.value === 'function') descriptor.value = descriptor.value?.bind?.(this);

            Object.defineProperty(data, property, descriptor);
            Object.defineProperty(this, property, {
                get: () => (this as any).#data[ property ],
                set: (value) => (this as any).#data[ property ] = value
            });

        }

        this.#data = new Proxy(data, {
            get: dataGet.bind(null, dataEvent.bind(null, this.binders), ''),
            set: dataSet.bind(null, dataEvent.bind(null, this.binders), ''),
            deleteProperty: dataDelete.bind(null, dataEvent.bind(null, this.binders), '')
        });

        let node;

        node = this.shadowRoot?.firstChild;
        while (node) {
            this.register(node);
            node = node.nextSibling;
        }

        node = this.firstChild;
        while (node) {
            this.register(node);
            node = node.nextSibling;
        }

        // (this as any).prepared?.();

        // this.#mutator = new MutationObserver(this.#mutation.bind(this));
        // this.#mutator.observe(this, { childList: true });
        // this.#mutator.observe((this.shadowRoot as ShadowRoot), { childList: true });
    }

    #mutation (mutations: Array<MutationRecord>) {
        console.log(mutations);
        // (this as any).mutating?.();
        if (!this.#setup) return this.setup();
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                console.log(node);
                this.register(node);
            }
            for (const node of mutation.removedNodes) {
                this.release(node);
            }
        }
        // (this as any).mutated?.();
    }

    #remove (node: Node) {
        const binders = this.binders.get(node);
        if (!binders) return;

        for (const binder of binders) {
            for (const reference of binder.references) {
                this.binders.get(reference)?.delete(binder);
                if (!this.binders.get(reference)?.size) this.binders.delete(reference);
            }
        }

        this.binders.delete(node);
    }

    #add (node: Node, context?: any, rewrites?: any) {
        if (this.binders.has(node)) return console.warn(node);

        let binder;
        if (node.nodeName === '#text') binder = new TextBinder(node, this, context ?? this.#data, rewrites);
        else if (node.nodeName === 'html') binder = new HtmlBinder(node, this, context ?? this.#data, rewrites);
        else if (node.nodeName === 'each') binder = new EachBinder(node, this, context ?? this.#data, rewrites);
        else if (node.nodeName === 'value') binder = new ValueBinder(node, this, context ?? this.#data, rewrites);
        else if (node.nodeName === 'inherit') binder = new InheritBinder(node, this, context ?? this.#data);
        else if (node.nodeName === 'checked') binder = new CheckedBinder(node, this, context ?? this.#data, rewrites);
        else if (node.nodeName.startsWith('on')) binder = new OnBinder(node, this, context ?? this.#data, rewrites);
        else binder = new StandardBinder(node, this, context ?? this.#data, rewrites);

        for (let i = 0; i < binder.references.length; i++) {

            if (rewrites) {
                for (const [ name, value ] of rewrites) {
                    // might need to improve the name boundary
                    binder.references[ i ] = binder.references[ i ].replace(name, value);
                }
            }

            if (this.binders.has(binder.references[ i ])) {
                this.binders.get(binder.references[ i ]).add(binder);
            } else {
                this.binders.set(binder.references[ i ], new Set([ binder ]));
            }
        }

        if (this.binders.has(binder.owner)) {
            this.binders.get(binder.owner).add(binder);
        } else {
            this.binders.set(binder.owner, new Set([ binder ]));
        }

        binder.render();
    }

    release (node: Node) {
        if (node.nodeType === TEXT) {
            this.#remove(node);
        } else if (node.nodeType === ELEMENT) {
            this.#remove(node);
            const attributes = (node as Element).attributes;
            for (const attribute of attributes) {
                this.#remove(attribute);
            }

            let child = node.firstChild;
            while (child) {
                this.release(child);
                child = child.nextSibling;
            }

        }
    }

    register (node: Node, context?: any, rewrites?: any) {

        if (node.nodeType === FRAGMENT) {
            node = node.firstChild as Node;
            while (node) {
                this.register(node, context, rewrites);
                node = node.nextSibling as Node;
            }
        } else if (node.nodeType === TEXT) {

            const start = node.nodeValue?.indexOf(this.#syntaxStart) ?? -1;
            if (start === -1) return;

            if (start !== 0) node = (node as Text).splitText(start);

            const end = node.nodeValue?.indexOf(this.#syntaxEnd) ?? -1;
            if (end === -1) return;

            if (end + this.#syntaxLength !== node.nodeValue?.length) {
                const split = (node as Text).splitText(end + this.#syntaxLength);
                this.register(split, context, rewrites);
            }

            this.#add(node, context, rewrites);

        } else if (node.nodeType === ELEMENT) {

            const inherit = (node as Element).attributes.getNamedItem('inherit');
            if (inherit) this.#add(inherit, context, rewrites);

            const each = (node as Element).attributes.getNamedItem('each');
            if (each) this.#add(each, context, rewrites);

            // if (!each && !inherit && !(node instanceof XElement)) {
            if (!each && !inherit) {
                let child = node.firstChild;
                while (child) {
                    this.register(child, context, rewrites);
                    child = child.nextSibling;
                }
            }

            const attributes = [ ...(node as Element).attributes ];
            for (const attribute of attributes) {
                if (attribute.name !== 'each' && attribute.name !== 'inherit' && this.#syntaxMatch.test(attribute.value)) {
                    this.#add(attribute, context, rewrites);
                }
            }

        }
    }

    adoptedCallback () {
        this.dispatchEvent(this.#adoptingEvent);
        (this as any).adopted?.();
        this.dispatchEvent(this.#adoptedEvent);
    }

    connectedCallback () {
        this.dispatchEvent(this.#connectingEvent);
        (this as any).connected?.();
        this.dispatchEvent(this.#connectedEvent);
    }

    disconnectedCallback () {
        this.dispatchEvent(this.#disconnectingEvent);
        (this as any).disconnected?.();
        this.dispatchEvent(this.#disconnectedEvent);
    }

    attributeChangedCallback (name: string, from: string, to: string) {
        this.dispatchEvent(this.#attributingEvent);
        (this as any).attributed?.(name, from, to);
        this.dispatchEvent(this.#attributedEvent);
    }

}
