'use strict'
class ContextMenu extends Component {
	#menu;#coords;#watchers = [];#contextMenuBlocks = [];
	constructor ( application, parent) {
		super( application, parent );
		this.#Init();
	}
	#Init() {
		this.Container = new Div({parent: this.Parent.Container}).SetAttributes({class: "context-menu", "oncontextmenu": "return false"});
		this.#AddDefItems();
	};
	get GetBlocks() { return this.#contextMenuBlocks; }
	AddItems(items, container, ctxb) {
		if (typeof container === "undefined") container = this.Container;
		if (typeof ctxb === "undefined") ctxb = this.#contextMenuBlocks;
		for (let i = 0; i < items.length; i++) {
			if (typeof items[i].items !== "undefined") {
				let containerSubMenu;
				new Li({parent: container}).SetAttributes({class: "menu-item submenu"}).AddChilds([
					new Button().SetAttributes({class: "menu-btn", type: "button"}).AddChilds([
						new I().SetAttributes({class: items[i].icon}),
						new Span().SetAttributes({class: "menu-text"}).Text(items[i].title)
					]),
					containerSubMenu = new Div().SetAttributes({class: "context-menu"})
				])
				let stxbSubMenu = {name: items[i].name, items: [], sho: containerSubMenu};
				ctxb.push(stxbSubMenu);
				this.AddItems(items[i].items, containerSubMenu, stxbSubMenu.items);
			} else {
				container.AddChilds([
					new Li().SetAttributes({class: "menu-item"}).AddChilds([
						new Button().SetAttributes({class: "menu-btn", type: "button"}).AddChilds([
							new I().SetAttributes({class: items[i].icon}),
							new Span().SetAttributes({class: "menu-text"}).Text(items[i].title)
						])
					]).AddWatch(sho=> sho.DomObject.addEventListener("click", event=> {this.#WatchContextMenuItem(items[i])} ))
				]);
				ctxb.push({name: items[i].name, sho: container});
			}
		}
	}
	#HandleWatches(item) {
		console.log("надо проверить есть ли обработчик ", this.#watchers);
		for (let i = 0; i < this.#watchers.length; i++) {
			if (this.#watchers[i].name == "watchContextMenuItems") {
				console.log("есть обработчки для выбранных элементов меню");
				this.#watchers[i].func("watchContextMenuItems", item);
			}
		}
	}
	#WatchContextMenuItem(item) {
		console.log("Выбран элемент меню ", item);
		this.#HandleWatches(item);
	}
	#AddDefItems() {
	};
	Hide() {
		this.Container.ToggleClass("show-menu");
	};
	Show() {
		this.Container.AddClass("show-menu");
		// console.log("===>");
	};
	AddWatch(conf) {
		this.#watchers.push({name: conf.name, func: conf.func});
	}
}

