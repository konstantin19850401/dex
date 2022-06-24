'use strict'
class Application {
	#ajax;#kladr;#errs = [];
	#currentPage;#container;#toolbox;#alertMessages;#gorizontalMenu;
	#hashes = {};
	#components = {};
	#watcher = [];
	#complexElements = [];
	#taskBar;
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
			//this.#container.SetAttributes( {class: 'w-100 h-100 d-flex justify-content-center'} );
			// this.#currentPage = new Login( this );
			new Login( this );
		}
		this.#BodyWatcher();
	}
	// ГЕТТЕРЫ
	get Transport () { return this.#ajax; };
	get Kladr() {return this.#kladr; }
	// get AlertMessages () { return this.#alertMessages; };
	// get GorizontalMenu () { return this.#gorizontalMenu; };
	get Toolbox () { return this.#toolbox; };
	get Hashes () { return this.#hashes; };
	get Container () { return this.#container; };
	get CurrentPage () { return this.#currentPage; };
	get Components () { return this.#components; };
	get Watcher () { return this.#watcher; };
	get ComplexElements () { return this.#complexElements; };
	get TaskBar() {return this.#taskBar; }

	// СЕТТЕРЫ
	set CurrentPage ( page ) { if ( page ) this.#currentPage = page }
	set TaskBar(taskBar) {this.#taskBar = taskBar; }

	// ПРИВАТНЫЕ МЕТОДЫ
	#BodyWatcher() {
		document.body.addEventListener( 'click', event => {
			// this.#complexElements.map( ( item )=> {
			// 	if ( (item.element.ComplexType == 'comboBox' && event.target != item.element.DomEvents) && (item.element.ComplexType == 'comboBox' && event.target != item.element.DomObject)) {
			// 		item.element.Close();
			// 	} else {
			// 		item.element.Close();
			// 	}
			// } );

			if (!event.target.matches('.dropbtn')) {
				let dropdowns = document.getElementsByClassName("dropdown-content");
				for (let i = 0; i < dropdowns.length; i++) {
					let openDropdown = dropdowns[i];
					if (openDropdown.classList.contains('show')) openDropdown.classList.remove('show');
				}
			} else {
				let btns = document.getElementsByClassName("dropbtn");
				for (let i = 0; i < btns.length; i++) {
					let btn = btns[i];
					if (!event.target.isEqualNode(btn)) {
						let dc = btn.parentNode.getElementsByClassName("dropdown-content");
						for (let i = 0; i < dc.length; i++) {
							dc[i].classList.remove('show');
						}
					}
				}
			}
			if (!event.target.matches('.navbar-toggler-icon') && !event.target.matches('.offcanvas-start')) {
				let offcanvasList = document.getElementsByClassName("offcanvas");
				for (let i = 0; i < offcanvasList.length; i++) {
					let offcanvas = offcanvasList[i];
					if (offcanvas.classList.contains('show')) offcanvas.classList.remove('show');
				}
			}
			if (!event.target.matches('.context-menu')) {
				let offcanvasList = document.getElementsByClassName("context-menu");
				for (let i = 0; i < offcanvasList.length; i++) {
					let offcanvas = offcanvasList[i];
					if (offcanvas.classList.contains('show-menu')) offcanvas.classList.remove('show-menu');
				}
			}
			if (event.target.parentNode) {
				if (!event.target.matches(".selected-date")
					&& !event.target.matches(".dates")
					&& !event.target.parentNode.matches(".month")
					&& !event.target.parentNode.matches(".days") ) {
					let datesPickers = document.getElementsByClassName("dates");
					for (let i = 0; i < datesPickers.length; i++) {
						let datePicker = datesPickers[i];
						if (datePicker.classList.contains('active')) datePicker.classList.remove('active');
					}
				}
			}
			if (!event.target.matches('.dex-custom-select-selected')) {
				let comboBoxList = document.getElementsByClassName("dex-custom-select-selected");
				for (let i = 0; i < comboBoxList.length; i++) {
					let comboBox = comboBoxList[i];
					if (comboBox.classList.contains('select-arrow-active')) {
						comboBox.classList.remove('select-arrow-active');
						let selectItems = comboBox.parentNode.getElementsByClassName("select-items");
						for (let i = 0; i < selectItems.length; i++) {
							selectItems[0].classList.add("select-hide");
						}
					}
				}
			}

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

