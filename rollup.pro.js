import typescript from '@rollup/plugin-typescript';
import { readFileSync } from 'fs';

const pkg = readFileSync('./package.json');

const { name, version, license, author, email } = JSON.parse(pkg);

const banner = `
/*!
    Name: ${name}
    Version: ${version}
    License: ${license}
    Author: ${author}
    Email: ${email}
    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
`;

export default [
    {
        input: 'src/element/element.ts',
        output: {
            banner,
            name: 'XElement',
            file: 'pro/x-element.js',
            format: 'esm',
            indent: '\t',
        },
        plugins: [
            typescript({
                sourceMap: false,
                declaration: false,
                removeComments: true,
                target: 'es2016',
            }),
        ]
    },
    {
        input: 'src/router/router.ts',
        output: {
            banner,
            name: 'XRouter',
            file: 'pro/x-router.js',
            format: 'esm',
            indent: '\t',
        },
        plugins: [
            typescript({
                sourceMap: false,
                declaration: false,
                removeComments: true,
                target: 'es2016',
            }),
        ]
    }
];