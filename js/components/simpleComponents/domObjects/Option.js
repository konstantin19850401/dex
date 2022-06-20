'use strict'
class Option extends SimpleHtmlObject {
	#value;#textContent;
	#mayHaveChild = [];
	constructor( object ) {
		super( object, 'OPTION' );
	};
	get Value () { return this.DomObject.value; };
	get Text () { return this.#textContent; };


	Value ( value ) {
		this.DomObject.value = value;
		this.#value = value;
		return this;
	};
	Text ( value ) {
		this.DomObject.textContent = value;
		this.#textContent = value;
		return this;
	}


	get MayHaveChild () { return this.#mayHaveChild; };
}