'use strict'
class Th extends SimpleHtmlObject {
	#text;
	constructor( object ) {
		// console.log("ссоздан li");
		super( object, 'TH' );
	};

	get Text () { return this.#text; };

	// события
	// если изменилось значение поля
	#OnChangeData () {
		let dom = this.DomObject;
		dom.addEventListener( 'change', ( event ) => {
			console.log("event=>", event);
		} );
	}
	AddWatch ( func ) { func ( this ); return this; };

	// ПУБЛИЧНЫЕ МЕТОДЫ
	Text ( text ) {
		this.#text = text;
		let dom = this.DomObject;
		dom.innerHTML = text;
		return this;
	};
}