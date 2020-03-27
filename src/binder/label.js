
export default function (binder) {
    let data;
    return {
        read () {
            data = binder.data;

            if (data === undefined || data === null) {
                data = '';
            } else if (typeof data === 'object') {
                data = JSON.stringify(data);
            } else if (typeof data !== 'string') {
                data = data.toString();
            }

            if (data === binder.target.getAttribute('label')) {
                this.write = false;
                return;
            }

        },
        write () {
            binder.target.setAttribute('label', data);
        }
    };
}
