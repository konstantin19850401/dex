'use strict'
class ReportDutyDocs {
	#application;#parent;#hash;#base;#descriptionBase;#transport;
	#filter = {};
	#containerQuestion;#containerResult;#tableContainer;#table;
	#footerTaskSho;#footerTaskSpinSho;
	constructor (application, parent) {
		this.#application = application;
		this.#parent = parent;
		this.#hash = application.Toolbox.GenerateHash;
		this.#transport = application.Transport;
		this.#application.InsertHashInHashes(this.#hash, this);
		if (typeof parent !== "undefined") {
			this.#base = parent.Name;
			this.#descriptionBase = parent.Description;
		}
	}
	ShowQuestion() {
		let units;let formBody;let blockUnits;
		this.#containerQuestion = new Div({parent: this.#parent.Container}).SetAttributes({class: "dex-dict-action-form dex-report-question"}).AddChilds([
			new I().SetAttributes({class: "dex-dict-action-form-close fas fa-window-close"}).AddWatch(sho => {
				sho.DomObject.addEventListener("click", event => this.Close())
			}),
			new Span().SetAttributes({class: "dex-dict-action-form-title"})
				.Text(`Укажите данные для формирования отчета по долгам`),
			new Div().SetAttributes({class: "dex-dict-action-form-body row dex-report-question-body"}).AddChilds([
				formBody = new Div()
			]),
			new Div().SetAttributes({class: "dex-configuration-footer"}).AddChilds([
				new Button().SetAttributes({class: "dex-dict-action-form_button"}).Text("Ok").AddWatch(sho => {
					sho.DomObject.addEventListener("click", ()=> this.#CreateReport())
				})
			])
		]);
		// период
		let period = new Period(this.#application);
		period.Container.AddClass("window-module-controls-item text-dark dex-report-question-body-period");
		let blockPeriod = new Div({parent: formBody}).SetAttributes({class: "form-group row"}).AddChilds([
			new Label().SetAttributes({class: "col-4 col-form-label"}).Text("Укажите период"),
			period.Container
		]);
		period.OnChange(()=> {
			this.#filter.start = this.#application.Toolbox.ClientDateToServer(period.Data.start);
			this.#filter.end = this.#application.Toolbox.ClientDateToServer(period.Data.end);
		});
		this.#filter.start = this.#application.Toolbox.ClientDateToServer(period.Data.start);
		this.#filter.end = this.#application.Toolbox.ClientDateToServer(period.Data.end);

		// торговые точки
		units = this.#parent.GetDictByName("stores");
		if (typeof units !== "undefined") {
			let o = [];
			for (let i = 0; i < units.list.length; i++) {
				o.push({value: units.list[i].dex_uid, text: units.list[i].title});
			}
			new Div({parent: formBody}).SetAttributes({class: "form-group row"}).AddChilds([
				new Label().SetAttributes({class: "col-4 col-form-label"}).Text("Укажите отделение"),
				blockUnits = new Div().SetAttributes({class: "dex-report-action-item col-8"})
			]);
			let customSelect = new CustomSelect(this.#application, blockUnits, o);
			customSelect.OnChange((selectedItem)=> this.#filter.unit = selectedItem.value);
		}

	}
	#CreateReport() {
		console.log("filter=> ", this.#filter);
		this.#footerTaskSho = new A().SetAttributes({class: "dropdown-item"}).Text(`Отчет по долгам ${this.#descriptionBase}`).AddChilds([
			this.#footerTaskSpinSho = new Div().SetAttributes({class: "dex-report-process fas fa-spinner fa-pulse fa-spin"})
		]).AddWatch(sho=> sho.DomObject.addEventListener("click", event=> this.#containerResult.RemoveClass("d-none")));
		this.#parent.NewTask = this.#footerTaskSho;
		this.#containerQuestion.Hide();
		let packet = {com: "skyline.apps.adapters", subcom: "appApi", data: { action: 'reports', subaction: 'dutyDocs', base: this.#base, filter: this.#filter}, hash: this.#hash};
		this.#transport.Get(packet);
	}
	CreateResult(data) {
		this.#containerResult = new Div({parent: this.#parent.Container}).SetAttributes({class: "dex-dict-action-form dex-report-question d-none dex-report-result"})
			.AddChilds([
				new I().SetAttributes({class: "dex-dict-action-form-close fas fa-window-close"}).AddWatch(sho => {
					sho.DomObject.addEventListener("click", event => this.Close())
				}),
				new Span().SetAttributes({class: "dex-dict-action-form-title"}).Text(`Отчет по долгам для ${this.#descriptionBase}`),
				this.#tableContainer = new Div().SetAttributes({class: "dex-report-result-body dex-report-container"}),
				new Div().SetAttributes({class: "dex-configuration-footer"}).AddChilds([
					new Button().SetAttributes({class: "dex-dict-action-form_button"}).Text("Свернуть").AddWatch(sho => {
						sho.DomObject.addEventListener("click", ()=> this.MinimizeReport())
					})
				])
			]);
		this.#table = new ComplexTable(this.#application, this.#tableContainer);
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
			this.#parent.CompleteTask();
		} else {
			this.#application.Toolbox.Loop({
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
					this.#parent.CompleteTask();
				}
			});
		}
	}
	MinimizeReport() {
		this.#containerResult.AddClass("d-none");
	}
	Close() {
		this.#containerQuestion.DeleteObject();
		if (typeof this.#containerResult !== "undefined") this.#containerResult.DeleteObject();
		if (typeof this.#footerTaskSho !== "undefined") this.#footerTaskSho.DeleteObject();
		this.#parent.DeleteTask();
		this.#application.DeleteHash( this.#hash );
	}
	Commands ( packet ) {
		console.log(`Пакет для базы отчета ${this.#base} =>`, packet);
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

