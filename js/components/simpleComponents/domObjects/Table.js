'use strict'
class Table extends SimpleHtmlObject {
	#headers = [];#rows;
	#mayHaveChild = ['TR', 'TD', 'THEAD', 'TBODY'];
	constructor( object ) {
		super( object, 'TABLE' );
	};

	// события
	// если изменилось значение поля
	#OnChangeData () {
		let dom = this.DomObject;
		dom.addEventListener( 'change', (event) => {
			console.log("event=>", event);
		} );
	}

	// ПУБЛИЧНЫЕ МЕТОДЫ

}