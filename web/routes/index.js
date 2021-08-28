import Code from '../modules/code.js';
import Say from '../modules/say.js';

const { Component } = Oxe;

var indexRoute = Code(`
    const { Component } = Oxe;

	export default Index extends Component {
		title = 'Index Route'
        description = 'Index Description'
		html = \`
			<h1>{{title}}</h1>
			<button onclick="{{greet()}}">Greet</button>
		\`
		data = {
			greeting: '',
			greet () { this.greeting = 'Hola Mundo'; }
		}
		async connected () {
			this.data.greeting = 'Hello World';
		}
	}
`, true);

var indexJs = Code(`
	Oxe.router.setup({
		target: 'main',
		folder: 'routes'
	});
`);

var indexHtml = Code(`
	<html>
	<head>
		<script src="/oxe.min.js" defer></script>
		<script src="/index.js" defer></script>
	</head>
	<body>
		<main></main>
	</body>
	</html>
`);

export default class IndexRoute extends Component {

    async connected () { Say('index connected'); }

    title = 'Oxe';
    description = 'A mighty tiny web components framework/library.';

    html = /*html*/`
	<h2>Overview</h2>

	<strong>Synopsis</strong>
	<p>A mighty tiny web components framework that should feel like your using native JS and HTML to write and bind Custom Elements.</p>

	<strong>Project Goal</strong>
	<ul>
		<li>Easy learning curve</li>
		<li>Feels like JS and HTML not a framework</li>
	</ul>

	<strong>Feature Highlight</strong>
	<ul>
		<li>Zero config smart front end routing</li>
		<li>Dynamic ES6/ESM module rewrites (Use ES6 modules in browsers that don't have native support)</li>
		<li>Dynamic Template string rewrites (Use template strings in browsers that don't have native support)</li>
	</ul>

	<strong>Browser Support</strong>
	<ul>
		<li>IE11</li>
		<li>Chrome</li>
		<li>Firefox</li>
		<li>Safari 7</li>
		<li>Mobile Safari</li>
		<li>Chrome Android</li>
	</ul>

	<strong>Polyfill</strong>
	<ul>
		<li>
			<p>
				<a href="https://github.com/vokeio/oxe/blob/master/dst/poly.min.js">poly.min.js</a> includes everything you need except shadow poly code.
			</p>
			<ul>
				<li>customElements</li>
				<li>DocumentFragment</li>
				<li>URL, Promise, fetch</li>
				<li>HTMLTemplateElement</li>
				<li>Event, CustomEvent, MouseEvent constructors and Object.assign, Array.from</li>
			</ul>
		</li>
		<li>
			<p>
				<a href="https://github.com/vokeio/oxe/blob/master/dst/poly.shadow.min.js">poly.shadow.min.js</a> includes everything.
			</p>
			<ul>
				<li>Webcomponentsjs</li>
				<li>DocumentFragment</li>
				<li>URL, Promise, fetch</li>
			</ul>
		</li>
	</ul>

	<strong>Install</strong>
	<ul>
		<li><i>npm install oxe --save</i></li>
		<li>UMD <i>"dst/oxe.min.js"</i></li>
	</ul>

	<h2>Example</h2>
	<pre>${indexRoute}</pre>
    <br>
	<pre>${indexJs}</pre>
    <br>
	<pre>${indexHtml}</pre>
	`;

}
