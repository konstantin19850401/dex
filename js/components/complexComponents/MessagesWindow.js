'use strict'
class MessagesWindow extends Component {
	#title;#body;#window;#onClose;
	constructor ( application, parent, title, data ) {
		super( application, parent );
		this.#title = title;
		this.#Draw();
		if (typeof data !== 'undefined') this.#initData(data);
	};
	// ГЕТТЕРЫ
	get Title() {return this.#title;}
	get Body() {return this.#body;}
	// СЕТТЕРЫ

	#Draw( ) {
		this.Container = new Div( {parent: this.Parent} ).SetAttributes( {class: 'common-window'} ).AddChilds([
			new I().SetAttributes( {class: 'dex-app-window-close fas fa-window-close'} ).AddWatch( shoObject => {
				shoObject.DomObject.addEventListener( 'click', event => {
					this.Close();
				})
			}),
			new Span().SetAttributes( {class: 'dex-app-window-title'} ).Text( `${ this.#title }` ),
			this.#body = new Div().SetAttributes( {class: 'dex-app-window-body'} ),
			new Button().SetAttributes( {class: 'bases-list-btn'} ).Text( 'Применить' ).AddWatch((el)=> {
				el.DomObject.addEventListener( 'click', event => {this.#Accept(); this.Close()})
			}),
		])
	};
	#initData(data) {
		for (let key in data) {
			if (key == 'height' || key == 'width') {
				let s = {height: 'margin-top', width: 'margin-left'};
				if (key != 'height') this.Container.DomObject.style[key] = `${data[key]}px`;
				this.Container.DomObject.style[s[key]] = `-${data[key]/2}px`;
			}
		}
	}
	#Accept() {
		if (typeof this.#onClose !== 'undefined') this.#onClose();
	}
	OnClose(func) {
		console.log('закроем');
		this.#onClose = func;
	}
	AddBody(mwbody) {
		this.#body.AddChilds([mwbody]);
	}
	Show() { this.Container.DomObject.hidden = false;}
	Hide() {this.Container.DomObject.hidden = true;}
	Close () {
		this.Container.DeleteObject();
		this.Application.DeleteHash( this.Hash );
	};
}

