'use strict'
class Tr extends SimpleHtmlObject {
	#shadowCopy = {};
	constructor( object ) {
		// console.log("ссоздан li");
		super( object, 'TR' );
	};
	get ShadowCopy() { return this.#shadowCopy; };

	// события
	// если изменилось значение поля
	#OnChangeData () {
		let dom = this.DomObject;
		dom.addEventListener( 'change', ( event ) => {
			console.log("event=>", event);
		} );
	}
	// AddWatch ( func ) { func ( this ); return this; };

	// ПУБЛИЧНЫЕ МЕТОДЫ
	AddShadowCopy( key, value ) {
		this.#shadowCopy[ key ] = value;
	}
}