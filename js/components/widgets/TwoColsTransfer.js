'use strict'
class TwoColsTransfer {
	#parent;#container;#application;#hash;#title;#dict;
	#leftFields;#rightFields;
	#filterLeft;#filterRight;
	#leftArr = [];#rightArr = [];
	constructor ( application, parent, title, dict) {
		this.#application = application;
		this.#parent = parent;
		this.#hash = this.#application.Toolbox.GenerateHash;
		this.#title = title;
		this.#dict = dict;
		this.#Init();
	}
	// ГЕТТЕРЫ
	get GetRightValues() {
		let arr = [];
		for (let i=0; i < this.#rightArr.length; i++) {
			if (this.#rightArr[i].display == true) arr.push(this.#rightArr[i].item.uid);
		}
		return arr;
	}
	get GetLeftValues() {
		let arr = [];
		for (let i=0; i < this.#leftArr.length; i++) {
			if (this.#leftArr[i].display == true) arr.push(this.#leftArr[i].item.uid);
		}
		return arr;
	}

	// СЕТТЕРЫ


	// ПРИВАТНЫЕ МЕТОДЫ
	#Init() {
		this.#container = new Div( {parent: this.#parent} ).SetAttributes( {class: 'widget-block'} ).AddChilds([
			new Div().SetAttributes({class: 'widget-controlls'}).AddChilds([
				new Button().SetAttributes( {class: 'widget-btn'} ).Text('Сброс').AddWatch(shoObject=> {
					shoObject.DomObject.addEventListener('click', event=> this.Reset());
				})
			]),
			new Div().SetAttributes( {class: 'widget-block-body row'} ).AddChilds([
				this.#leftFields = new Div().SetAttributes( {class: 'tc-transfer-body-block-left col-6'} ).AddChilds([
					new Div().SetAttributes({class: 'tc-transfer-left-filter'}).AddChilds([
						this.#filterLeft = new Input().AddWatch(shoObject=> {
							shoObject.DomObject.addEventListener('input', event=> {
								let val = event.target.value;
 								for (let i= 0; i < this.#leftArr.length; i++) {
 									if (this.#leftArr[i].item.title.includes(val)) {
 										if (this.#leftArr[i].display == false) {
 											// надо проверить,
 											this.#leftArr[i].display = true;
 											this.#leftArr[i].sho.Show();
 										}
 									} else {
 										if (this.#leftArr[i].display == true) {
 											this.#leftArr[i].display = false;
 											this.#leftArr[i].sho.Hide();
 										}
 									}
 								}
							})
						})
					])
				]),
				this.#rightFields = new Div().SetAttributes( {class: 'tc-transfer-body-block-right col-6'} ).AddChilds([
					new Div().SetAttributes({class: 'tc-transfer-right-filter'}).AddChilds([
						this.#filterRight = new Input().AddWatch(shoObject=> {
							shoObject.DomObject.addEventListener('input', event=> {

							})
						})
					])
				])
			])
		]);
		this.#FillBlock();
	}
	#FillBlock() {
		let arrs = ['leftFields', 'rightArr'];
		for(let item of this.#dict) {
			for (let i=0; i<arrs.length; i++) {
				let display = true;
				let parent = this.#leftFields;
				let carr = this.#leftArr;
				let acarr = this.#rightArr;
				if (arrs[i] == 'rightArr') {
					display = false;
					parent = this.#rightFields;
					carr = this.#rightArr;
					acarr = this.#leftArr;
				}
				let obj =  {item: item, display: display};
				obj.sho = new Div({parent: parent}).SetAttributes( {class: 'fields-control-body-element'} ).Text( item.title ).AddWatch(shoObject=> {
					shoObject.DomObject.addEventListener('click', event=> {
						obj.display = false;
						obj.sho.Hide();
						for (let i= 0; i < acarr.length; i++) {
							if (acarr[i].item.uid == item.uid) {
								acarr[i].display = true;
								acarr[i].sho.Show();
								break;
							}
						}
					})
				});
				if (arrs[i] == 'rightArr') obj.sho.Hide();
				carr.push(obj);
			}
		}
	}
	SetRightValues(arr) {
		if (Array.isArray(arr)) {
			for (let i=0; i < arr.length; i++) {
				for (let j=0; j < this.#leftArr.length; j++) {
					if (this.#leftArr[j].item.uid == arr[i]) {
						this.#leftArr[j].display = false;
						this.#leftArr[j].sho.Hide();
					}
				}
				for (let j=0; j < this.#rightArr.length; j++) {
					if (this.#rightArr[j].item.uid == arr[i]) {
						this.#rightArr[j].display = true;
						this.#rightArr[j].sho.Show();
					}
				}
			}
		}
	}
	Reset() {
		for (let i=0; i < this.#leftArr.length; i++) {
			if (this.#leftArr[i].display == false) {
				this.#leftArr[i].display = true;
				this.#leftArr[i].sho.Show();
			}
		}
		for (let i=0; i < this.#rightArr.length; i++) {
			if (this.#rightArr[i].display == true) {
				this.#rightArr[i].display = false;
				this.#rightArr[i].sho.Hide();
			}
		}
		this.#filterLeft.Value('');
		this.#filterRight.Value('');
	}
}

