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
	#selectedColor = '#ffc107';#defaultColor = '#fff';
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
		// this.#application.AddComplexElement( this );
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
	Value ( value ) {
		try {
			let item = this.#data.find( (item)=> item.uid == value );
			if ( typeof item !== 'undefined' ) {
				this.#data.map( block=> block.container.DomObject.style.background = this.#defaultColor );
				// console.log( "значение найдено, установим ", item );
				this.#value = item.uid;
				this.#text = item.title;
				this.#selected.Text( this.#text );
				item.container.DomObject.style.background = this.#selectedColor;
			}
		} catch ( e ) { console.log("ошибка ", e); }
	}

	// ПРИВАТНЫЕ МЕТОДЫ
	#Init () {
		this.#hash = this.#application.Toolbox.GenerateHash;
		this.#comboBox = new Div().SetAttributes( {class: 'simple-combo simple-combo-close'} ).AddWatch( sho => {
			sho.DomObject.addEventListener( 'click', event => {
				if (event.target == this.#selected.DomObject || event.target == this.#comboBox.DomObject ) {
					if ( this.#open ) this.Close();
					else this.Open();
				}
			} );
		} );
		this.#selected = new Div( {parent: this.#comboBox} ).SetAttributes( {class: 'simple-combo-selected'} ).Text( 'Выберите значение...' )
		this.#list = new Div( {parent: this.#comboBox} ).SetAttributes( {class: 'simple-combo-options simple-combo-dnone'} );
		// console.log("для разбора ", this.#data);
		for ( let i = 0; i < this.#data.length; i++) this.#AddOption( this.#data[i] );
		// console.log( "this.#data=> ", this.#data );
		// this.#application.AddItemWatch( {hash: this.#hash, element: this} );
	}
	#AddOption ( option ) {
		let optionContainer = new Div( {parent: this.#list} ).SetAttributes( {value: option.uid} ).Text( option.title ).AddWatch( sho => {
			sho.DomObject.addEventListener( 'click', event => {
				this.#data.map( block=> block.container.DomObject.style.background = this.#defaultColor );
				this.#value = option.uid;
				this.#text = option.title;
				this.#selected.Text( this.#text );
				// if ( typeof this.#watcher !== 'undefined' ) this.#watcher( this );
				optionContainer.DomObject.style.background = this.#selectedColor;
				this.Close();
			})
		} );
		option.container = optionContainer;
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
		// newChilds.map( () => {

		// } );
		// console.log( this.#data );
		return this;
	};
	Close () {
		// console.log("требование закрыть ", this.#open);
		if ( this.#open ) {
			// console.log("зашли для закрытия");
			this.#open = !this.#open;

			this.#comboBox.DomObject.classList.remove( 'simple-combo-open' );
			this.#comboBox.DomObject.classList.add( 'simple-combo-close' );

			this.#list.DomObject.classList.remove( 'simple-combo-dblock' );
			this.#list.DomObject.classList.add( 'simple-combo-dnone' );


		}
	};
	Open () {
		if ( !this.#open ) {
			// console.log("зашли для открытия");
			this.#open = !this.#open;

			this.#comboBox.DomObject.classList.remove( 'simple-combo-close' );
			this.#comboBox.DomObject.classList.add( 'simple-combo-open' );

			this.#list.DomObject.classList.remove( 'simple-combo-dnone' );
			this.#list.DomObject.classList.add( 'simple-combo-dblock' );
		}
	};
	// AddWatcher ( watcher ) {
	// 	this.#watcher = watcher;
	// 	return this;
	// }
}
