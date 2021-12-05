'use strict'
class Thead extends SimpleHtmlObject {
	#text;
	#data;
	constructor( object ) {
		// console.log("ссоздан li");
		super( object, 'THEAD' );
	};

	get Headers () { return this.#data; };
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
}