"use strict"
class WindowsPanel extends Component {
	#elements;
	#hashes = [];
	#active;
	constructor ( application, parent ) {
		super(application, parent);
		this.#InitComponent();
	}
	// ГЕТТЕРЫ
	get Items() {return this.#hashes;};
	// СЕТТЕРЫ

	// ПРиватные методы
	#InitComponent() {
		this.Container = new Div({parent: this.Parent.Container})
			.SetAttributes({class: "windows-panel"})
			.AddChilds([
				this.#elements = new Span().SetAttributes({class: "dex-menu-left"})
			]);

	}
	#CreateNewWindow ( appWindow ) {
		let newElement = {btn:null, w:null};
		newElement.btn = new Button({parent: this.#elements})
			.SetAttributes({class: "windows-panel-element"})
			.Text(appWindow.Title)
			.AddWatch(sho => sho.DomObject.addEventListener("click", event => this.MakeActive(appWindow.Hash)));
		newElement.w = appWindow;
		this.#hashes.push(newElement);
		this.MakeActive(appWindow.Hash);
	}
	// публичные методы
	AddMenuNewItem ( appWindow ) {
		let s = this.#hashes.find(item=> item.w.Hash == appWindow.Hash);
		if (typeof s === "undefined") this.#CreateNewWindow(appWindow);
		else console.log("такой элемент в окнах есть. Не добавляем");
	}
	ChangeWindowTitle ( hash, newTitle ) {
		let s = this.#hashes.find(item=> item.w.Hash == hash);
		if (typeof s !== "undefined") s.btn.Text( newTitle );
	}
	DeleteWindow( hash ) {
		for (let i=0; i<this.#hashes.length; i++) {
			if (this.#hashes[i].w.Hash == hash) {
				if (this.#hashes.length > 1 && this.#active == hash) {
					if (this.#hashes[0].w.Hash != hash) this.MakeActive(this.#hashes[0].w.Hash);
					else this.MakeActive(this.#hashes[this.#hashes.length - 1].w.Hash);
				}
				let item = this.#hashes.splice(i, 1);
				item[0].btn.DeleteObject();
				break;
			}
		}
	}
	MakeActive ( hash ) {
		let s = this.#hashes.find(item=> item.w.Hash == hash);
		if (typeof s !== "undefined") {
			let curActive = this.#hashes.find(item=> item.w.Hash == this.#active);
			if (typeof curActive !== "undefined") {
				curActive.btn.RemoveClass("windows-panel-element-active");
				curActive.w.Minimize();
			}
			s.btn.AddClass( "windows-panel-element-active");
			s.w.Maximize();
			this.#active = hash;
		}
	}
}

