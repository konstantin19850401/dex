'use strict'
class Page {
	#application;
	#components = [];
	#hash;#container;
	constructor( application, components ) {
		this.#application = application;
		this.#application.CurrentPage = this;
		this.#hash = this.#application.Toolbox.GenerateHash;
		this.PrependPage();
		if ( typeof components !== 'undefined' ) this.#InitComponents( components );
		this.#container = new Div( {parent: this.#application.Container.DomObject } );
		this.#application.InsertHashInHashes( this.#hash, this );
		// console.log("страница создана");
	}
	// ГЕТТЕРЫ
	get Hash () { return this.#hash; };
	get Application () { return this.#application; };
	get Container () { return this.#container; }
	get Components () { return this.#components; };
	// СЕТТЕРЫ

	// ПУБЛИЧНЫЕ МЕТОДЫ
	RemovePage () {
		this.Container.DeleteObject();
		this.#application.DeleteHash( this.#hash );
		this.#RemoveComponents();
	}
	// ПРИВАТНЫЕ МЕТОДЫ
	PrependPage () {
		this.#application.Container.RemoveChilds();
	}
	#InitComponents ( components ) {
		if ( typeof components !== 'undefined' ) {
			components.map( ( item ) => { this.#components.push(
				new this.#application.Components[item.component]( this.#application, this ) ) } )
		}
	}
	AddComponent ( cmpt ) {
		this.#components.push( new this.#application.Components[cmpt.component]( this.#application, this ) );
	}
	#RemoveComponents () {
		try {
			for ( let i = 0; i < this.#components.length; i++ ) {
				this.#components[i].DeleteComponent();
			}
			this.#components.length = 0;
		} catch (e) { console.log(e)}
	}
}

