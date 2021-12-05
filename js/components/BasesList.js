'use strict'
class BasesList extends Component {
	#bases;#basesSelect;#errors;
	constructor ( application, parent, bases ) {
		super( application, parent );
		this.#bases = bases;
		this.#InitComponent();
	}
	// ГЕТТЕРЫ

	// СЕТТЕРЫ

	// ПРиватные методы
	#InitComponent() {
		let checkbox;
		this.Container = new Div( {parent: this.Parent.Container} ).SetAttributes( {class: 'bases-list'} ).AddChilds([
			new I().SetAttributes( {class: 'bases-list-close fas fa-window-close'} ).AddWatch((el)=> {
				el.DomObject.addEventListener( 'click', ()=> {
					this.#Close();
				} )
			}),
			new Span().SetAttributes( {class: 'bases-list-title'} ).Text( `Доступные вам для работы базы` ),
			new Div().SetAttributes( {class: 'bases-list-body'} ).AddChilds([
				this.#errors = new Div().SetAttributes( {class: 'bases-list-error'} ),
				this.#basesSelect = new Select().SetAttributes( {class: 'bases-list-select'} ),
				new Button().SetAttributes( {class: 'bases-list-btn'} ).Text( 'Подключиться' ).AddWatch((el)=> {
					el.DomObject.addEventListener( 'click', event => this.#LaunchApp( this.#basesSelect.Value ))
				}),
				new Div().SetAttributes( {class: 'form-check'} ).AddChilds([
					checkbox = new Input().SetAttributes( {class: 'form-check-input', type: 'checkbox', checked: 'true'} ),
					new Label().SetAttributes( {class: 'form-check-label'} ).Text( 'Сбросить параметры поиска' ).AddWatch(shoObject => {
						shoObject.DomObject.addEventListener('click', event => checkbox.DomObject.checked = !checkbox.DomObject.checked )
					})
				])
			]),
		]);
		this.#basesSelect.AddChild( new Option().Value( -1 ).Text( '--Выберите базу--' ) );
		this.#bases.map( base => this.#basesSelect.AddChild( new Option().Value( base.id ).Text( base.description )) );
	}
	#Close () {
		this.Container.DeleteObject();
	}
	#LaunchApp ( base ) {
		if ( typeof base === 'undefined' ) this.#errors.Text( 'Выберите базу' );
		else {
			let data = { action: 'list', subaction: 'period', base: base };
			let packet = { com: 'skyline.apps.adapters', subcom: 'appApi', data: data, hash: this.Hash};
			let transport = this.Application.Transport;
			transport.Get( packet );
		}
	}
	Commands ( packet ) {
		switch ( packet.com ) {
			case 'skyline.apps.adapters':
				switch ( packet.subcom ) {
					case 'appApi':
						if ( packet.data.status == 200 ) {
							if ( typeof packet.data.err !== 'undefined' && packet.data.err.length > 0 ) {
								this.#errors.Text( packet.data.err.join('<br>') );
							} else if ( packet.data.action == 'list' ) {
								this.#Close();
								this.Parent.Commands( packet );
								// this.Parent.WindowsPanel.AddMenuNewItem( 'sassss', packet.data.base );
							}
						}
					break;
				}
			break;
		}
	}
}

