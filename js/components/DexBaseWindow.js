"use strict"
class DexBaseWindow {
	#parent;#container;#application;#hash;
	constructor (application, parent, data) {
		this.#application = application;
		this.#parent = parent;
		this.#hash = this.#application.Toolbox.GenerateHash;
		this.#application.InsertHashInHashes( this.#hash, this );
	}
	// ГЕТТЕРЫ
	get Container () {
		return this.#container;
	}
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
	set Container ( shoObject ) {
		this.#container = shoObject;
	}
	DeleteObject() {
		let childs = this.#parent.Childs;
		for (let i = 0; i < childs.length; i++) {
			if ( childs[i].Hash == this.#hash ) {
				childs.splice(i, 1);
				break;
			}
		}
		this.#container.DeleteObject();
	};
	Hide() {
		this.#container.AddClass('d-none');
	};
	Show() {
		this.#container.RemoveClass('d-none');
	};
}

