'use strict'
class AppsList extends Page {
	#menu;
	constructor( application ) {
		super ( application );
		this.#InitPage();
	}
	// ГЕТТЕРЫ

	// СЕТТЕРЫ


	// ПРИВАТНЫЕ МЕТОДЫ
	#InitPage ( ) {
		this.#InitMenu();
		this.Application.Container.SetAttributes( {'class': 'application row'} );
		this.Container.SetAttributes( {class: 'apps_list'} );
		this.#GetAppList();
	}
	#InitMenu () {
		this.#menu = new this.Application.Components.Menu( this.Application, this );
	}
	#InitAppList ( list ) {
		this.Container.AddChilds( (() => {
			let blocks = [];
			list.map(( item, index ) => {
				let block;
				if ( index % 2 == 0 ) {
					block = new Div().SetAttributes( {class: 'row'} );
					blocks.push(block);
				}
				block = blocks[blocks.length - 1];
				new Div( {parent: block} ).SetAttributes( {class: 'col-6'} ).AddChilds([
					new Div().AddChilds([
						new Div().SetAttributes( {class: 'email-signature'} ).AddChilds([
							new Div().SetAttributes( {class: 'signature-icon'} ).AddChilds([
								new Img().SetAttributes( {class: 'app_logo', src: './system-media/dex_logo.png'} )
							]),
							new Div().SetAttributes( {class: 'signature-detail'} ).AddChilds([
								new H2().SetAttributes( {class: 'title'} ).Text( item.title )
							]),
							new Div().SetAttributes( {class: 'icon'} ).AddChilds([
								new Button().SetAttributes( {class: 'btns btn-primary alert_btn'} ).Text( 'Запустить' ).AddWatch( shoObject => {
										shoObject.DomObject.addEventListener( 'click', event => this.#LaunchApp( item.id ) );
								})
							])
						])
					])
				])
			})
			return blocks;
		})() );
	}
	#LaunchApp ( name ) {
		let transport = this.Application.Transport;
		console.log('попытка запустить приложение name=> ', name);
		transport.Get( {com: 'skyline.core.apps', subcom: 'select', data: {appid: name}, hash: this.Hash} );
	}
	#GetAppList ( ) {
		console.log('запросим список приложений');
		let transport = this.Application.Transport;
		transport.Get( {com: 'skyline.core.apps', subcom: 'list', data: {}, hash: this.Hash} );
	}
	// ПУБЛИЧНЫЕ МЕТОДЫ
	Commands ( packet ) {
		console.log('packet=> ', packet);
		switch ( packet.com ) {
			case 'skyline.core.apps':
				switch ( packet.subcom ) {
					case 'list':
						this.#InitAppList( packet.data.list );
					break;
					case 'select':
						if ( packet.data.status == 200 ) {
							this.Application.Transport.Get( {com: `skyline.apps.${ packet.data.appid }`, subcom: 'appApi', data: {action: 'startingLocationApp'}, hash: this.Hash} );
						} else {
							new this.Application.Components.AlertMessage( packet.data.err.join('<br>') );
						}
					break;
				}
			break;
			case 'skyline.apps.adapters':
				switch ( packet.subcom ) {
					case 'appApi':
						if ( packet.data.status == 200 && packet.data.action == 'startingLocationApp' ) {
							this.RemovePage();
							new AppPage( this.Application, packet.data.bases);
						} else console.log( 'Неизвестная команда' );
					break;
				}
			break;
			case 'skyline.apps.salesRepresentative':
				switch ( packet.subcom ) {
					case 'appApi':
						if ( packet.data.status == 200 && packet.data.action == 'startingLocationApp' ) {
							this.RemovePage();
							new AppPageSalesRepresentative( this.Application, packet.data.units);
						} else console.log('Неизвестная команда');
					break;
				}
			break;
			case 'skyline.apps.storeHouse':
				switch ( packet.subcom ) {
					case 'appApi':
						if ( packet.data.status == 200 && packet.data.action == 'startingLocationApp' ) {
							this.RemovePage();
							new StoreHouse( this.Application, packet.data.units);
						} else console.log('Неизвестная команда');
					break;
				}
			break;
			default: console.log('неизвестная команда ', packet)
		}
	}
}

