'use strict'
class Leftovers extends Report {
	#filter = {};
	#tableContainer;#table;
	#footerTaskSpinSho;
	#minimum = 5;
	constructor (application, parent) {
		super(application, parent);
		this.ShowQuestion();
	}
	ShowQuestion() {
		// период
		this.QuestionTitle = "Укажите данные для формирования отчета по остаткам";
		this.ReportName = "Отчет по остаткам";

		// торговые точки
		let blockUnits;
		let units = this.Parent.GetDictByName("stores");
		if (typeof units !== "undefined") {
			let o = [];
			new Div({parent: this.QuestionBody}).SetAttributes({class: "form-group row"}).AddChilds([
				new Label().SetAttributes({class: "col-4 col-form-label"}).Text("Укажите отделение"),
				blockUnits = new Div().SetAttributes({class: "dex-report-action-item col-8"})
			]);
			let customSelect = new CustomSelect(this.Application, blockUnits);
			customSelect.OnChange((selectedItem)=> this.#filter.unit = selectedItem.value);
			this.Application.Toolbox.Loop({
				length: units.list.length,
				toLoop: (loop, i)=> {
					customSelect.AddOption({value: units.list[i].dex_uid, text: units.list[i].title});
					loop();
				},
				callback: ()=> {
					console.log("Построение списка окончено");
				}
			});
		}

		// показывать адрес тт?
		new Div({parent: this.QuestionBody}).SetAttributes({class: "form-group row"}).AddChilds([
			new Label().SetAttributes({class: "col-4 col-form-label"}).Text(""),
			new Div().SetAttributes({class: "col-8 text-start"}).AddChilds([
				new Div().SetAttributes({class: "checkbox checkbox-inline checkbox-styled"}).AddChilds([
					new Label().AddChilds([
						new Input().SetAttributes({type: "checkbox"})
							.AddWatch(sho=> sho.DomObject.addEventListener("change", event=> this.#filter.showAddress = event.target.checked)),
						new Span().Text("Отображать ли адрес точки")
					])
				])
			])
		]);

		// показать только активные отделения
		new Div({parent: this.QuestionBody}).SetAttributes({class: "form-group row"}).AddChilds([
			new Label().SetAttributes({class: "col-4 col-form-label"}).Text(""),
			new Div().SetAttributes({class: "col-8 text-start"}).AddChilds([
				new Div().SetAttributes({class: "checkbox checkbox-inline checkbox-styled"}).AddChilds([
					new Label().AddChilds([
						new Input().SetAttributes({type: "checkbox"})
							.AddWatch(sho=> sho.DomObject.addEventListener("change", event=> this.#filter.onlyActive = event.target.checked)),
						new Span().Text("Только активные отделения")
					])
				])
			])
		]);

		// отобразить в отчете только те торговые точки, на которых остаток менее 5 сим-карт
		new Div({parent: this.QuestionBody}).SetAttributes({class: "form-group row"}).AddChilds([
			new Label().SetAttributes({class: "col-4 col-form-label"}).Text(""),
			new Div().SetAttributes({class: "col-8 text-start"}).AddChilds([
				new Div().SetAttributes({class: "checkbox checkbox-inline checkbox-styled"}).AddChilds([
					new Label().AddChilds([
						new Input().SetAttributes({type: "checkbox"})
							.AddWatch(sho=> sho.DomObject.addEventListener("change", event=> {
								this.#filter.onlyMinimum = event.target.checked;
								this.#filter.minimum = this.#minimum;
							})),
						new Span().Text(`Только отделения с остатком менее ${this.#minimum}`)
					])
				])
			])
		]);

		this.ContainerQuestion.RemoveClass("d-none");
	}
	CreateReport() {
		console.log("filter=> ", this.#filter);
		this.FooterTaskSho = new A().SetAttributes({class: "dropdown-item"}).Text(`Отчет по остаткам ${this.Description}`).AddChilds([
			this.#footerTaskSpinSho = new Div().SetAttributes({class: "dex-report-process fas fa-spinner fa-pulse fa-spin"})
		]).AddWatch(sho=> sho.DomObject.addEventListener("click", event=> this.ContainerResult.RemoveClass("d-none")));
		this.Parent.NewTask = this.FooterTaskSho;
		this.ContainerQuestion.Hide();
		let packet = {com: "skyline.apps.adapters", subcom: "appApi", data: { action: 'reports', subaction: 'leftovers', base: this.Base, filter: this.#filter}, hash: this.Hash};
		console.log("packet на сервер ", packet);
		this.Transport.Get(packet);
	}
	CreateResult(data) {
		this.ContainerResult = new Div({parent: this.Parent.Container}).SetAttributes({class: "dex-dict-action-form dex-report-question d-none dex-report-result"})
			.AddChilds([
				new I().SetAttributes({class: "dex-dict-action-form-close fas fa-window-close", title: "Закрыть"}).AddWatch(sho => {
					sho.DomObject.addEventListener("click", event => this.Close())
				}),
				new I().SetAttributes({class: "dex-dict-action-form-close fas fa-window-minimize", title: "Свернуть"}).AddWatch(sho => {
					sho.DomObject.addEventListener("click", event => this.MinimizeReport())
				}),
				new I().SetAttributes({class: "dex-dict-action-form-close fas fa-file-csv dex-export-to-excel", title: "Экспорт в файл excel"}).AddWatch(sho => {
					sho.DomObject.addEventListener("click", event => this.ExportFile(data.link))
				}),
				// new Span().SetAttributes({class: "dex-dict-action-form-title dex-report-total"}).Text(`Всего документов за период в выбранном журнале: ${data.total}`),
				new Span().SetAttributes({class: "dex-dict-action-form-title dex-report-total"}).Text(`Всего строк: ${data.list.length}`),
				new Span().SetAttributes({class: "dex-dict-action-form-title"}).Text(`Отчет по остаткам для ${this.Description}`),
				this.#tableContainer = new Div().SetAttributes({class: "dex-report-result-body dex-report-container"}),
			]);
		this.#table = new ComplexTable(this.Application, this.#tableContainer);
		if (typeof data.schema !== "undefined") {
			for (let i = 0; i < data.schema.length; i++) {
				let th = new Th().Text(data.schema[i].title);
				this.#table.AddHead(th, data.schema[i].type);
			}
		}
		// наполним данными
		if (data.list.length == 0) {
			this.#tableContainer.AddChilds([new Div().SetAttributes({class: "dex-report-result-body-empty-lable"}).Text("Нет данных для отображения")]);
			this.#footerTaskSpinSho.RemoveClass("dex-report-process fas fa-spinner fa-pulse fa-spin");
			this.#footerTaskSpinSho.AddClass("dex-report-ok fas fa-check-circle");
			this.Parent.CompleteTask();
		} else {
			let stores = this.Parent.GetDictByName("stores");
			this.Application.Toolbox.Loop({
				length: data.list.length,
				toLoop: (loop, i)=> {
					let item = data.list[i];
					let row = new Tr().SetAttributes({'uid_num': item.id});
					for (let i = 0; i < data.schema.length; i++) {
						let text = item[data.schema[i].name];
						if (data.schema[i].name == "unit") {
							let tunit = stores.list.find(item=> item.dex_uid == text);
							if (typeof tunit !== "undefined") text = tunit.title;
						}
						if (typeof text === "undefined") {
							if (data.schema[i].type == "number") text = 0;
							else text = "";
						};

						row.AddChilds([ new Td().Text(text) ]);
					}
					this.#table.AddRow(row);
					loop();
				},
				callback: ()=> {
					console.log("Построение отчета окончено");
					this.#footerTaskSpinSho.RemoveClass("dex-report-process fas fa-spinner fa-pulse fa-spin");
					this.#footerTaskSpinSho.AddClass("dex-report-ok fas fa-check-circle");
					this.Parent.CompleteTask();
				}
			});
		}
	}
	Commands ( packet ) {
		console.log(`Пакет для базы отчета ${this.Base} =>`, packet);
		switch(packet.com) {
			case "skyline.apps.adapters":
				switch(packet.subcom) {
					case "appApi":
						switch (packet.data.action) {
							case "reports":
								if (packet.data.status == 200) {
									this.CreateResult(packet.data);
								}
							break;
						}
					break;
				}
			break;
		}
	}
}

