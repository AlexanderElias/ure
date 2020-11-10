import Observer from './observer.js';
import Binder from './binder.js';
import Css from './css.js';

const compose = function (instance, template) {
    const templateSlots = template.querySelectorAll('slot[name]');
    const defaultSlot = template.querySelector('slot:not([name])');

    for (let i = 0; i < templateSlots.length; i++) {

        const templateSlot = templateSlots[i];
        const name = templateSlot.getAttribute('name');
        const instanceSlot = instance.querySelector('[slot="'+ name + '"]');

        if (instanceSlot) {
            templateSlot.parentNode.replaceChild(instanceSlot, templateSlot);
        } else {
            templateSlot.parentNode.removeChild(templateSlot);
        }

    }

    if (instance.children.length) {
        while (instance.firstChild) {
            if (defaultSlot) {
                defaultSlot.parentNode.insertBefore(instance.firstChild, defaultSlot);
            } else {
               instance.removeChild(instance.firstChild);
            }
        }
    }

    if (defaultSlot) {
        defaultSlot.parentNode.removeChild(defaultSlot);
    }

};

class Component extends HTMLElement {

    static model = {};
    static template = '';
    static attributes = [];
    static get observedAttributes () { return this.attributes; }
    static set observedAttributes (attributes) { this.attributes = attributes; }

    #name
    #root
    #adopt;
    #shadow;
    #adopted;
    #created;
    #attached;
    #detached;
    #attributed;

    #css = Css;
    get css () { return this.#css; }

    #binder = Binder;
    get binder () { return this.#binder; }

    // #template = '';
    // get template () { return this.#template; }

    #model;
    get model () { return this.#model; }

    // #methods = {};
    // get methods () { return this.#methods; }

    constructor () {
        super();

        this.#adopt = typeof this.constructor.adopt === 'boolean' ? this.constructor.adopt : false;
        this.#shadow = typeof this.constructor.shadow === 'boolean' ? this.constructor.shadow : false;
        this.#adopted = typeof this.constructor.adopted === 'function' ? this.constructor.adopted : function () {};
        this.#created = typeof this.constructor.created === 'function' ? this.constructor.created : function () {};
        this.#attached = typeof this.constructor.attached === 'function' ? this.constructor.attached : function () {};
        this.#detached = typeof this.constructor.detached === 'function' ? this.constructor.detached : function () {};
        this.#attributed = typeof this.constructor.attributed === 'function' ? this.constructor.attributed : function () {};

        this.#name = this.nodeName.toLowerCase();
        // this.#methods = this.constructor.methods || {};
        // this.#template = this.constructor.template || '';

        this.#model = Observer.clone(this.constructor.model, (data, path) => {
        // this.#model = Observer.create(this.constructor.model, (data, path) => {
            Binder.data.forEach(binder => {
                if (binder.container === this && binder.path.includes(path)) {
                // if (binder.container === this && binder.path === path) {
                    Binder.render(binder);
                }
            });
        }); 

    }

    render () {

        const template = document.createElement('template');
        template.innerHTML = this.constructor.template;

        const clone = template.content.cloneNode(true);

        if (this.#adopt === true) {
            let child = this.firstElementChild;
            while (child) {
                Binder.add(child, this);
                child = child.nextElementSibling;
            }
        }

        if (this.#shadow && 'attachShadow' in document.body) {
            this.#root = this.attachShadow({ mode: 'open' });
        } else if (this.#shadow && 'createShadowRoot' in document.body) {
            this.#root = this.createShadowRoot();
        } else {
            compose(this, clone);
            this.#root = this;
        }

        // if (fragment) root.appendChild(fragment);
        // root.appendChild(fragment);

        let child = clone.firstElementChild;
        while (child) {
            // if (this.#adopt === false) 
            Binder.add(child, this);
            this.#root.appendChild(child);
            child = clone.firstElementChild;
        }

    }

    attributeChangedCallback () {
        Promise.resolve().then(() => this.#attributed(...arguments));
    }

    adoptedCallback () {
        Promise.resolve().then(() => this.#adopted());
    }

    disconnectedCallback () {
        this.#css.detach(this.#name);
        Promise.resolve().then(() => this.#detached());
    }

    connectedCallback () {
        this.#css.attach(this.#name, this.constructor.css);

        if (this.CREATED) {
            Promise.resolve().then(() => this.#attached());
        } else {
            this.CREATED = true;
            this.render();
            Promise.resolve().then(() => this.#created()).then(() => this.#attached());
        }
    }

}

export default Component;
