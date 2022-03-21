'use strict'
class Lock  extends Page {
	//#application;#container;#applicationContainer;
	//#hash;
	#data = {};
	// #password = '12473513';
	#password = 'qmE142G7';
	#lockPage;
	#errors;
	constructor( application, lockPage ) {
		super( application );
		// this.#application = application;
		// this.#applicationContainer = application.Container;
		// this.#application.CurrentPage = this;
		this.#lockPage = lockPage;
		this.#InitPage();
	}
	// ГЕТТЕРЫ

	// СЕТТЕРЫ


	// ПРИВАТНЫЕ МЕТОДЫ
	#InitPage () {
		// this.#hash = this.#application.Toolbox.GenerateHash;
		// this.#application.InsertHashInHashes( this.#hash, this );
		// this.Application.Lock();
		this.Application.Container.SetAttributes( {class: 'w-100 h-100 d-flex justify-content-center'} );
		// this.Application.Container.HideFirstChilds();
		this.Container.SetAttributes( {class: 'login align-self-center'} ).AddChilds([
			new Div().AddChilds([
				new Div().SetAttributes( {class: 'card-body'} ).AddChilds([
					this.#errors = new Div().SetAttributes( {class: 'login-error'} ),
					new Div().SetAttributes( {class: 'row'} ).AddChilds([
						new Div().SetAttributes( {class: 'col align-self-start'} ).AddChilds([
							new Span().SetAttributes( {class: 'text-lg text-bold'} ).Text( 'Введите пароль' ),
							new Form().SetAttributes( {class: 'form floating-label', onsubmit: 'return false'} ).AddChilds([
								new Div().SetAttributes( {class: 'form-group floating-label'} ).AddChilds([
									new Div().SetAttributes( {class: 'input-group'} ).AddChilds([
										new Div().SetAttributes( {class: 'input-group-content col-10'} ).AddChilds([
											new Input().SetAttributes( {class: 'form-control', type: 'password', name: 'password'} ).AddWatch( (el) => {
													el.DomObject.addEventListener( 'input', (event) => {
														this.#password = event.target.value;
														if ( event.target.value != "" ) el.SetAttributes( {'class': 'form-control dirty'} )
														else el.SetAttributes( {'class': 'form-control'} );
													})
													el.Value = this.#password;
													if ( el.Value != '' ) { el.DomObject.dispatchEvent(new Event('input')); }
												}),
											new Label().SetAttributes( {for: 'password'} ).Text( 'Пароль' )
										]),
										new Div().SetAttributes( {class: 'input-group-btn col-2'} ).AddChilds([
											new Button().SetAttributes( {class: 'btns btn btn-primary'} ).Text( 'Разблокировать' ).AddWatch( (el) => {
											el.DomObject.addEventListener( 'click', ( event ) => { this.#Send(); });
										})
										])
									])
								])
							])
						])
					])
				])
			])
		]);
	}
	#Send () {
		let packet = {com: 'skyline.core.auth', subcom: 'unlocksession', data: {password: this.#password}, hash: this.Hash };
		console.log('lock=> ', packet);
		let transport = this.Application.Transport;
		transport.Get(packet);
	}
	// ПУБЛИЧНЫЕ МЕТОДЫ
	PrependPage () {
		this.Application.Container.HideFirstChilds();
	}
	RemovePage () {
		this.Container.DeleteObject();
		this.Application.DeleteHash( this.Hash );
		this.Application.Container.SetAttributes( {'class': 'application row'} );
		this.Application.Container.ShowFirstChilds();
		this.Application.CurrentPage = this.#lockPage;
	}
	Commands ( packet ) {
		console.log('===>', packet);
		switch ( packet.com ) {
			case 'skyline.core.auth':
				switch ( packet.subcom ) {
					case 'unlocksession':
						if ( packet.data.status == -1 ) this.#errors.Text( packet.data.err.join('<br>') );
						if ( packet.data.status == 1 ) this.RemovePage();
						console.log("Разблокировать");
					break;
				}
			break;
		}
	}
}

