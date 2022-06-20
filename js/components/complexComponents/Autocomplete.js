'use strict'
class Autocomplete {
	#textarea;#list = [];#currentFocus;#dynamic = false;
	#autocompleteItems;
	constructor (shoObject, list, dynamic) {
		this.#textarea = shoObject;
		this.#list = list;
		this.#dynamic = dynamic;
		this.#Init();
	}
	#Init() {
		if (!this.#dynamic) {
			this.#autocompleteItems = new Div({parent: this.#textarea.ObjectParent}).SetAttributes({class: "autocomplete-items"});
			this.#textarea.AddWatch(sho=> sho.DomObject.addEventListener('textarea', event=> this.Iftextarea(event)));
		}
		this.#textarea.AddWatch(sho=> sho.DomObject.addEventListener('click', event=> this.#IfClick(event)));
	};
	IfInput(event) {
		let a, b, i, val = this.#dynamic ? this.#textarea.DomObject.value : event.target.value;
		this.#CloseAllLists();
		if (!val) { return false;}
		this.#currentFocus = -1;
		this.#autocompleteItems = new Div({parent: this.#textarea.ObjectParent}).SetAttributes({class: "autocomplete-items"});
		for (i = 0; i < this.#list.length; i++) {
			b = new Div().SetAttributes({item: this.#list[i]}).Text(`${this.#list[i]}`);
			b.AddChilds([
				new Input().SetAttributes({type: 'hidden'}).Value = this.#list[i]
			]).AddWatch(sho=> sho.DomObject.addEventListener('click', event=> {
				let attrs = sho.Attributes;
				this.#textarea.Value = attrs.item;
				this.#CloseAllLists();
			}));
			this.#autocompleteItems.AddChilds([b]);
		}
		if (this.#list.length > 0 ) this.#autocompleteItems.DomObject.style.width = `${this.#textarea.DomObject.offsetWidth}px`;
		else this.#CloseAllLists();
	}
	#IfKeyDown(event) {
		let x = this.#textarea.ObjectParent.DomObject;
		if (x) x = x.getElementsByTagName("div");
		if (event.keyCode == 40) {
			this.#currentFocus++;
			this.#AddActive(x);
		} else if (event.keyCode == 38) { //вверх
			this.#currentFocus--;
			this.#AddActive(x);
		} else if (event.keyCode == 13) {
			event.preventDefault();
			if (this.#currentFocus > -1) {
				if (x) x[this.#currentFocus].click();
			}
		}
	}
	#IfClick(event) {
		this.#CloseAllLists(event.target);
	}
	#CloseAllLists(elmnt) {
		let x = document.getElementsByClassName("autocomplete-items");
			for (var i = 0; i < x.length; i++) {
				if (elmnt != x[i] && elmnt != this.#textarea.DomObject) {
				x[i].parentNode.removeChild(x[i]);
			}
		}
	}
	#AddActive(x) {
	    if (!x) return false;
	    this.#RemoveActive(x);
	    if (this.#currentFocus >= x.length) this.#currentFocus = 0;
	    if (this.#currentFocus < 0) this.#currentFocus = (x.length - 1);
	    x[this.#currentFocus].classList.add("autocomplete-active");
	}
	#RemoveActive(x) {
	    for (var i = 0; i < x.length; i++) {
	    	x[i].classList.remove("autocomplete-active");
	    }
	}
	List(list) {this.#list = list}
}

