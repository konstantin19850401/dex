'use strict'
class DexDate extends Component {
	#date;#day;#month;#year;
	#months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
	#weekDays = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
	#selectedDate;
	#datesElement;#selectedDateElement;#mth;#days;#currentDateSho;#currentDate;
	#type = "DEXDATE";
	#onOpen;#onSelect;
	constructor( application, parent ) {
		super( application, parent );
		this.#Init();
	}
	get ObjectType () { return this.#type; };
	// ПРИВАТНЫЕ МЕТОДЫ
	#Init () {
		if (typeof this.Parent !== "undefined") this.Container = new Div({parent: this.Parent});
		else this.Container = new Div();
		this.Container.SetAttributes({class: "dex-date-picker"}).AddChilds([
			this.#selectedDateElement = new Div().SetAttributes({class: "selected-date"}),
			this.#datesElement = new Div().SetAttributes({class: "dates"}).AddChilds([
				new Div().SetAttributes({class: "month"}).AddChilds([
					new Div().SetAttributes({class: "arrows prev-mth fa fa-angle-left"})
						.AddWatch(sho=> sho.DomObject.addEventListener("click", event=> {
							this.#GoToPrevMonth();
							this.#SetMth();
							this.#FillMonths();
						})),
					this.#mth = new Div().SetAttributes({class: "mth"}),
					new Div().SetAttributes({class: "arrows next-mth fa fa-angle-right"})
						.AddWatch(sho=> sho.DomObject.addEventListener("click", event=> {
							this.#GoToNextMonth();
							this.#SetMth();
							this.#FillMonths();
						})),
				]),
				new Div().SetAttributes({class: "week-days"}).AddChilds((()=>{
					let arr = [];
					for (let i = 0; i < this.#weekDays.length; i++) arr.push(new Div().Text(this.#weekDays[i]));
					return arr;
				})()),
				this.#days = new Div().SetAttributes({class: "days"}),
				new Div().SetAttributes({class: "dex-date-current-date"}).AddChilds([
					new Div().SetAttributes({class: "dex-date-current-date-item dex-date-current-date-label"}).Text("Текущая дата:"),
					this.#currentDateSho = new Div().SetAttributes({class: "dex-date-current-date-item dex-date-current-date-date"})
						.AddWatch(sho=> sho.DomObject.addEventListener("click", event=> {
							this.SetDate(this.#currentDate);
							if (typeof this.#onSelect !== "undefined") this.#onSelect(this.#selectedDate);
						}))
				])
			])
		]);
		this.Container.AddWatch(sho=> sho.DomObject.addEventListener("click", event=> {
			if (!this.#checkEventPathForClass(event.composedPath(), 'dates') || this.#checkEventPathForClass(event.composedPath(), 'days-items')) {
				this.#datesElement.ToggleClass("active");
				if (typeof this.#onOpen !== "undefined") this.#onOpen();
			}
		}));
		this.#currentDate = new Date();
		this.#currentDateSho.Text(this.#FormatDate(this.#currentDate));
		this.SetDate(this.#currentDate);
	}
	#FormatDate(date) {
		let day = date.getDate();
		if (day < 10) day = `0${day}`;
		let month = date.getMonth() + 1;
		if (month < 10) month = `0${month}`;
		let year = date.getFullYear();
		return `${day}.${month}.${year}`;
	}
	#GoToNextMonth() {
		this.#month++;
		if (this.#month > 11) {
			this.#month = 0;
			this.#year++;
		}
	}
	#GoToPrevMonth() {
		this.#month--;
		if (this.#month < 0) {
			this.#month = 11;
			this.#year--;
		}
	}
	#FillMonths() {
		// очистим данные
		this.#days.RemoveChilds();
		// сначала определим, с какого дня недели стартуем
		let start = new Date(`${this.#year}.${this.#month + 1}.01`).getDay();
		let mirror = [6,0,1,2,3,4,5];
		for (let i = 0; i < mirror[start]; i++) new Div({parent: this.#days}).Text("");
		//наполним днями месяца
		let days = new Date(this.#year, this.#month + 1, 0).getDate();
		let selected;
		for (let i = 1; i <= days; i++) {
			let div = new Div({parent: this.#days}).SetAttributes({class: "days-items"}).Text(i)
				.AddWatch(sho=> sho.DomObject.addEventListener("click", event=> {
					this.#selectedDate = this.#FormatDate(new Date(`${this.#year}.${this.#month + 1}.${i}`));
					this.#selectedDateElement.Text(this.#selectedDate);
					div.ToggleClass("selected");
					if (typeof selected !== "undefined") selected.ToggleClass("selected");
					selected = div;
					if (typeof this.#onSelect !== "undefined") this.#onSelect(this.#selectedDate);
				}));

			if (this.#selectedDate == this.#FormatDate(new Date(`${this.#year}.${this.#month + 1}.${i}`) )) {
				div.ToggleClass("selected");
				selected = div;
			}
		}
	}
	#SetMth() {
		this.#mth.Text(`${this.#months[this.#month]} ${this.#year}`);
	}
	#checkEventPathForClass(path, selector) {
		for (let i = 0; i < path.length; i++) {
			if (path[i].classList && path[i].classList.contains(selector)) return true;
		}
		return false;
	}
	OnOpen(func) {
		if (typeof func !== "undefined") this.#onOpen = func;
		return this;
	}
	OnSelect(func) {
		if (typeof func !== "undefined") this.#onSelect = func;
		return this;
	}
	Close() {
		this.#datesElement.RemoveClass("active");
	}
	SetDate(date) {
		this.#day = date.getDate();
		this.#month = date.getMonth();
		this.#year = date.getFullYear();
		this.#selectedDate = this.#FormatDate(date);
		this.#selectedDateElement.Text(this.#selectedDate);
		this.#SetMth();
		this.#FillMonths();
	}

}
