'use strict'
class Application {
	#ajax;#errs = [];
	#currentPage;#container;#toolbox;#alertMessages;#gorizontalMenu;
	#hashes = {};
	#components = {};
	#watcher = [];
	#complexElements = [];
	constructor(object) {
		if ( typeof object.ajax !== 'undefined' ) {
			this.#ajax = new Ajax(object.ajax, this);
			if ( this.#ajax.Status == 0 ) {
				console.log( 'Объект ajax не был корректно создан. Ниже представлен список ошибок: ' );
				this.#ajax.Erros.map( ( item ) => {
					console.log( `===> ${ item }` );
				});
			}
		}
		else console.log( 'Не указаны параметры ajax' );

		if ( typeof object.toolbox !== 'undefined' ) this.#toolbox = object.toolbox;
		// if ( typeof object.components.alertMessages !== 'undefined' ) this.#alertMessages = object.components.alertMessages;
		// if ( typeof object.components.gorizontalMenu !== 'undefined' ) this.#gorizontalMenu = object.components.gorizontalMenu;
		for ( let key in object.components) this.#components[key] = object.components[key];

		if ( this.#errs.length == 0 ) {
			this.#container = new Div( {parent: document.body} );
			this.#container.SetAttributes( {class: 'w-100 h-100 d-flex justify-content-center'} );
			// this.#currentPage = new Login( this );
			new Login( this );
		}
		this.#BodyWatcher();
	}
	// ГЕТТЕРЫ
	get Transport () { return this.#ajax; };
	// get AlertMessages () { return this.#alertMessages; };
	// get GorizontalMenu () { return this.#gorizontalMenu; };
	get Toolbox () { return this.#toolbox; };
	get Hashes () { return this.#hashes; };
	get Container () { return this.#container; };
	get CurrentPage () { return this.#currentPage; };
	get Components () { return this.#components; };
	get Watcher () { return this.#watcher; };
	get ComplexElements () { return this.#complexElements; };

	// СЕТТЕРЫ
	set CurrentPage ( page ) { if ( page ) this.#currentPage = page }

	// ПРИВАТНЫЕ МЕТОДЫ
	#BodyWatcher() {
		document.body.addEventListener( 'click', ( event ) => {
			this.#complexElements.map( ( item )=> {
				if ( (item.element.ComplexType == 'comboBox' && event.target != item.element.DomEvents) && (item.element.ComplexType == 'comboBox' && event.target != item.element.DomObject)) {
					item.element.CloseCombo();
				} else {
					item.element.Close();
				}
			} );
		} );
		window.getSelection().removeAllRanges();
	}

	// ПУБЛИЧНЫЕ МЕТОДЫ
	InsertHashInHashes ( hash, element ) { this.#hashes[hash] = element; };
	DeleteHash ( hash ) { delete this.#hashes[ hash ]; };
	DeleteAllHash () { this.#hashes = []; };

	AddComplexElement ( complexElement ) {
		// console.log( "complexElement.ComplexType=> ", complexElement );
		let find = this.#complexElements.find( (item)=> item.Hash == complexElement.Hash );
		if ( typeof find === 'undefined' ) {
			this.#complexElements.push( { hash: complexElement.Hash, element: complexElement } );
		}
	}
	AddItemWatch ( item ) {
		this.#watcher.push( {hash: item.hash, element: item.element} );
	}

}

