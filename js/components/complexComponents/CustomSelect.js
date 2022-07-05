'use strict'
class CustomSelect extends Component {
	#list = [];
	#select;#value;#text;
	#funcOnChange;
	#listItems;#selectedShoText;#shoList = [];#selectedSho;
	#defTitle;
	constructor (application, parent, list, start, defTitle) {
		super( application, parent );
		if (typeof defTitle !== "undefined") this.#defTitle = defTitle;
		this.#Init();
		if (typeof list !== "undefined") {
			for (let i = 0; i < list.length; i++ ) this.AddOption(list[i]);
		}
	}
	#Init() {
		this.Container = new Div({parent: this.Parent}).SetAttributes({class: "dex-custom-select"}).AddChilds([
			this.#select = new Select()
		]);
		this.#Create();
	};
	AddOption(data) {
		if (typeof data.value !== "undefined" && typeof data.text !== "undefined") {
			let option = new Option();
			option.Value = data.value;
			option.Text = data.text;
			this.#select.AddChilds([option]);
			let child = new Div({parent: this.#listItems})
				.Text(option.Text)
				.AddWatch(sho=> sho.DomObject.addEventListener("click", event=> {
					sho.ToggleClass("same-as-selected");
					if (typeof this.#selectedSho !== "undefined") this.#selectedSho.ToggleClass("same-as-selected");
					this.#selectedSho = sho;
					this.#listItems.ToggleClass("select-hide");
					this.#selectedShoText.ToggleClass("select-arrow-active");
					this.#value = option.Value;
					this.#text = option.Text;
					this.#selectedShoText.Text(this.#text);
					if (typeof this.#funcOnChange !== "undefined") this.#funcOnChange({value: this.#value, text: this.#text});
				}));
			this.#shoList.push({value: option.Value, sho: child});
			this.#list.push({value: data.value, text: data.text});
		}
	}
	#Create() {
		this.#selectedShoText = new Div({parent: this.Container})
			.SetAttributes({class: "dex-custom-select-selected"})
			.Text(typeof this.#defTitle === "undefined" ? "Выберите значение..." : this.#defTitle)
			.AddWatch(sho=> sho.DomObject.addEventListener("click", event=> {
				this.#listItems.ToggleClass("select-hide");
				sho.ToggleClass("select-arrow-active");
				if (Math.floor(sho.DomObject.getBoundingClientRect().y) + 300 > window.innerHeight) {
					let mtop = -this.#listItems.DomObject.offsetHeight - sho.DomObject.offsetHeight + 1;
					this.#listItems.DomObject.style.marginTop = `${mtop}px`;
				}
			}));
		this.#listItems = new Div({parent: this.Container}).SetAttributes({class: "select-items select-hide"});
		if (typeof this.#list !== "undefined") this.#list.map(item=> this.AddOption(item));
	}
	get Value() { return this.#value; }
	get Text() { return this.#text; }
	OnChange(func) {
		if (typeof func !== "undefined") this.#funcOnChange = func;
	}
	SelectItem(value) {
		this.#select.Value = value;
		this.#selectedShoText.Text(this.#select.Text);
		for (let i = 0; i < this.#shoList.length; i++) {
			if (this.#shoList[i].value == value) {
				this.#value = value;
				this.#text = this.#shoList[i].sho.Text;
				if (typeof this.#selectedSho !== "undefined") this.#selectedSho.ToggleClass("same-as-selected");
				this.#shoList[i].sho.ToggleClass("same-as-selected");
				this.#selectedSho = this.#shoList[i].sho;
				if (typeof this.#funcOnChange !== "undefined") this.#funcOnChange({value: this.#value, text: this.#text});
			}
		}
	}
}

