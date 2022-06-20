'use strict'
class AppsList extends Page {
	constructor( application ) {
		super ( application );
		this.#GetAppList();
	}
	#InitPage() {

	}
	#GetAppList() {
		this.Transport.Get({com: 'skyline.core.apps', subcom: 'list', data: {}, hash: this.Hash});
	}
	#LaunchApp(appId) {
		this.Transport.Get({com: 'skyline.core.apps', subcom: 'select', data: {appid: appId}, hash: this.Hash});
	}
	#GetAppLocation(appId) {
		this.Application.Transport.Get({com: `skyline.apps.${appId}`, subcom: 'appApi', data: {action: 'startingLocationApp'}, hash: this.Hash});
	}
	// ПУБЛИЧНЫЕ МЕТОДЫ
	Commands ( packet ) {
		console.log('packet=> ', packet);
		switch(packet.com) {
			case "skyline.core.apps":
				switch (packet.subcom) {
					case "list":
						if (typeof packet.data.list !== "undefined") {
							if (packet.data.list.length == 1) {
								// сразу запустим единственное доступное приложение
								this.#LaunchApp(packet.data.list[0].id);
							} else {
								// если приложений больше 1, покажем для выбора
								this.#InitPage();
							}
						} else {
							console.log("не доступны приложения!!!");
						}
					break;
					case "select":
						if (packet.data.status == 200) this.#GetAppLocation(packet.data.appid);
					break;
				}
			break;
			case "skyline.apps.adapters":
				switch (packet.subcom) {
					case 'appApi':
						if (packet.data.status == 200 && packet.data.action == 'startingLocationApp') {
							this.RemovePage();
							new DexolPage(this.Application);
						} else console.log( 'Неизвестная команда' );
					break;
				}
			break;
			default: console.log("неизвестная команда ", packet)
		}

	}
}

