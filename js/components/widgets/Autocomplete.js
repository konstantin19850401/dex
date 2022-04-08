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
		// this.#textarea.AddWatch(sho=> sho.DomObject.addEventListener('keydown', event=> this.#IfKeyDown(event)));
		this.#textarea.AddWatch(sho=> sho.DomObject.addEventListener('click', event=> this.#IfClick(event)));
	};
	IfInput(event) {
		var a, b, i, val = this.#dynamic ? this.#textarea.DomObject.value : event.target.value;
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
		// console.log('===> ', this.#textarea.DomObject.offsetWidth);
		if (this.#list.length > 0 ) this.#autocompleteItems.DomObject.style.width = `${this.#textarea.DomObject.offsetWidth}px`;
		else this.#CloseAllLists();
		// this.#autocompleteItems.DomObject.style.marginLeft = `${this.#textarea.DomObject.offsetWidth}px`;
	}
	#IfKeyDown(event) {
		var x = document.getElementById(this.id + "autocomplete-list");
		if (x) x = x.getElementsByTagName("div");
		if (event.keyCode == 40) {
			/*Если нажата клавиша со стрелкой вниз,
			увеличьте текущую переменную фокуса:*/
			this.#currentFocus++;
			/*и сделать текущий элемент более заметным:*/
			this.#AddActive(x);
		} else if (event.keyCode == 38) { //вверх
			/*Если нажата клавиша со стрелкой вверх,
			уменьшите текущую переменную фокуса:*/
			this.#currentFocus--;
			/*и сделать текущий элемент более заметным:*/
			this.#AddActive(x);
		} else if (event.keyCode == 13) {
			/*Если нажата клавиша ENTER, не допускайте отправки формы,*/
			event.preventDefault();
			if (this.#currentFocus > -1) {
				/*и имитировать щелчок по "активному" пункту:*/
				if (x) x[this.#currentFocus].click();
			}
		}
	}
	#IfClick(event) {
		this.#CloseAllLists(event.target);
	}
	#CloseAllLists(elmnt) {
		/*закройте все списки автозаполнения в документе,
	    за исключением того, что было передано в качестве аргумента:*/
	    var x = document.getElementsByClassName("autocomplete-items");
	    for (var i = 0; i < x.length; i++) {
	      if (elmnt != x[i] && elmnt != this.#textarea.DomObject) {
	        x[i].parentNode.removeChild(x[i]);
	      }
	    }
	}
	#AddActive(x) {
		/*функция для классификации элемента как " активного":*/
	    if (!x) return false;
	    /*начните с удаления "активного" класса на всех элементах:*/
	    this.#RemoveActive(x);
	    if (this.#currentFocus >= x.length) this.#currentFocus = 0;
	    if (this.#currentFocus < 0) this.#currentFocus = (x.length - 1);
	    /*добавить класс "autocomplete-active":*/
	    x[this.#currentFocus].classList.add("autocomplete-active");
	}
	#RemoveActive(x) {
		/*функция для удаления класса "active" из всех элементов автозаполнения:*/
	    for (var i = 0; i < x.length; i++) {
	    	x[i].classList.remove("autocomplete-active");
	    }
	}
	List(list) {this.#list = list}
}

