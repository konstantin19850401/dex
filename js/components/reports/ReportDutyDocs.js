'use strict'
class ReportDutyDocs extends Report {
	#application;#parent;#hash;#base;#descriptionBase;#transport;
	#filter = {};
	#containerQuestion;#containerResult;#tableContainer;#table;
	#footerTaskSho;#footerTaskSpinSho;
	constructor (application, parent) {
		super(application, parent);
		this.ShowQuestion();
	}
	ShowQuestion() {
		// период
		let blockUnits;
		this.QuestionTitle = "Укажите данные для формирования отчета по долгам";
		this.ReportName = "Отчет по долгам";
		let period = new Period(this.Application);
		period.Container.AddClass("window-module-controls-item text-dark dex-report-question-body-period");
		let blockPeriod = new Div({parent: this.QuestionBody}).SetAttributes({class: "form-group row"}).AddChilds([
			new Label().SetAttributes({class: "col-4 col-form-label"}).Text("Укажите период"),
			period.Container
		]);
		period.OnChange(()=> {
			this.#filter.start = this.Application.Toolbox.ClientDateToServer(period.Data.start);
			this.#filter.end = this.Application.Toolbox.ClientDateToServer(period.Data.end);
		});
		this.#filter.start = this.Application.Toolbox.ClientDateToServer(period.Data.start);
		this.#filter.end = this.Application.Toolbox.ClientDateToServer(period.Data.end);

		// торговые точки
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


			// let customSelect = new CustomSelect(this.Application, blockUnits, o);
			// for (let i = 0; i < units.list.length; i++) {
			// 	o.push({value: units.list[i].dex_uid, text: units.list[i].title});
			// }
			// new Div({parent: this.QuestionBody}).SetAttributes({class: "form-group row"}).AddChilds([
			// 	new Label().SetAttributes({class: "col-4 col-form-label"}).Text("Укажите отделение"),
			// 	blockUnits = new Div().SetAttributes({class: "dex-report-action-item col-8"})
			// ]);
			// let customSelect = new CustomSelect(this.Application, blockUnits, o);
			// customSelect.OnChange((selectedItem)=> this.#filter.unit = selectedItem.value);
		}
		this.ContainerQuestion.RemoveClass("d-none");
	}
	CreateReport() {
		console.log("filter=> ", this.#filter);
		this.FooterTaskSho = new A().SetAttributes({class: "dropdown-item"}).Text(`Отчет по долгам ${this.Description}`).AddChilds([
			this.#footerTaskSpinSho = new Div().SetAttributes({class: "dex-report-process fas fa-spinner fa-pulse fa-spin"})
		]).AddWatch(sho=> sho.DomObject.addEventListener("click", event=> this.ContainerResult.RemoveClass("d-none")));
		this.Parent.NewTask = this.FooterTaskSho;
		this.ContainerQuestion.Hide();
		let packet = {com: "skyline.apps.adapters", subcom: "appApi", data: { action: 'reports', subaction: 'dutyDocs', base: this.Base, filter: this.#filter}, hash: this.Hash};
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
				new Span().SetAttributes({class: "dex-dict-action-form-title dex-report-total"}).Text(`Всего строк: ${data.list.length}`),
				new Span().SetAttributes({class: "dex-dict-action-form-title"}).Text(`Отчет по долгам для ${this.Description}`),
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
			this.Application.Toolbox.Loop({
				length: data.list.length,
				toLoop: (loop, i)=> {
					let item = data.list[i];
					let row = new Tr().SetAttributes({'uid_num': item.id});
					for (let i = 0; i < data.schema.length; i++) {
						let text = item[data.schema[i].name];
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

