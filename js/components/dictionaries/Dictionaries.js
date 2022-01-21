'use strict'
class Dictionaries {
	#parent;#container;#application;#hash;
	constructor ( application, parent) {
		this.#application = application;
		this.#parent = parent;
		this.#hash = this.#application.Toolbox.GenerateHash;
		this.#application.InsertHashInHashes( this.#hash, this );
	}
	// ГЕТТЕРЫ
	get DomObject () {
		return this.Container.DomObject;
	}
	get Application () {
		return this.#application;
	}
	get Parent () {
		return this.#parent;
	}
	get Hash () {
		return this.#hash;
	}
	// СЕТТЕРЫ
	set Parent ( parent ) { this.#parent = parent; };

	// Приватные методы

	// публичные методы
	Container ( shoObject ) {
		this.#container = shoObject;
	}
	InitParent ( parent ) {
		// console.log( 'init parent ComplexTable ',  this.Parent );
		if (typeof this.#parent === 'undefined' ) {
			this.#parent = parent;
			this.#parent.AddChild( this );
			// console.log( 'this.parent===> ', this.Container.DomObject );
			let dom = this.#parent.DomObject;
			dom.append( this.Container.DomObject );
		}
	};
	DeleteObject() {
		let childs = this.#parent.Childs;
		for (let i = 0; i < childs.length; i++) {
			if ( childs[i].Hash == this.#hash ) {
				childs.splice(i, 1);
				break;
			}
		}
		this.#container.DeleteObject();
	}
	
}

