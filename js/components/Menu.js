'use strict'
class Menu extends Component {
	#leftElements;
	constructor ( application, parent ) {
		super( application, parent );
		this.#InitComponent();
	}
	// ГЕТТЕРЫ

	// СЕТТЕРЫ

	// ПРиватные методы
	#InitComponent() {
		this.Container = new Div( {parent: this.Parent.Container} ).SetAttributes( {class: 'dex-menu'} ).AddChilds([
			this.#leftElements = new Span().SetAttributes( {class: 'dex-menu-left'} ).AddChilds([
			]),
			new Span().SetAttributes( {class: 'dex-menu-right'} ).AddChilds([
				new Button().SetAttributes( {class: 'dex-menu-btn'} ).AddChilds([
					new I().SetAttributes( {class: 'fas fa-user'} )
				]),
				new Button().SetAttributes( {class: 'dex-menu-btn'} ).AddChilds([
					new I().SetAttributes( {class: 'fas fa-lock'} )
				]).AddWatch( shoObject => {
					shoObject.DomObject.addEventListener( 'click', event => this.#LockSession() );
				}),
				new Button().SetAttributes( {class: 'dex-menu-btn'} ).AddChilds([
					new I().SetAttributes( {class: 'fas fa-sign-out-alt'} )
				]).AddWatch( shoObject => {
					shoObject.DomObject.addEventListener( 'click', event => this.#KillSession() )
				})
			])
		]);

	}
	#LockSession () {
		let transport = this.Application.Transport;
		transport.Get( {com: 'skyline.core.auth', subcom: 'locksession', data: {}, hash: this.Hash} );
	}
	#KillSession () {
		let transport = this.Application.Transport;
		transport.Get( {com: 'skyline.core.auth', subcom: 'killsession', data: {}, hash: this.Hash} );
	}
	// публичные методы
	AddMenuNewItem ( configuration ) {
		configuration.map( item => {
			let ul;
			let button;
			let dropdown = new Div().SetAttributes( {class: 'dex-dropdown'} ).AddChilds([
				button = new Button().SetAttributes( {class: 'dex-menu-btn'} ).Text( item.text ).AddWatch(shoObject => {
					shoObject.DomObject.addEventListener( 'click', event => {
						shoObject.AddClass( 'active-dropdown' );
						ul.AddClass( 'show' );
					})
				}),
				ul = new Ul().SetAttributes( {class: 'dex-dropdown-menu'} ).AddChilds(
					(()=> {
						let arr = [];
						if ( typeof item.childs !== 'undefined' && item.childs.length > 0 ) {
							item.childs.map(child => {
								let li = new Li().AddChilds([
									new A().SetAttributes( {class: 'dex-dropdown-item'} ).Text( child.text ).AddWatch(shoObject => {
										shoObject.DomObject.addEventListener('click', event => {
											button.AddClass( 'active-dropdown' );
											ul.AddClass( 'show' );
											if ( child.watch ) child.watch();
										})
									})
								])
								arr.push( li );
							})
						}
						return arr;
					})()
				)
			]);
			this.#leftElements.AddChilds([ dropdown ]);
		})
	}

	Commands ( packet ) {
		switch ( packet.com ) {
			case 'skyline.core.auth':
				switch ( packet.subcom ) {
					case 'killsession':
						if ( packet.data.status == 200 ) {
							this.Application.DeleteAllHash();
							new Login( this.Application );
						}
					break;
					case 'locksession':
						if ( packet.data.status == 200 ) {
							new Lock( this.Application );
						}
					break;
				}
			break;
		}
	}
}

