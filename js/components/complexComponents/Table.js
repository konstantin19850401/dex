'use strict'
class Table {
	#application;#hash;
	#container;#parent;
	#type='cho';// complex html object
	#typeCho = 'table';
	#watcher;
	constructor( application ) {
		console.log('создание table');
		this.#application = application;
		this.#InitTable();
		this.#hash = this.#application.Toolbox.GenerateHash;
	}
	// ГЕТТЕРЫ
	get DomObject () { return this.#container.DomObject; };
	get ObjectType () { return this.#type; };
	get ComplexType () { return this.#typeCho; };

	// СЕТТЕРЫ

	// ПРИВАТНЫЕ МЕТОДЫ
	#InitTable () {
		console.log( 'this.#parent=> ', this.#parent );
		this.#container = new Div( {parent: this.#parent} ).SetAttributes( {class: 'dex-table-container'} ).AddChilds([

		]);
	}
	// ПУБЛИЧНЫЕ МЕТОДЫ
	InitParent ( parent ) {
		if ( this.#parent == null ) {
			this.#parent = parent;
			this.#parent.AddChild( this );
			let dom = this.#parent.DomObject;
			dom.append( this.DomObject );
		}
	};
	AddWatcher ( watcher ) {
		this.#watcher = watcher;
		return this;
	}
}
