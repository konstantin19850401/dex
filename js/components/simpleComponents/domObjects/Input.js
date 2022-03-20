'use strict'
class Input extends SimpleHtmlObject {
	#value;
	constructor( object ) {
		super( object, 'INPUT' );
		this.#OnChangeData();
	};
	get Value () { return typeof this.#value != 'undefined' ? this.#value : ''; };




	// события
	// если изменилось значение поля
	#OnChangeData () {
		let that = this;
		let dom = this.DomObject;
		dom.addEventListener( 'change', (event) => {
			that.#value = event.target.value;
		} );
	}

	// AddWatch ( func ) { func ( this ); return this; };
	set Value ( value ) {
		this.#value = value;
		let dom = this.DomObject;
		dom.value = value;
		return this;
	};
}