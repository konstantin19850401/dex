'use strict'
class H2 extends SimpleHtmlObject {
	#text;
	constructor( object ) {
		// console.log("ссоздан див");
		super( object, 'H2' );
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
}