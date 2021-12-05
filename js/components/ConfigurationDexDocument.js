'use strict'
class ConfigurationDexDocument extends Component {
	#data;
	#dialogNewItem;#dialogNewItemErrs;
	#statuses = ['Блокируется', 'Не блокируется'];
	#list = {};#tree;
	constructor ( application, parent) {
		super( application, parent );
		this.#GetConfiguration();
	}
	// ГЕТТЕРЫ

	// СЕТТЕРЫ

	// ПРИВАТНЫЕ МЕТОДЫ
	#InitComponent ( data ) {
		let cbody;
		let conf = {};
		let core = data.list.find(item=>item.type == 'CORE');
		conf.core = { uid: core.uid, name: core.name, rank: core.rank, description: core.description, parent: core.parent};
		function parse( obj ) {
			let list = data.list.filter(item => item.parent == obj.uid);
			if ( list.length > 0 ) {
				obj.childs = [];
				list.map(item=> obj.childs.push( {uid: item.uid, name: item.name, rank: item.rank, description: item.description, parent: item.parent} ));
				obj.childs.sort((a,b)=>a.rank > b.rank ? 1 : -1);
				obj.childs.map(item=> parse(item))
			}
		}
		parse( conf.core );
		console.log( "conf=> ", conf );
		this.Container = new Div( {parent: this.Parent.Container} ).SetAttributes( {class: 'dex-configuration'} ).AddChilds([
			new I().SetAttributes( {class: 'dex-configuration-close fas fa-window-close'} ).AddWatch(sho => {
				sho.DomObject.addEventListener( 'click', event => this.#Close() )
			}),
			new Span().SetAttributes( {class: 'dex-configuration-title'} ).Text( `Настройка полей документа` ),
			cbody = new Div().SetAttributes( {class: 'dex-contract-body row'} )
		]);
		let nodeFields = [{name: 'name', title: 'ID узла'}, {name: 'description', title: 'Описание узла'}, {name: 'rank', title: 'Вес узла'}];
		this.#tree = new Tree( this.Application, cbody, nodeFields );
		this.#tree.Draw( conf, {
			addItem: ( uid, data ) => this.#AddNewItem( uid, data ),
			deleteItem: ( uid ) => this.#DeleteField( uid ),
			moveUp: ( uid ) => this.#MoveUp( uid ),
			moveDown: ( uid ) => this.#MoveDown( uid )
		});
	}
	#Close () {
		this.Container.DeleteObject();
		if (this.#dialogNewItem) this.#dialogNewItem.DeleteObject();
		this.Application.DeleteHash( this.Hash );
	};
	#GetConfiguration() {
		let transport = this.Application.Transport;
		transport.Get( {com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getConfigurationDexDocument'}, hash: this.Hash} );
	}
	#AddNewItem ( uid, data ) {
		let transport = this.Application.Transport;
		transport.Get( {com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'addNewItemConfigurationDexDocument', parent: uid, newItem: data}, hash: this.Hash} );
	}
	#DeleteField ( uid ) {
		let transport = this.Application.Transport;
		transport.Get( {com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'deleteConfigurationDexDocumentItem', item: uid }, hash: this.Hash} );
	}
	#MoveUp( uid ) {
		let transport = this.Application.Transport;
		transport.Get( {com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'rankUpConfigurationDexDocumentItem', item: uid }, hash: this.Hash} );
	}
	#MoveDown ( uid ) {
		let transport = this.Application.Transport;
		transport.Get( {com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'rankDownConfigurationDexDocumentItem', item: uid }, hash: this.Hash} );
	}
	#MoveItem ( data ) {
		if ( data.uidUp && data.uidDown ) this.#tree.Swap( {uidUp: data.uidUp, uidDown: data.uidDown} );
	}
	#BlockField ( section, item ) {
		console.log( "+++", {com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'changeStatusItemConfigurationDexDocument', item: item, section: section}, hash: this.Hash} );
		let transport = this.Application.Transport;
		transport.Get( {com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'changeStatusItemConfigurationDexDocument', item: item, section: section}, hash: this.Hash} );
	}

	// ПУБЛИЧНЫЕ МЕТОДЫ
	Commands ( packet ) {
		console.log( packet );
		switch ( packet.com ) {
			case 'skyline.apps.adapters':
				switch ( packet.subcom ) {
					case 'appApi':
						switch ( packet.data.action ) {
							case 'configurationDexDocument':
								this.#InitComponent( packet.data );
							break;
							case 'deleteConfigurationDexDocumentItem':
								if ( packet.data.status == 200 && packet.data.item ) {
									let curObj = this.#tree.GetElementByUid( packet.data.item );
									let parentObj = this.#tree.GetParentByUid( packet.data.item );
									curObj.container.DeleteObject();
									let childs = parentObj.childs;
									delete childs[curObj.name];
								}
							break;
							case 'addNewItemConfigurationDexDocument':
								if ( packet.data.status == 200 ) {
									let tree = this.#tree.DataTree;
									let obj = this.#tree.GetElementByUid( packet.data.parent );
									if ( obj ) {
										let name = packet.data.newItem.name;
										let uid = packet.data.newItem.uid;
										let fname = `${ obj.fname }.${ name }`;
										let childs = {};
										let newItem = {fname: fname, name: name, uid: uid, parent: obj.uid, childs: {}};
										let containers = this.#tree.AddBlock(
											obj.childsContainer,
											newItem,
											{addItem: (data, parent) => { this.#AddNewItem(data, parent) }, deleteItem: ( uid ) => { this.#DeleteField( uid ) } }
										);
										newItem.childsContainer = containers.childsContainer;
										newItem.container = containers.container;
										obj.childs[name] = newItem;
										let curItem = this.#tree.GetElementByUid( uid );
									} else console.log(  'Контейнер не найден' );
								} else {
									this.#tree.ShowErrDialogNewItem( packet.data.err );
								}
							break;
							case 'changeStatusItemConfigurationDexDocument':
								// if ( packet.data.status == 200 ) {
								// 	let element = this.#items[packet.data.section].elems.find( item=> item.name == packet.data.item.name );
								// 	element.block.Text( this.#statuses[packet.data.item.status] );
								// 	console.log( 'childs=> ', element );
								// } else {
								// 	console.log( 'ошибка смены статус поля ', packet );
								// }
							break;
							case 'rankUpConfigurationDexDocumentItem':
								if ( packet.data.status == 200 ) {
									this.#MoveItem( packet.data );
								}
							break;
							case 'rankDownConfigurationDexDocumentItem':
								if ( packet.data.status == 200 ) {
									this.#MoveItem( packet.data );
								}
							break;
						}
					break;
				}
			break;
		}
	}
}

