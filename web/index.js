import { router } from './x-element.js';

// import * as security from './security.js';
// import * as guide from './guide.js';
// import * as root from './root.js';
// import * as all from './all.js';

const main = document.querySelector('main');

router('/', main, () => import('./root.js'));
router('/guide', main, () => import('./guide.js'));
router('/guide/', main, () => import('./guide.js'));
router('/security', main, () => import('./security.js'));
router('/security/', main, () => import('./security.js'));
router('/*', main, () => import('./all.js'));

// navigation.addEventListener('navigate', (event) => {

//     const handler = async () => {
//         const pathname = new URL(event?.destination.url ?? location.href).pathname;
//         let filename;

//         switch (pathname) {
//             case '/':
//                 filename = './root.js';
//                 break;
//             case '/guide':
//             case '/guide/':
//                 filename = './guide.js';
//                 break;
//             case '/security':
//             case '/security/':
//                 filename = './security.js';
//                 break;
//             default:
//                 filename = './all.js';
//         }

//         const module = (await import(filename)).default;

//         main.replaceChildren(await module.create())
//     };

//     if (event?.canIntercept) {
//         return event.intercept({ handler });
//     }

// });

location.replace(location.href);
