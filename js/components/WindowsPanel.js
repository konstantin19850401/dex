'use strict'
class WindowsPanel extends Component {
	#elements;
	#hashes = {};
	#active;
	constructor ( application, parent ) {
		super( application, parent );
		this.#InitComponent();
	}
	// ГЕТТЕРЫ
	get Items() { return this.#hashes; };
	// СЕТТЕРЫ

	// ПРиватные методы
	#InitComponent() {
		this.Container = new Div( {parent: this.Parent.Container} ).SetAttributes( {class: 'windows-panel'} ).AddChilds([
			this.#elements = new Span().SetAttributes( {class: 'dex-menu-left'} )
		]);

	}
	#CreateNewWindow ( appWindow ) {
		this.#hashes[appWindow.Hash] = new Button( {parent: this.#elements} ).SetAttributes( {class: 'windows-panel-element'} ).Text( appWindow.Base ).AddWatch( shoObject => {
			shoObject.DomObject.addEventListener('click', event => {
				this.MakeActive( appWindow.Hash );
				appWindow.Maximize();
			})
		});
	}
	// публичные методы
	AddMenuNewItem ( appWindow ) {
		if ( typeof this.#hashes[ appWindow.Hash ] === 'undefined' ) {
			this.#CreateNewWindow( appWindow );
			appWindow.MakeActive( appWindow.Hash );
		} else {
			console.log( 'такой элемент в окнах есть. Не добавляем' );
		}
	}
	ChangeWindowTitle ( hash, newTitle ) {
		if ( typeof this.#hashes[ hash ] !== 'undefined' ) this.#hashes[ hash ].Text( newTitle );
	}
	DeleteWindow( hash ) {
		if ( typeof this.#hashes[ hash ] !== 'undefined' ) {
			this.#hashes[ hash ].DeleteObject();
			delete this.#hashes[ hash ];
		}
	}
	MakeActive ( hash ) {
		if ( this.#hashes[ this.#active ] ) {
			this.#hashes[ this.#active ].RemoveClass( 'windows-panel-element-active' );
			this.Parent.AppWindows.map( w => {
				if ( w.Hash != hash ) {
					w.Minimize();
				}
			} )
		}
		this.#active = hash;
		if ( this.#hashes[ this.#active ] ) {
			this.#hashes[ this.#active ].AddClass( 'windows-panel-element-active' );
		}
	}
}

