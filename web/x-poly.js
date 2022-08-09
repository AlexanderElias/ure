
if ('shadowRoot' in HTMLTemplateElement.prototype === false) {
    (function attachShadowRoots (root) {
        const templates = root.querySelectorAll('template[shadowroot]');
        for (const template of templates) {
            const mode = (template.getAttribute('shadowroot') || 'closed');
            const shadowRoot = (template.parentNode).attachShadow({ mode });
            shadowRoot.appendChild(template.content);
            template.remove();
            attachShadowRoots(shadowRoot);
        }
    })(document);
}

if ('navigation' in window === false) {
    // requires the following import map
    //<script type="importmap">{"imports":{"abort-controller":"https://cdn.skypack.dev/abort-controller","uuid":"https://cdn.skypack.dev/uuid"}}</script>
    window.navigation = new (await import('https://cdn.skypack.dev/@virtualstate/navigation')).Navigation;
}