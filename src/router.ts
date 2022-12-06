import { Connect, Connected, Upgrade, Upgraded } from './cycle.ts';
import Component from './component.ts';
import Schedule from './schedule.ts';
import Context from './context.ts';
import Virtual from './virtual.ts';
import Patch from './patch.ts';
import Dash from './dash.ts';

type Route = {
    path?: string;
    cache?: boolean;

    context?: any;
    instance?: any;
    component?: any;
    construct?: any;

    name?: string;
    target?: Element;
};

const alls: Array<Route> = [];
const routes: Array<Route> = [];

const transition = async function (route: Route) {
    if (!route.target) throw new Error('XElement - transition target option required');

    // const current = Reflect.get(route.target, 'xRouterCurrent');
    // if (current) current.instance.childNodes = Array.from(current.target.childNodes);

    if (route.cache && route.instance) {
        try {
            await Connect(route.target, route.instance.context);

            if (route.instance instanceof Component) {
                route.target.replaceChildren(route.instance);
            } else {
                await route.instance.change();
            }

            try {
                await Connected(route.target, route.instance.context);
            } catch (error) {
                console.error(error);
            }
        } catch (error) {
            console.error(error);
        }
    } else {
        if (route.component instanceof Component) {
            try {
                await Connect(route.target, route.instance.context);

                route.name = route.name ?? Dash(route.construct.name);

                if (!/^\w+-\w+/.test(route.name)) route.name = `x-${route.name}`;

                if (!customElements.get(route.name)) customElements.define(route.name, route.construct);
                await customElements.whenDefined(route.name);

                route.instance = document.createElement(route.name);
                route.target.replaceChildren(route.instance);

                try {
                    await Connected(route.target, route.instance.context);
                } catch (error) {
                    console.error(error);
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            const update = async function () {
                await Upgrade(route.target as Element, route.instance.context);
                Patch(route.target as Element, route.component(Virtual, context));
                await Upgraded(route.target as Element, route.instance.context);
            };

            const change = async function () {
                await Schedule(update, route.target as Element);
            };

            const context = Context(route.context(), change);

            route.instance = { context, change };

            try {
                await Connect(route.target, route.instance.context);

                await change();

                try {
                    await Connected(route.target, route.instance.context);
                } catch (error) {
                    console.error(error);
                }
            } catch (error) {
                console.error(error);
            }
        }
    }

    // Reflect.set(route.target, 'xRouterBusy', false);
    // Reflect.set(route.target, 'xRouterCurrent', route);
};

const navigate = function (event?: any) {
    if (event && 'canIntercept' in event && event.canIntercept === false) return;
    if (event && 'canTransition' in event && event.canTransition === false) return;

    const destination = new URL(event?.destination.url ?? location.href);
    const base = new URL(document.querySelector('base')?.href ?? location.origin);

    base.hash = '';
    base.search = '';
    destination.hash = '';
    destination.search = '';

    const pathname = destination.href.replace(base.href, '/');
    const transitions: Array<Route> = [];

    for (const route of routes) {
        if (route.path !== pathname) continue;
        if (!route.target) continue;

        // const current = Reflect.get(route.target, 'xRouterCurrent');
        // if (current === route) continue;

        // const busy = Reflect.get(route.target, 'xRouterBusy');
        // if (busy) continue;

        // if (Reflect.get(route.target, 'xRouterPath') === route.path) continue;

        // const current = Reflect.get(route.target, 'xRouterCurrent');
        // if (current) current.instance.childNodes = Array.from(current.target.childNodes);

        // Reflect.set(route.target, 'xRouterBusy', true);
        Reflect.set(route.target, 'xRouterPath', route.path);
        transitions.push(route);
    }

    for (const all of alls) {
        if (!all.target) continue;
        let has = false;

        for (const transition of transitions) {
            if (transition.target === all.target) {
                has = true;
                break;
            }
        }

        if (has) continue;
        if (Reflect.get(all.target, 'xRouterPath') === pathname) continue;
        // if (all.target && Reflect.get(all.target, 'xRouterBusy')) continue;
        // if (all.target) Reflect.set(all.target, 'xRouterBusy', true);

        transitions.push(all);
    }

    // if (!transitions.length) return;

    if (event?.intercept) {
        return event.intercept({ handler: () => transitions.map((route) => transition(route)) });
    } else if (event?.transitionWhile) {
        return event.transitionWhile(transitions.map((route) => transition(route)));
    } else {
        transitions.map((route) => transition(route));
    }
};

export default function router(path: string, target: Element, component: any, context?: any, cache?: boolean) {
    if (!path) throw new Error('XElement - router path required');
    if (!target) throw new Error('XElement - router target required');
    if (!component) throw new Error('XElement - router component required');
    if (!(component instanceof Component) && !context) throw new Error('XElement - router context required');

    if (path === '/*') {
        for (const all of alls) {
            if (all.path === path && all.target === target) {
                throw new Error('XElement - router duplicate path and target');
            }
        }

        alls.push({ path, target, context, component, cache: cache ?? true });
    } else {
        for (const route of routes) {
            if (route.path === path && route.target === target) {
                throw new Error('XElement - router duplicate path and target');
            }
        }

        routes.push({ path, target, context, component, cache: cache ?? true });
    }

    Reflect.get(window, 'navigation').addEventListener('navigate', navigate);
}
