'use strict'
class Activation extends Report {
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
		this.QuestionTitle = "Укажите данные для формирования отчета сверка по активации";
		this.ReportName = "Сверка по активации";

		let containerForsverka, tableSverka;
		let headers = ["MSISDN"];

		// данные из буфера и их обработка
		new Div({parent: this.QuestionBody}).SetAttributes({class: "form-group row"}).AddChilds([
			new Label().SetAttributes({class: "col-4 col-form-label"}).Text("Данные из буфера обмена"),
			new Div().SetAttributes({class: "dex-report-action-item col-8"}).AddChilds([
				new Textarea().SetAttributes({class: 'col-sm-12'}).AddWatch(sho=> {
					sho.DomObject.addEventListener('input', event=> {
						tableSverka.ClearHead();
						tableSverka.ClearBody();
						headers = ["MSISDN"];
						let rows = event.target.value.split(/\n/g);
						if (rows != '') {
							// сначала узнаем, сколько колонок
							let colLength = 0;
							for (let i = 0; i < rows.length; i++) {
								if (rows[i] != '') {
									let temp = rows[i].split('\t');
									if (colLength < temp.length) colLength = temp.length;
								}
							}
							for (let i = 1; i < colLength; i++) headers.push(`s${i-1}`);
							for (let i = 0; i < headers.length; i++) {
								let newHeader = new Th().SetAttributes( ).Text( headers[i] );
								tableSverka.AddHead( newHeader );
							}



							this.#filter.sims = [];
							let d = [];
							for (let i = 0; i < rows.length; i++) {
								if (rows[i] != '') {
									let temp = rows[i].split('\t');
									let tdRows = [];
									let attrs = {'uid_num': i};
									let row = new Tr().SetAttributes( attrs );
									let dataRow = {};
									let sim = {};
									for (let j = 0; j < temp.length; j++) {
										sim[headers[j]] = temp[j];
										dataRow[headers[j]] = temp[j];
										tdRows.push(new Td().Text(temp[j]));
										row.AddChilds(tdRows);
									}
									this.#filter.sims.push(sim);
									d.push(dataRow);
									tableSverka.AddRow( row );
								}
							}
						}
						event.target.value = '';
					})
				})
			])
		]);

		this.ContainerQuestion.DomObject.style.top = 0;
		this.ContainerQuestion.DomObject.style.marginTop = 0;
		new Div({parent: this.QuestionBody}).SetAttributes({class: "form-group row"}).AddChilds([
			new Label().SetAttributes({class: "col-4 col-form-label"}).Text(""),
			containerForsverka = new Div().SetAttributes({class: "dex-report-action-item col-8 h-25"})
		]);
		tableSverka = new ComplexTable( this.Application, containerForsverka);
		// for (let i = 0; i < headers.length; i++) {
		// 	let newHeader = new Th().SetAttributes( ).Text( headers[i] );
		// 	tableSverka.AddHead( newHeader );
		// }
		tableSverka.Container.DomObject.style.height = "150px";

		// параметры журнала
		let blockJournalParams;
		let journalParams = [
			{value: "journal", text: "Только данные журнала"},
			{value: "archive", text: "Только данные архива"},
			{value: "journalAndArchive", text: "Данные журнала и архива"},
		];
		new Div({parent: this.QuestionBody}).SetAttributes({class: "form-group row"}).AddChilds([
			new Label().SetAttributes({class: "col-4 col-form-label"}).Text("Параметры журнала"),
			blockJournalParams = new Div().SetAttributes({class: "dex-report-action-item col-8"})
		]);
		let journalParamsСustomSelect = new CustomSelect(this.Application, blockJournalParams);
		journalParamsСustomSelect.OnChange((selectedItem)=> this.#filter.journalParams = selectedItem.value);
		for (let i = 0; i < journalParams.length; i++) {
			journalParamsСustomSelect.AddOption({value: journalParams[i].value, text: journalParams[i].text});
		}
		journalParamsСustomSelect.SelectItem("journal");

		// отображать номер партии?
		new Div({parent: this.QuestionBody}).SetAttributes({class: "form-group row"}).AddChilds([
			new Label().SetAttributes({class: "col-4 col-form-label"}).Text(""),
			new Div().SetAttributes({class: "col-8 text-start"}).AddChilds([
				new Div().SetAttributes({class: "checkbox checkbox-inline checkbox-styled"}).AddChilds([
					new Label().AddChilds([
						new Input().SetAttributes({type: "checkbox"})
							.AddWatch(sho=> sho.DomObject.addEventListener("change", event=> this.#filter.showPartyNum = event.target.checked)),
						new Span().Text("Отображать ли номер партии")
					])
				])
			])
		]);

		// отображать номер баланс?
		new Div({parent: this.QuestionBody}).SetAttributes({class: "form-group row"}).AddChilds([
			new Label().SetAttributes({class: "col-4 col-form-label"}).Text(""),
			new Div().SetAttributes({class: "col-8 text-start"}).AddChilds([
				new Div().SetAttributes({class: "checkbox checkbox-inline checkbox-styled"}).AddChilds([
					new Label().AddChilds([
						new Input().SetAttributes({type: "checkbox"})
							.AddWatch(sho=> sho.DomObject.addEventListener("change", event=> this.#filter.showBalance = event.target.checked)),
						new Span().Text("Отображать ли баланс")
					])
				])
			])
		]);

		// отображать доп данные ?(данные абонента)
		new Div({parent: this.QuestionBody}).SetAttributes({class: "form-group row"}).AddChilds([
			new Label().SetAttributes({class: "col-4 col-form-label"}).Text(""),
			new Div().SetAttributes({class: "col-8 text-start"}).AddChilds([
				new Div().SetAttributes({class: "checkbox checkbox-inline checkbox-styled"}).AddChilds([
					new Label().AddChilds([
						new Input().SetAttributes({type: "checkbox"})
							.AddWatch(sho=> sho.DomObject.addEventListener("change", event=> this.#filter.showUserData = event.target.checked)),
						new Span().Text("Отображать ли данные абонента")
					])
				])
			])
		]);

		this.ContainerQuestion.RemoveClass("d-none");
	}
	CreateReport() {
		console.log("filter=> ", this.#filter);
		this.FooterTaskSho = new A().SetAttributes({class: "dropdown-item"}).Text(`Отчет сверка по активации ${this.Description}`).AddChilds([
			this.#footerTaskSpinSho = new Div().SetAttributes({class: "dex-report-process fas fa-spinner fa-pulse fa-spin"})
		]).AddWatch(sho=> sho.DomObject.addEventListener("click", event=> this.ContainerResult.RemoveClass("d-none")));
		this.Parent.NewTask = this.FooterTaskSho;
		this.ContainerQuestion.Hide();
		let packet = {com: "skyline.apps.adapters", subcom: "appApi", data: { action: 'reports', subaction: 'activation', base: this.Base, filter: this.#filter}, hash: this.Hash};
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
				new Span().SetAttributes({class: "dex-dict-action-form-title"}).Text(`Сверка по активации для ${this.Description}`),
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

