'use strict'
class Select extends SimpleHtmlObject {
	#value;
	#mayHaveChild = ['OPTION'];
	constructor( object ) {
		super( object, 'SELECT' );
		this.#OnChangeData();
	};
	get Value () { return this.#value; };

	set Value ( value ) {
		let childs = this.Childs;
		for ( let i = 0; i < childs.length; i++ ) {
			if ( childs[i].Value == value ) {
				this.#value = childs[i].Value;
				this.DomObject.value = value;
				break;
			}
		}
	};

	get MayHaveChild () { return this.#mayHaveChild; };

	// события
	// если изменилось значение поля
	#OnChangeData () {
		this.DomObject.addEventListener( 'change', event => this.#value = event.target.value );
	}
}