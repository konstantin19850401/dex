'use strict'
class SubdealerSales extends Report {
	#filter = {};
	#tableContainer;#table;
	#footerTaskSpinSho;
	#minimum = 5;
	constructor (application, parent) {
		super(application, parent);
		this.ShowQuestion();
	}
	ShowQuestion() {
		this.QuestionTitle = "Укажите данные для формирования отчета по продажам";
		this.ReportName = "Отчет по продажам";

		// период
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

		this.ContainerQuestion.RemoveClass("d-none");
	}
	CreateReport() {
		console.log("filter=> ", this.#filter);
		this.FooterTaskSho = new A().SetAttributes({class: "dropdown-item"}).Text(`Отчет по продажам за период ${this.Description}`).AddChilds([
			this.#footerTaskSpinSho = new Div().SetAttributes({class: "dex-report-process fas fa-spinner fa-pulse fa-spin"})
		]).AddWatch(sho=> sho.DomObject.addEventListener("click", event=> this.ContainerResult.RemoveClass("d-none")));
		this.Parent.NewTask = this.FooterTaskSho;
		this.ContainerQuestion.Hide();
		let packet = {com: "skyline.apps.adapters", subcom: "appApi", data: { action: 'reports', subaction: 'subdealerSales', base: this.Base, filter: this.#filter}, hash: this.Hash};
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
				// new I().SetAttributes({class: "dex-dict-action-form-close fas fa-file-csv dex-export-to-excel", title: "Экспорт в файл excel"}).AddWatch(sho => {
				// 	sho.DomObject.addEventListener("click", event => this.ExportFile(data.link))
				// }),
				new Span().SetAttributes({class: "dex-dict-action-form-title dex-report-total"}).Text(`Всего регистраций за выбранный период: ${data.total}`),
				// new Span().SetAttributes({class: "dex-dict-action-form-title dex-report-total"}).Text(`Всего строк: ${data.list.cnt}`),
				new Span().SetAttributes({class: "dex-dict-action-form-title"}).Text(`Отчет по регистрациям для ${this.Description}`),
				this.#tableContainer = new Div().SetAttributes({class: "dex-report-result-body dex-report-container"}),
			]);
		// this.#table = new ComplexTable(this.Application, this.#tableContainer);
		// if (typeof data.schema !== "undefined") {
		// 	for (let i = 0; i < data.schema.length; i++) {
		// 		let th = new Th().Text(data.schema[i].title);
		// 		this.#table.AddHead(th, data.schema[i].type);
		// 	}
		// }
		// // наполним данными
		// if (data.total == 0) {
		// 	this.#tableContainer.AddChilds([new Div().SetAttributes({class: "dex-report-result-body-empty-lable"}).Text("Нет данных для отображения")]);
		// 	this.#footerTaskSpinSho.RemoveClass("dex-report-process fas fa-spinner fa-pulse fa-spin");
		// 	this.#footerTaskSpinSho.AddClass("dex-report-ok fas fa-check-circle");
		// 	this.Parent.CompleteTask();
		// } else {
		// 	let row = new Tr().SetAttributes({'uid_num': 0});
		// 	for (let i = 0; i < data.schema.length; i++) {
		// 		if (typeof data.list[data.schema[i].name] !== "undefined") {
		// 			let text = data.list[data.schema[i].name];
		// 			if (typeof text === "undefined") {
		// 				if (data.schema[i].type == "number") text = 0;
		// 				else text = "";
		// 			};
		// 			row.AddChilds([ new Td().Text(text) ]);
		// 		}
		// 	}
		// 	this.#table.AddRow(row);
		// 	this.#footerTaskSpinSho.RemoveClass("dex-report-process fas fa-spinner fa-pulse fa-spin");
		// 	this.#footerTaskSpinSho.AddClass("dex-report-ok fas fa-check-circle");
		// 	this.Parent.CompleteTask();
		// }

		let labels = [], chartData = [];
		data.schema.map(item=> {
			labels.push(item.name);
			chartData.push(data.list[item.name]);
		});

		let width = this.#tableContainer.DomObject.clientWidth;
		let height = this.#tableContainer.DomObject.clientHeight;

		let canvas = new Canvas({parent: this.#tableContainer}).SetAttributes({width: width, height: height});
		let ctx = canvas.DomObject.getContext('2d');
		let chart = new Chart(ctx, {
			type: "line",
			data: {
				labels: labels,
				datasets: [{
					label: "Регистрации",
					data: chartData,
					fill: false,
				    borderColor: 'rgb(75, 192, 192)',
				    tension: 0.1
				}]
			}
		});


		this.#footerTaskSpinSho.RemoveClass("dex-report-process fas fa-spinner fa-pulse fa-spin");
		this.#footerTaskSpinSho.AddClass("dex-report-ok fas fa-check-circle");
		this.Parent.CompleteTask();
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

