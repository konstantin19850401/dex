'use strict'
class MessagesWindow extends Component {
	#title;#body;#window;#onClose;#ifClose;#hideBtn;#btn;
	constructor ( application, parent, title, data, hideBtn ) {
		super( application, parent );
		this.#title = title;
		if (typeof hideBtn !== 'undefined' && hideBtn == true) this.#hideBtn = true
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
			this.#btn = new Button().SetAttributes( {class: 'bases-list-btn'} ).Text( 'Применить' ).AddWatch((el)=> {
				el.DomObject.addEventListener( 'click', event => {this.#Accept(); this.Close()})
			}),
		])
		if (this.#hideBtn == true) this.#btn.Hide();
	};
	#initData(data) {
		for (let key in data) {
			if (key == 'height' || key == 'width') {
				let s = {height: 'margin-top', width: 'margin-left'};
				// if (key != 'height') this.Container.DomObject.style[key] = `${data[key]}px`;
				if (key != 'height') this.Container.DomObject.style[key] = `${data[key]}px`;
				this.Container.DomObject.style[s[key]] = `-${data[key]/2}px`;
			}
		}
		if (typeof data.height !== "undefined") this.#body.DomObject.style.height = `${data.height}px`;
	}
	#Accept() {
		if (typeof this.#onClose !== 'undefined') this.#onClose();
	}
	OnClose(func) {
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
		if (typeof this.#ifClose !== 'undefined') this.#ifClose();
	};
	IfCloseForm(func) {
		this.#ifClose = func;
	}
}

