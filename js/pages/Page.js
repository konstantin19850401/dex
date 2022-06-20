'use strict'
class Page {
	#application;#hash;
	#container;#transport;
	constructor( application ) {
		this.#application = application;
		this.#hash = application.Toolbox.GenerateHash;
		this.#transport = application.Transport;
		this.#application.InsertHashInHashes( this.#hash, this );
		this.#Initialization();
	}
	#Initialization() {
		if (typeof this.Application.Container !== "undefined") this.Application.Container.RemoveChilds();
		this.#container = new Div({parent: this.#application.Container}).SetAttributes({class: "wrapper"});
	}
	// ГЕТТЕРЫ
	get Hash () { return this.#hash; };
	get Application () { return this.#application; };
	get Container () { return this.#container; }
	get Transport() {return this.#transport;}
	// СЕТТЕРЫ

	// ПУБЛИЧНЫЕ МЕТОДЫ
	RemovePage () {
		this.Container.DeleteObject();
		this.#application.DeleteHash( this.#hash );
		//this.#RemoveComponents();
	}

}

