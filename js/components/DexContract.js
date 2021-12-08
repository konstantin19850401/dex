'use strict'
class DexContract extends Component {
	#titleInfo;
	#data = {};#fixedData;#base;#dicts;#bodyFields;#menuFields;#startFields;
	#checkFields = {};
	constructor ( application, parent, base, dicts) {
		super( application, parent );
		this.#base = base;
		this.#dicts = dicts;
		this.#GetStartFields();
	}
	// ГЕТТЕРЫ

	// СЕТТЕРЫ

	// ПРИВАТНЫЕ МЕТОДЫ
	#InitComponent ( data ) {
		let startFields = data.list.find(item=> item.name == 'startFields');
		let docFields = data.list.find(item=> item.name == 'dexDocumentConfiguration');
		let conf = {};
		let core = docFields.fields.find(item=>item.type == 'CORE');
		conf.core = { uid: core.uid, name: core.name, rank: core.rank, description: core.description, parent: core.parent};
		function parse( obj ) {
			let list = docFields.fields.filter(item => item.parent == obj.uid);
			if ( list.length > 0 ) {
				obj.childs = [];
				list.map(item=> obj.childs.push( {uid: item.uid, name: item.name, data: item} ));
				obj.childs.sort((a,b)=>a.data.rank > b.data.rank ? 1 : -1);
				obj.childs.map(item=> parse(item))
			}
		}
		parse( conf.core );
		console.log( "conf=> ", conf );
		this.Container = new Div( {parent: this.Parent.Container} ).SetAttributes( {class: 'dex-contract check-sim-data'} ).AddChilds([
			new I().SetAttributes( {class: 'dex-contract-close fas fa-window-close'} ).AddWatch( sho=> {
				sho.DomObject.addEventListener( 'click', event=> this.#Close())
			}),
			this.#titleInfo = new Span().SetAttributes( {class: 'dex-contract-title-new'} ).Text( `Создание нового договора` ),
			new Span().SetAttributes( {class: 'dex-contract-title-data'} ).Text( `Проверка данных sim-карты` ),
			new Div().SetAttributes( {class: 'dex-contract-body row'} ).AddChilds([
				this.#menuFields = new Div().SetAttributes( {class: 'dex-contract-dynamic-left sticky-top col-3'} ),
				this.#startFields = new Div().SetAttributes( {class: 'start-fields-block'} ),
				this.#bodyFields = new Div().SetAttributes( {class: 'dex-contract-dynamic-right col-8'} ),
			]),
			new Div().SetAttributes( {class: 'dex-contract-footer'} ).AddChilds([
				new Button().SetAttributes( {class: 'dex-contract-btn-check'} ).Text( 'Проверить' ).AddWatch( sho=> {
					sho.DomObject.addEventListener( 'click', event=> this.#CheckStartFields())
				}),
				new Button().SetAttributes( {class: 'dex-contract-btn-new'} ).Text( 'Сохранить договор' ).AddWatch(sho => {
					sho.DomObject.addEventListener( 'click', event=> console.log( 'Сохранить договор' ))
				}),
			])
		]);
		this.#menuFields.DomObject.hidden = true;
		this.#bodyFields.DomObject.hidden = true;
		if ( typeof data !== 'undefined' ) {
			data.list.find(item=> item.name == 'startFields').fields.map(item=> {
				// this.#data[ item.value ] = '';
				if ( item.value == 'ICC' ) this.#checkFields.ICC = '0204785615';
				let field = new Div().SetAttributes( {class: 'start-fields-block row'} ).AddChilds([
					new Label().SetAttributes( {class: 'col-4'} ).Text( item.title ),
					new Input().SetAttributes( {class: 'col-8', placeholder: `Введите ${ item.title }` } ).Value( this.#checkFields.ICC ).AddWatch(sho=> {
						sho.DomObject.addEventListener( 'input', event=> this.#checkFields[ item.value ] = event.target.value)
					})
				])
				this.#startFields.AddChilds([field]);
			});

			let ignore = ['node', 'menu-node'];
			this.#Draw( ignore, conf, this.#bodyFields );
		}
	}
	#GetShoDataByFullName( fullName ) {
		let sought;
		function parse( node ) {
			if ( node.data && node.data.fname == fullName) sought = node;
			else {
				if ( node.childs ) {
					for (let key in node.childs) parse( node.childs[key] )
				}
			}
		}
		let node = parse(this.#data.DOCUMENT);
		return sought;
	}
	#SetDefaultValues( data ) {
		let that = this;
		function parse( defs, name ) {
			if ( typeof defs == 'object' ) {
				for (let key in defs) {
					parse(defs[key], name != '' ? `${ name }.${ key }` : key);
				}
			} else {
				let sought = that.#GetShoDataByFullName( name );
				if (sought) { 
					sought.dataContainer.Value( defs );
					if ( that.#fixedData.indexOf( sought.fname ) != -1) { 
						sought.blockContainer.DomObject.hidden = true;
						sought.dataContainer.DomObject.readOnly = true;
					}
				}
			}
		}
		parse( data, '' );
	}
	#AddNewField( parent, obj, ignore ) {
		let dataContainer;let blockContainer;
		if ( typeof obj.data !== 'undefined' && typeof obj.data.data_type !== 'undefined' && ignore.indexOf(obj.data.data_type) == -1 ) {
			blockContainer = new Div( {parent: parent} ).SetAttributes( {class: 'form-group'} ).AddChilds([
				dataContainer = new Input().SetAttributes( {class: 'form-floating', name: obj.name, type: 'text'} ).AddWatch(
					(el) => {
						el.DomObject.addEventListener( 'input', (event) => {
							obj.data.value = event.target.value;
							if ( event.target.value != "" ) el.SetAttributes( {'class': 'form-control dirty'} )
							else el.SetAttributes( {'class': 'form-control'} );
						} );
						if ( el.Value != '' ) { el.DomObject.dispatchEvent(new Event('input')); }
					}
				),
				new Label().SetAttributes( {class: 'dex-label', for: obj.name} ).Text( obj.data.description )
			]); 
			// если поле заморожено, то закроем для изменения
		} else if (typeof obj.data !== 'undefined' && obj.data.data_type == 'menu-node') {
			new Div( {parent: this.#menuFields} ).SetAttributes( {class: 'dynamic-block-title'} ).Text( obj.data.description );
		} else if ( typeof obj.data !== 'undefined' && obj.data.data_type == 'node' ) {
			new H5( {parent: parent} ).SetAttributes( {class: 'form-group'} ).Text( obj.data.description )
		}
		if ( obj.data && obj.data.fname == 'DOCUMENT.CONTRACT_INFORMATION.SIM.ICC' ) {	
			// obj.data.value = "";
			console.log( "dataContainer=> ", dataContainer );
			dataContainer.Value( "0204785615" );

		}
		return { parent: parent, dataContainer: dataContainer, blockContainer: blockContainer};
	}
	#Draw( ignore, conf, parent ) {
		let that = this;
		let cnf = {};
		function parse(obj, temp, tempName, container) {
			let fname = tempName != '' ? `${ tempName }.${ obj.name }` : obj.name;
			if ( typeof temp[obj.name] === 'undefined' ) {
				if ( obj.data ) {
					obj.data.value = '';
					obj.data.fname = fname;
				}
				container = that.#AddNewField(container, obj, ignore);
				temp[obj.name] = {fname: fname, name: obj.name, container: container.parent,  dataContainer: container.dataContainer, blockContainer: container.blockContainer, data: obj.data, childs: {}};
			}
			if ( obj.childs ) {
				obj.childs.map(item=>parse(item, temp[obj.name].childs, fname, container.parent));
			}
		}
		parse( conf.core, cnf, '', parent );
		this.#data = cnf;
		console.log('cnf=> ', cnf);
	}
	#SetTitleInfo (contract) {
		let text = typeof contract.DOCUMENT.CONTRACT_INFORMATION.SIM.ICC !== 'undefined' ? ` ICC ${ contract.DOCUMENT.CONTRACT_INFORMATION.SIM.ICC }` : '';
		text += typeof contract.DOCUMENT.CONTRACT_INFORMATION.SIM.MSISDN !== 'undefined' && contract.DOCUMENT.CONTRACT_INFORMATION.SIM.MSISDN != null ? ` Номер ${ contract.DOCUMENT.CONTRACT_INFORMATION.SIM.MSISDN }` : '';
		let unit = typeof contract.DOCUMENT.CONTRACT_INFORMATION.UNIT !== 'undefined' ? `Отделение [ ${ contract.DOCUMENT.CONTRACT_INFORMATION.UNIT } ]` : '';
		this.#titleInfo.Text( `Тип [ Новый договор ] SIM [ ${ text } ] ${ unit }` );
	}
	#ShowDocumentForm ( data ) {
		this.#fixedData = data.fixed;
		this.#SetDefaultValues(data.contract);
		this.#SetTitleInfo(data.contract);
		this.#startFields.DomObject.hidden = !this.#startFields.DomObject.hidden;
		this.#menuFields.DomObject.hidden = !this.#menuFields.DomObject.hidden;
		this.#bodyFields.DomObject.hidden = !this.#bodyFields.DomObject.hidden;
		this.Container.RemoveClass( 'check-sim-data' );		
	}
	#CheckStartFields () {
		let transport = this.Application.Transport;
		let data = {base: this.#base, action: 'checkStartFields', };
		for (let key in this.#checkFields) data[key] = this.#checkFields[key];
		transport.Get( {com: 'skyline.apps.adapters', subcom: 'appApi', data: data, hash: this.Hash} );
	};
	#Close () {
		this.Container.DeleteObject();
		this.Application.DeleteHash( this.Hash );
	};
	#GetStartFields () {
		let transport = this.Application.Transport;
		transport.Get( {com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getInitialValues', list: [
			'startFields',
			'dexDocumentConfiguration'
		], base: this.#base}, hash: this.Hash} );
	}
	#GetMenuItems ( data ) {
		let transport = this.Application.Transport;
		transport.Get( {com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getDexContractConfiguration', base: this.#base}, hash: this.Hash} );
	}
	// ПУБЛИЧНЫЕ МЕТОДЫ
	Commands ( packet ) {
		// console.log( packet );
		switch ( packet.com ) {
			case 'skyline.apps.adapters':
				switch ( packet.subcom ) {
					case 'appApi':
						switch ( packet.data.action ) {
							case 'startFields':
								console.log( 'пришли стартовые поля' );
								if ( packet.data.status == 200 ) {
									// this.#checkFields = packet.data.list.find(item=> item.name == 'startFields');;
									// console.log( "checkFields=> ", this.#checkFields );
									// let data = {};
									// data.list = packet.data.list;
									// this.#GetMenuItems( data );
								}
							break;
							case 'checkStartFields':
								if ( packet.data.status == 200 ) {
									if ( typeof packet.data.err === 'undefined' ) {
										// this.#data.DOCUMENT = packet.data.contract;
										this.#ShowDocumentForm( packet.data );

									} else {
										new this.Application.Components.AlertMessage( packet.data.err.join('<br>') );
									}
								}
								// console.log( 'пришли данные по проверке первичных полей' );
							break;
							case 'InitialValues':
								if ( packet.data.status == 200 ) {
		 							this.#InitComponent( packet.data );
								} else {
									new this.Application.Components.AlertMessage( packet.data.err.join('<br>') );
								}
							break;
						}
					break;
				}
			break;
		}
	}
}

