'use strict'
class CommonWindow extends Component {
	#title;#body;#window;
	constructor ( application, parent, title ) {
		super( application, parent );
		this.#title = title;
		this.#Draw();
	};
	// ГЕТТЕРЫ
	get Title() {return this.#title;}
	get Body() {return this.#body;}
	// СЕТТЕРЫ

	#Draw( ) {
		console.log("this.Parent.Wrapper=> ", this.Parent.Wrapper);
		this.Container = new Div( {parent: this.Parent.Wrapper} ).SetAttributes( {class: 'common-window'} );
	};
	Show() { this.Container.DomObject.hidden = false;}
	Hide() {this.Container.DomObject.hidden = true;}
	Close () {
		this.Container.DeleteObject();
		this.Application.DeleteHash( this.Hash );
	};
}

