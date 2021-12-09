'use strict'
class ComboBox {
	#data = [];#parent;#attributes = {};#application;
	#comboBox;
	#list;#selected;
	#arrow;
	#value;#text;#hash;
	#open = false;
	#type='cho';// complex html object
	#typeCho = 'comboBox';
	#watcher;
	// constructor(data, parent) {
	constructor( application, params ) {
		if ( typeof params !== 'undefined' ) {
			if ( typeof params.data !== 'undefined' ) this.#data = params.data;
			if ( typeof params.parent !== 'undefined' ) this.#parent = params.parent;
		}
		this.#application = application;
		this.#Init();
		if (typeof params === 'undefined') {
			return this;
		}
		this.#application.AddComplexElement( this );
	}
	// ГЕТТЕРЫ
	get Value () {

	}
	// получение dom обекта
	get DomObject () { return this.#comboBox.DomObject; };
	get DomEvents () { return this.#selected.DomObject; };
	get ObjectType () { return this.#type; };
	get Hash () { return this.#hash; };
	get Type () { return this.#type; };
	get ComplexType () { return this.#typeCho; };
	get Value () { return this.#value; };
	get Text () { return this.#text; };
	get Hash () { return this.#hash; };
	// СЕТТЕРЫ
	set Value ( value ) {
		try {
			let item = this.#data.find( (item)=> item.value == value );
			if ( typeof item !== 'undefined' ) {
				this.#value = item.value;
				this.#text = item.text;
				this.#selected.Text( this.#text );
			}
		} catch ( e ) {  }
	}

	// ПРИВАТНЫЕ МЕТОДЫ
	#Init () {
		this.#hash = this.#application.Toolbox.GenerateHash;
		this.#comboBox = new Div().SetAttributes( {class: 'simple-combo simple-combo-close'} ).AddWatch( ( el ) => {
			el.DomObject.addEventListener( 'click', (event) => {
				// console.log( 'event.target ,=> ', event.target , '  this.#comboBox.DomObject=>',  this.#comboBox.DomObject);
				if (event.target == this.#selected.DomObject || event.target == this.#comboBox.DomObject ) {
					if ( this.#open ) this.CloseCombo();
					else this.OpenCombo();
				}
			} );
		} );
		this.#selected = new Div( {parent: this.#comboBox} ).SetAttributes( {class: 'simple-combo-selected'} ).Text( 'Выберите значение...' )
		this.#list = new Div( {parent: this.#comboBox} ).SetAttributes( {class: 'simple-combo-options simple-combo-dnone'} );
		for ( let i = 0; i < this.#data.length; i++) {
			this.#AddOption( this.#data[i] );
		}
		this.#application.AddItemWatch( {hash: this.#hash, element: this} );
	}
	#AddOption ( option ) {
		new Div( {parent: this.#list} ).SetAttributes( {value: option.value} ).Text( option.text ).AddWatch( ( el ) => {
			el.DomObject.addEventListener( 'click', (event) => {
				this.#value = option.value;
				this.#text = option.text;
				this.#selected.Text( this.#text );
				if ( typeof this.#watcher !== 'undefined' ) this.#watcher( this );
				this.CloseCombo();
			})
		} );
	}
	// ПУБЛИЧНЫЕ МЕТОДЫ

	InitParent ( parent ) {
		if ( this.#parent == null ) {
			this.#parent = parent;
			this.#parent.AddChild( this );
			let dom = this.#parent.DomObject;
			dom.append( this.#comboBox.DomObject );
		}
	};
	SetAttributes ( attributes ) {
		for ( let key in attributes ) {
			this.#attributes[ key ] = attributes[ key ];
			this.#comboBox.DomElement.setAttribute( key, attributes[ key ] );
		}
		return this;
	};
	AddChilds ( newChilds ) {
		this.#data = this.#data.concat( newChilds );
		newChilds.map( () => {

		} );
		console.log( this.#data );
		return this;
	};
	CloseCombo () {
		if ( this.#open ) {
			this.#open = false;

			this.#comboBox.DomObject.classList.remove( 'simple-combo-open' );
			this.#comboBox.DomObject.classList.toggle( 'simple-combo-close' );

			this.#list.DomObject.classList.remove( 'simple-combo-dblock' );
			this.#list.DomObject.classList.toggle( 'simple-combo-dnone' );
		}
	};
	OpenCombo () {
		if ( !this.#open ) {
			this.#open = true;

			this.#comboBox.DomObject.classList.remove( 'simple-combo-close' );
			this.#comboBox.DomObject.classList.toggle( 'simple-combo-open' );

			this.#list.DomObject.classList.remove( 'simple-combo-dnone' );
			this.#list.DomObject.classList.toggle( 'simple-combo-dblock' );
		}
	};
	AddWatcher ( watcher ) {
		this.#watcher = watcher;
		return this;
	}
}
