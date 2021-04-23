import Code from '../../modules/code.js';
import Color from '../../modules/color.js';

const { Component } = Oxe;

export default class BindersRoute extends Component {

    title = 'Binders';

    data = {

        // text
        text: 'Hello World',

        // checkbox
        check: 'checked',
        checked: false,
        checkResult: checked => checked ? 'checked' : '',
        checkInput () { console.log(this.data.checked); },

        // style
        color: Color(),
        styleChange: () => this.data.color = Color(),

        // class
        active: true,
        lightblue: active => active ? 'lightblue' : '',
        classToggle: () => this.data.active = !this.data.active,

        value: {
            text: 'hello world',
            upper (text) { this.data.value.text = text.toUpperCase(); },
        }

    };

    css = /*css*/`
        .default {
            border: solid 5px transparent;
        }
        .lightblue {
            border-color: lightblue;
        }
    `;

    // <input value="{{checked}}" {{check}} type="checkbox" oninput="{{checkInput}}"></input>
    html = /*html*/ `

        <section id="text">
            <h3>Text Binder</h3>
            <pre>{{text}}</pre>
            <pre>${Code(`{{text}}`, true)}</pre>
        </section>

        <section id="checked">
            <h3>Checked Binder</h3>
            <br>
            <pre>${Code(`value="{{checked}}" checked="{{checked}}"`, true)}</pre>
            <pre>value="{{checked}}" {{checkResult(checked)}}</pre>
            <br>
            <input value="{{checked}}" checked="{{checked}}" type="checkbox" oninput="{{checkInput}}">
            <i>checked boolean value and checked attribute</i>
        </section>

        <section id="style">
            <h2>Style Binder</h2>
            <br>
            <pre style="color: {{color}}">${Code(`style="color: {{color}}"`, true)}</pre>
            <pre style="color: {{color}}">style="color: {{color}}"</pre>
            <br>
            <button onclick="{{styleChange()}}">Change Color</button>
        </section>

        <section id="class">
            <h3>Class Binder</h3>
            <br>
            <pre class="default {{lightblue(active)}}">${Code(`class="default {{lightblue(active)}}"`, true)}</pre>
            <pre class="default {{lightblue(active)}}">class="default {{lightblue(active)}}"</pre>
            <br>
            <button onclick="{{classToggle()}}">Toggle Active</button>
        </section>

        <section id="value">
            <h3>Value Binder</h3>
            <br>
            <pre style="white-space: pre-line;">${Code(`
                <div>{{value.text}}</div>
                <input value="{{value.text}}" type="text" oninput="{{value.upper(value.text)}}">
            `, true)}</pre>
            <br>
            <div>{{value.text}}</div>
            <br>
            <input value="{{value.text}}" type="text" oninput="{{value.upper(value.text)}}">
        </section>

    `;

};