'use strict'
class Tree {
	#application;#hash;
	#container;#parent;
	#type='cho';// complex html object
	#typeCho = 'tree';
	#watcher;
	#menu;#dialogNewItemErrs;#dataTree;#nodeFields;
	constructor( application, parent, nodeFields ) {
		// console.log('создание tree');
		this.#application = application;
		this.#parent = parent;
		this.#nodeFields = nodeFields;
		this.#InitTree();
		this.#hash = this.#application.Toolbox.GenerateHash;
	}
	// ГЕТТЕРЫ
	get DomObject () { return this.#container.DomObject; };
	get ObjectType () { return this.#type; };
	get ComplexType () { return this.#typeCho; };
	get DataTree () { return this.#dataTree; };
	// СЕТТЕРЫ

	// ПРИВАТНЫЕ МЕТОДЫ
	#InitTree () {
		this.#container = new Div( {parent: this.#parent} ).SetAttributes( {class: 'dex-tree'} ).AddWatch(shoObject=> {
			shoObject.DomObject.addEventListener('click', event=> {
				if ( event.target.tagName != 'SPAN' ) return;
				let childrenContainer = event.target.parentNode.querySelector('ul');
				if ( !childrenContainer ) return;
				if ( childrenContainer.hasChildNodes() ) {
					if ( !childrenContainer.hidden ) childrenContainer.parentNode.style.color = '#fd7e14';
					else childrenContainer.parentNode.style.color = '#000';
					childrenContainer.hidden = !childrenContainer.hidden;
				}
			})
		});
	}
	#DialogNewItem ( func ) {
		let dialog;
		let data = {};
		dialog = new Div( {parent: this.#parent} ).SetAttributes( {class: 'dex-tree-add-dialog'} ).AddChilds([
			new I().SetAttributes( {class: 'dex-tree-add-dialog-close fas fa-window-close'} ).AddWatch(sho=> {
				sho.DomObject.addEventListener('click', event=> dialog.DeleteObject());
			}),
			new Span().SetAttributes( {class: 'dex-tree-add-dialog-title'} ).Text( `Добавление нового узла` ),
			this.#dialogNewItemErrs = new Div().SetAttributes( {class: 'dex-configuration-new-item-dialog-err'} ),
			new Div().SetAttributes( {class: 'dex-tree-add-dialog-body row'} ).AddChilds((()=> {
				let arr = [];
				this.#nodeFields.map(item=> {
					data[item.name] = '';
					let input;
					arr.push(
						new Div().SetAttributes( {class: 'form-floating mb-2'} ).AddChilds([
							input = new Input().SetAttributes( {class: 'form-control', type: 'text', placeholder: item.title} ).AddWatch(sho=> {
								sho.DomObject.addEventListener('input', event=> data[item.name] = event.target.value )
							}),
							new Label().Text( item.title )
						])
					)
				});
				return arr;
			})()),
			new Div().SetAttributes( {class: 'dex-tree-add-dialog-footer'} ).AddChilds([
				new Button().SetAttributes( {class: 'dex-tree-btn'} ).Text( 'Сохранить' ).AddWatch(sho=> {
					sho.DomObject.addEventListener('click', event=> {
						func( data );
						dialog.DeleteObject();
					});
				})
			])
		]);
	}
	#DialogDeleteItem( func, name, uid ) {
		let dialog;
		dialog = new Div( {parent: this.#parent} ).SetAttributes( {class: 'dex-tree-add-dialog'} ).AddChilds([
			new I().SetAttributes( {class: 'dex-tree-add-dialog-close fas fa-window-close'} ).AddWatch(sho=> {
				sho.DomObject.addEventListener('click', event=> dialog.DeleteObject());
			}),
			new Span().SetAttributes( {class: 'dex-tree-add-dialog-title'} ).Text( `Вы правда желаете удалить узел ?` ),
			this.#dialogNewItemErrs = new Div().SetAttributes( {class: 'dex-configuration-new-item-dialog-err'} ),
			new Div().SetAttributes( {class: 'dex-tree-delete-dialog-body row'} ).Text( `Удаляемый узел [ ${ name } ]. Все подчиненные узлы так же будут удалены без возможности восстановления!` ),
			new Div().SetAttributes( {class: 'dex-tree-add-dialog-footer'} ).AddChilds([
				new Button().SetAttributes( {class: 'dex-tree-btn'} ).Text( 'Удалить узел' ).AddWatch(sho=> {
					sho.DomObject.addEventListener('click', event=> {
						func( uid );
						dialog.DeleteObject();
					})
				})
			])
		])
	}
	#MoveUp ( func ) {
		func();
	}
	#MoveDown ( func ) {
		func();
	}
	AddBlock ( parent, obj, methods ) {
		let childsContainer;
		let btns = [
			{action: (func, name, uid)=> { this.#DialogNewItem(func, name, uid) }, method: (uid, data)=> { methods.addItem(uid, data) }, icon: "fa-plus"},
			{action: (func, name, uid)=> { this.#DialogDeleteItem(func, name, uid) }, method: (uid, data)=> { methods.deleteItem(uid, data) }, icon: 'fa-minus'},
			{action: (func, name, uid)=> { this.#MoveUp(func, name, uid) }, method: (uid, data)=> { methods.moveUp(uid, data) }, icon: 'fa-arrow-down'},
			{action: (func, name, uid)=> { this.#MoveDown(func, name, uid) }, method: (uid, data)=> { methods.moveDown(uid, data) }, icon: 'fa-arrow-up'}
		];
		let container = new Li( {parent: parent} ).AddChilds([
			new Span().Text( obj.name ).AddChilds([
				new Span().SetAttributes( {class: 'dex-tree-menu'} ).AddChilds(
					(()=> {
						let arr = [];
						for (let i = 0; i < btns.length; i++) {
							let newBtn = new Button().AddChilds([
								new I().SetAttributes( {class: `fas ${ btns[i].icon }`} )
							]).AddWatch(sho=> {
								sho.DomObject.addEventListener('click', event=> {
									btns[i].action((data)=> { btns[i].method(obj.uid, data) }, obj.name, obj.uid);
								})
							});
							arr.push(newBtn);
						}
						return arr;
					})()
				)
			]),
			childsContainer = new Ul()
		]);
		return { container: container, childsContainer: childsContainer };
	}
	Draw ( conf, methods ) {
		let ul = new Ul( {parent: this.#container} );
		let cnf = {};
		let that = this;
		function parse( obj, temp, tempName, container ) {
			let fname = tempName != '' ? `${ tempName }.${ obj.name }` : obj.name;
			if ( typeof temp[obj.name] === 'undefined' ) {
				let containers = that.AddBlock(container, obj, methods);
				temp[obj.name] = {fname: fname, name: obj.name, rank: obj.rank, container: containers.container, childsContainer: containers.childsContainer, uid: obj.uid, parent: obj.parent, childs: {}};
			}
			if ( obj.childs ) {
				obj.childs.map(item=>parse(item, temp[obj.name].childs, fname, temp[obj.name].childsContainer));
			}
		}
		parse( conf.core, cnf, '', ul );
		this.#dataTree = cnf;
		console.log( 'cnf=> ', cnf );
	}
	ShowErrDialogNewItem ( errs ) {
		this.#dialogNewItemErrs.RemoveChilds();
		errs.map(item=> this.#dialogNewItemErrs.AddChilds([ new Span().Text( item ) ]));
	}
	GetElementByUid ( uid ) {
		let curObj;
		function parse(uid, obj) {
			if ( obj.uid == uid ) {
				curObj = obj;
				return;
			} else {
				if ( obj.childs ) {
					for ( let key in obj.childs ) parse(uid, obj.childs[key]);
				}
			}
		}
		parse(uid, this.#dataTree.DOCUMENT);
		return curObj;
	}
	GetParentByUid ( uid ) {
		let curObj = this.GetElementByUid(uid);
		let parentObj = this.GetElementByUid( curObj.parent );
		return parentObj;
	}
	Swap ( data ) {
		let moveUp = this.GetElementByUid( data.uidUp );
		let moveDown = this.GetElementByUid( data.uidDown );

		let obj1 = moveUp.container.DomObject;
		let obj2 = moveDown.container.DomObject;

		var parent2 = obj2.parentNode;
		var next2 = obj2.nextSibling;
		if (next2 === obj1) parent2.insertBefore(obj1, obj2);
		else {
			obj1.parentNode.insertBefore(obj2, obj1);
			if (next2) parent2.insertBefore(obj1, next2);
			else parent2.appendChild(obj1);
		}
	}
}
