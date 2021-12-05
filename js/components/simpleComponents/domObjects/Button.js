'use strict'
class Button extends SimpleHtmlObject {
	#text;
	constructor( object ) {
		// console.log("ссоздан button");
		super( object, 'BUTTON' );
	};
	get Text () { return this.#text; };

	// события
	// если изменилось значение поля
	#OnChangeData () {
		let dom = this.DomObject;
		dom.addEventListener( 'change', (event) => {
			console.log("event=>", event);
		} );
	}

	// ПУБЛИЧНЫЕ МЕТОДЫ
	Text ( text ) {
		this.#text = text;
		let dom = this.DomObject;
		dom.innerHTML = text;
		return this;
	};
	AddWatch ( func ) { func ( this ); return this; };
}