'use strict'
class Login extends Page {
	#data = { login: '', password: '' };
	#errors;
	constructor( application ) {
		super( application );
		this.#data.login = 'admin';
		this.#data.password = '12473513';
		// this.#data.login = 'user169';
		// this.#data.password = 'qmE142G7';
		// this.#data.login = 'geldt';
		// this.#data.password = '17342514';
		this.#InitPage();
	}
	// ПРИВАТНЫЕ МЕТОДЫ
	#InitPage () {
		this.Application.Container.SetAttributes( {class: 'w-100 h-100 d-flex justify-content-center'} );
		this.Container.SetAttributes( {class: 'login align-self-center'} ).AddChilds([
			this.#errors = new Div().SetAttributes( {class: 'login-error'} ),
			new Div().AddChilds([
				new Div().SetAttributes( {class: 'card-body'} ).AddChilds([
					new Div().SetAttributes( {class: 'row'} ).AddChilds([
						new Div().SetAttributes( {class: 'col align-self-start'} ).AddChilds([
							new Span().SetAttributes( {class: 'text-lg text-bold text-primary'} ),
							new Form().SetAttributes( {class: 'form floating-label', onsubmit: 'return false'} ).AddChilds([
								new Div().SetAttributes( {class: 'form-group'} ).AddChilds([
									new Input().SetAttributes( {class: 'form-control', name: 'login', type: 'text'} ).AddWatch(
										(el) => {
											el.DomObject.addEventListener( 'input', (event) => {
												this.#data.login = event.target.value;
												if ( event.target.value != "" ) el.SetAttributes( {'class': 'form-control dirty'} )
												else el.SetAttributes( {'class': 'form-control'} );
											} );
											el.Value( this.#data.login );
											if ( el.Value != '' ) { el.DomObject.dispatchEvent(new Event('input')); }
										}
									),
									new Label().SetAttributes( {for: 'login'} ).Text( 'Логин' )
								]),
								new Div().SetAttributes( {class: 'form-group'} ).AddChilds([
									new Input().SetAttributes( {class: 'form-control', name: 'password', type: 'password'} ).
										AddWatch((el) => {
											el.DomObject.addEventListener( 'input', (event) => {
												this.#data.password = event.target.value;
												if ( event.target.value != "" ) el.SetAttributes( {'class': 'form-control dirty'} )
												else el.SetAttributes( {'class': 'form-control'} );
											} );
											el.Value( this.#data.password );
											if ( el.Value != '' ) { el.DomObject.dispatchEvent(new Event('input')); }

										}),
									new Label().SetAttributes( {for: 'password'} ).Text( 'Пароль' )
								]),
								new Div().SetAttributes( {class: 'row'} ).AddChilds([
									new Div().SetAttributes( {class: 'col-6 text-start'} ).AddChilds([
										new Div().SetAttributes( {class: 'checkbox checkbox-inline checkbox-styled'} ).AddChilds([
											new Label().AddChilds([
												new Input().SetAttributes( {type: 'checkbox'} ),
												new Span().Text( 'Запомнить меня' )
											])
										])
									]),
									new Div().SetAttributes( {class: 'col-6 text-end'} ).AddChilds([
										new Button().SetAttributes( {class: 'btns btn-primary', type: 'submit'} ).Text( 'ВОЙТИ' ).AddWatch(( el ) => {
												el.DomObject.addEventListener( 'click', ( event ) => { this.#SignIn(); });
											})
									])
								]),
							])
						])
					])
				])
			])
		])
	}
	#SignIn () {
		this.Application.Transport.Get(
			{com: 'skyline.core.auth', subcom: 'initsession', data: {login: this.#data.login, password: this.#data.password}, hash: this.Hash }
		);
	}
	// ПУБЛИЧНЫЕ МЕТОДЫ
	Commands ( packet ) {
		console.log(packet);
		switch ( packet.status ) {
			case 200:
				this.RemovePage();
				new AppsList( this.Application );
			break;
			case 401:
				this.#errors.Text( packet.data.err.join('<br>') );
			break;
		}
	}
}

