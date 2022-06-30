'use strict'
class Report {
	#application;#parent;#hash;#base;#descriptionBase;#transport;
	#filter = {};
	#containerQuestion;#containerResult;#tableContainer;#table;
	#footerTaskSho;#footerTaskSpinSho;
	#questionTitleSho;#questionBody;
	#reportName;
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
		this.#Init();
	}

	get Base() {return this.#base;}
	get Description() {return this.#descriptionBase;}
	get Hash() {return this.#hash;}
	get Application() {return this.#application;}
	get Parent() {return this.#parent;}
	get ContainerQuestion() {return this.#containerQuestion; }
	get Transport() {return this.#transport;}
	get QuestionBody() {return this.#questionBody; }

	get ContainerResult() {return this.#containerResult; }
	set ContainerResult(sho) {return this.#containerResult = sho; }

	get FooterTaskSho() {return this.#footerTaskSho; }
	set FooterTaskSho(sho) {return this.#footerTaskSho = sho; }

	set QuestionTitle(title) {this.#questionTitleSho.Text(title); }
	set ReportName(name) {this.#reportName = name; }
	#Init() {
		this.#containerQuestion = new Div({parent: this.#parent.Container}).SetAttributes({class: "dex-dict-action-form dex-report-question d-none"}).AddChilds([
			new I().SetAttributes({class: "dex-dict-action-form-close fas fa-window-close"}).AddWatch(sho => {
				sho.DomObject.addEventListener("click", event => this.Close())
			}),
			this.#questionTitleSho = new Span().SetAttributes({class: "dex-dict-action-form-title"}),
				// .Text(`Укажите данные для формирования отчета по долгам`),
			new Div().SetAttributes({class: "dex-dict-action-form-body row dex-report-question-body"}).AddChilds([
				this.#questionBody = new Div()
			]),
			new Div().SetAttributes({class: "dex-configuration-footer"}).AddChilds([
				new Button().SetAttributes({class: "dex-dict-action-form_button"}).Text("Ok").AddWatch(sho => {
					sho.DomObject.addEventListener("click", ()=> this.CreateReport())
					//
				})
			])
		]);
	}
	ExportFile(link) {
		window.open( `${ this.#application.Transport.Url }/adapters/reports/${ link }`);
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
}

