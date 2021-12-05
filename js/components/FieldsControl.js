'use strict'
class FieldsControl {
	#parent;#container;#application;#hash;
	#leftFields;#rightFields;
	#leftArr = [];#rightArr = [];
	constructor ( application, parent) {
		this.#application = application;
		this.#parent = parent;
		this.#hash = this.#application.Toolbox.GenerateHash;
		this.#InitComponent();
	}
	// ГЕТТЕРЫ

	// СЕТТЕРЫ

	// ПРИВАТНЫЕ МЕТОДЫ
	#InitComponent () {
		this.#container = new Div( {parent: this.#parent.Container} ).SetAttributes( {class: 'fields-control'} ).AddChilds([
			new I().SetAttributes( {class: 'fields-control-close fas fa-window-close'} ).AddWatch((el)=> {
				el.DomObject.addEventListener( 'click', ()=> {
					this.#Close();
				} )
			}),
			new Span().SetAttributes( {class: 'fields-control-title'} ).Text( 'Управление полями таблицы' ),
			new Div().SetAttributes( {class: 'fields-control-body row'} ).AddChilds([
				this.#leftFields = new Div().SetAttributes( {class: 'fields-control-body-block-left col-6'} ),
				this.#rightFields = new Div().SetAttributes( {class: 'fields-control-body-block-right col-6'} )
			]),
			new Div().SetAttributes( {class: 'fields-control-footer'} ).AddChilds([
				new Button().SetAttributes( {class: 'dex-table-info-btn'} ).Text( 'Запомнить' ).AddWatch((el)=> {
					el.DomObject.addEventListener( 'click', ()=> {
						this.#Apply();
					} )
				})
			])
		]);
		this.#application.InsertHashInHashes( this.#hash, this );
		this.#GetFields();
	}
	#GetFields () {
		let transport = this.#application.Transport;
		transport.Get( {com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getDocumentFields'}, hash: this.#hash } );
	}
	#InsertFields ( position, item ) {
		let f = new Div().SetAttributes( {class: 'fields-control-body-element'} ).Text( item.title );
		if ( position == 'right' ) {
			if ( this.#rightArr.indexOf(item.uid) == -1 ) this.#rightArr.push( item.uid );
			f.AddWatch((el) => {
				el.DomObject.addEventListener( 'click', () => {
					this.#rightArr.splice( this.#rightArr.indexOf( item.uid ), 1 );
					this.#leftArr.push( item.uid );
					el.DeleteObject();
					this.#InsertFields( 'left', item );
				} )
			});
			this.#rightFields.AddChilds([f]);
		} else if ( position == 'left' ) {
			if ( this.#leftArr.indexOf(item.uid) == -1 ) this.#leftArr.push( item.uid );
			f.AddWatch((el) => {
				el.DomObject.addEventListener( 'click', () => {
					this.#leftArr.splice( this.#leftArr.indexOf( item.uid ), 1 );
					this.#rightArr.push( item.uid );
					el.DeleteObject();
					this.#InsertFields( 'right', item );
				} )
			});
			this.#leftFields.AddChilds([f]);
		}
	}
	#DrawFields ( data ) {
		// отрисуем все показываемые
		data.tableFields.shown.map(( item )=> {
			let field = data.tableFields.list.find( element => element.uid == item );
			this.#InsertFields( 'right', field );
		});
		// отрисуем все доступные
		data.tableFields.list.map(( item )=> {
			if ( this.#rightArr.indexOf( item.uid ) == -1 ) this.#InsertFields( 'left', item );
		});
	}
	#Close () {
		this.#container.DeleteObject();
		this.#application.DeleteHash( this.#hash );
	}
	#Apply () {
		let transport = this.#application.Transport;
		let packet = {com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'changeAppFields', shown: this.#rightArr, hiddens: this.#leftArr}, hash: this.#hash};
		// console.log( packet );
		transport.Get( {com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'changeAppFields', shown: this.#rightArr, hiddens: this.#leftArr}, hash: this.#hash} );
	}

	// ПУБЛИЧНЫЕ МЕТОДЫ
	Commands ( packet ) {
		console.log( 'пришел пакет для контроля полей ', packet );
		switch ( packet.com ) {
			case 'skyline.apps.adapters':
				switch ( packet.subcom ) {
					case 'appApi':
						switch ( packet.data.action ) {
							case 'getDocumentFields':
								if ( packet.data.status == 200 ) this.#DrawFields( packet.data );
							break;
							case 'changeAppFields':
								if ( packet.data.status == 200 ) {
									this.#parent.UpdatePeriod();
									this.#Close();
								}
							break;
						}
					break;
				}
			break;
		}
	}
}

