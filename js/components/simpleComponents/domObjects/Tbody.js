'use strict'
class Tbody extends SimpleHtmlObject {
	constructor( object ) {
		// console.log("ссоздан li");
		super( object, 'TBODY' );
	};

	// события
	// если изменилось значение поля
	#OnChangeData () {
		let dom = this.DomObject;
		dom.addEventListener( 'change', (event) => {
			console.log("event=>", event);
		} );
	}
	AddWatch ( func ) { func ( this ); return this; };

	// ПУБЛИЧНЫЕ МЕТОДЫ
}