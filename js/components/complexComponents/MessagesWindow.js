'use strict'
class MessagesWindow extends Component {
	#title;#body;#window;#hideBtn;#btn;
	#data = {};
	#onAccept;#onCancel;#onClose;
	#errs;
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
	set Errors(errs) {
		let text = "";
		if (Array.isArray(errs)) text = errs.join(", ");
		else text = errs;
		this.#errs.Text(text);
	}

	// СЕТТЕРЫ

	#Draw( ) {
		this.Container = new Div( {parent: this.Parent} ).SetAttributes( {class: "dex-dialog-wrapper"} ).AddChilds([
			new Div().SetAttributes({class: "dex-dialog-message-box"}).AddChilds([
				new Div().SetAttributes({class: "dex-dialog-message-header form-group row"}).AddChilds([
					this.#title = new Div().SetAttributes({class: "dex-dialog-message-header-title col-sm-10"}).Text(this.#title),
					new Div().SetAttributes({class: "col-sm-2"}).AddChilds([
						new I().SetAttributes({class: "dex-dialog-message-header-close fas fa-window-close"})
							.AddWatch(sho=> sho.DomObject.addEventListener("click", event=> this.#Cancel()))
					])
				]),
				this.#errs = new Div().SetAttributes({class: "dex-dialog-message-errs"}),
				this.#body = new Div().SetAttributes({class: "dex-dialog-message-body"}),
				new Div().SetAttributes({class: "dex-dialog-message-footer"}).AddChilds([
					new Div().SetAttributes({class: "dex-dialog-message-accept"}).AddChilds([
						new Button().SetAttributes({class: "dex-dialog-message-accept-btn btns btn-primary", type: "submit"})
							.Text("Проверить")
							.AddWatch(sho=> sho.DomObject.addEventListener("click", event=> this.#Accept()))
					])
				])
			])
		])

		if (this.#hideBtn == true) this.#btn.Hide();
	};
	#initData(data) {
		for (let i = 0; i < data.length; i++) {
			this.#data[data[i].name] = "";
			this.#body.AddChilds([
				new Div().SetAttributes({class: "dex-dialog-message-body-item form-group row"}).AddChilds([
					new Div().SetAttributes({class: "col-sm-6"}).Text(data[i].labelText),
					new Div().SetAttributes({class: "col-sm-6"}).AddChilds([
						new Input()
							.AddWatch(sho=> sho.DomObject.addEventListener("input", event=> this.#data[data[i].name] = event.target.value))
							.AddWatch(sho=> sho.DomObject.addEventListener("keypress", event=> {
								if (event.key == "Enter" && typeof data[i+1] !== "undefined") this.#body.Childs[i+1].DomObject.focus();
								else if (event.key == "Enter" && typeof data[i+1] === "undefined") this.#Accept();
							}))
					]),
				])
			])
		}
	}
	#Accept() {
		if (typeof this.#onAccept !== "undefined") this.#onAccept(this.#data);
		// this.Close();
	}
	#Cancel() {
		if (typeof this.#onCancel !== "undefined") this.#onCancel();
		this.Close();
	}
	Show() { this.Container.DomObject.hidden = false;}
	Hide() {this.Container.DomObject.hidden = true;}
	Close () {
		this.Container.DeleteObject();
		this.Application.DeleteHash( this.Hash );
		if (typeof this.#onClose !== "undefined") this.#onClose();
	};
	OnAccept(func) { this.#onAccept = func; }
	OnCancel(func) { this.#onCancel = func; }
	OnClose(func) { this.#onClose = func; }
}

