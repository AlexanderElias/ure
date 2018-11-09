
export default function (binder) {
	return {
		write () {
			var element;

			while (element = binder.element.lastElementChild) {
				binder.element.removeChild(element);
			}
		}
	};
};
