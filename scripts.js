//Modal
const Modal = {
	open(el){	//Abri modal	->	Add class active ao modal
		document
		.querySelector(".modal-overlay")
		.classList
		.add("active");
	},
	close(){	//fechar o modal	->	Remover a class active do modal
		document
		.querySelector(".modal-overlay")
		.classList
		.remove("active");
	}
}

//Responsável pelo armazenamento
const Storage = {
	get(){
		return JSON.parse( localStorage.getItem("dev.finances:transactions") ) || [];
	},
	set(transactions){
		return localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions));
	}
}

//Transações
const Transaction = {
	all: Storage.get(),
	add(transaction){
		Transaction.all.push(transaction);

		App.reload();
	},
	remove(index){
		Transaction.all.splice(index, 1);

		App.reload();
	},
	incomes(){
		let income = 0;

		Transaction.all.forEach( transaction => { 
			if(transaction.amount > 0){
				income += transaction.amount;
			}
		 })
		
		return income;
	},
	expenses(){
		let expense = 0;

		Transaction.all.forEach( transaction => { 
			if(transaction.amount < 0){
				expense += transaction.amount;
			}
		 })
		
		return expense;
	},
	total(){
		return Transaction.incomes() + Transaction.expenses();
	}
}

//Esquema da página
const DOM = {
	transactionContainer : document.querySelector("#data-table tbody")
	,addTransaction( transaction, index ){
		const tr 	= document.createElement("tr");
		const tBody = document.querySelector("tbody")

		tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
		tr.dataset.index = index;

		DOM.transactionContainer.appendChild(tr);

	},innerHTMLTransaction( transaction, index ){

		let CSSClass 	= transaction.amount >= 0 ? 'income' : 'expense';
		let amount		= Utils.formatCurrency( transaction.amount );

		const html = `
			<td class="description">${ transaction.description }</td>
			<td class="${ CSSClass }">${ amount }</td>
			<td class="date">${ transaction.date }</td>
			<td>
				<img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transa&ccedil;&atilde;o">
			</td>
		`

		return html
	},updateBalance(){
		document
			.querySelector("#incomeDisplay")
			.innerHTML = Utils.formatCurrency(Transaction.incomes());

		document
			.querySelector("#expenseDisplay")
			.innerHTML = Utils.formatCurrency(Transaction.expenses());
		
		document
			.querySelector("#totalDisplay")
			.innerHTML = Utils.formatCurrency(Transaction.total());
	},clearTransactions(){
		DOM.transactionContainer.innerHTML = "";
	}
}

//Utilidades
const Utils = {
	formatCurrency(value){
		const signal = Number(value) < 0 ? "-" : "";

		value = String(value).replace(/\D/g, "")
		
		value = Number(value) / 100

		value = value.toLocaleString("pt-BR", {
			style: "currency",
			currency: "BRL"
		})

		return signal + value
	},
	formatAmount(value){
		return ( Number( value ) * 100 ) // Number(value.replace(/\,\./g, "")) * 100
	},
	formatDate(date){
		const splittedDate = date.split("-");
		
		return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
	}
}

//Ações do Componente formulário
const Form = {
	description:	document.querySelector("input#description"),
	amount:			document.querySelector("input#amount"),
	date:			document.querySelector("input#date"),

	getValues(){
		return {
			description:	Form.description.value,
			amount:			Form.amount.value,
			date:			Form.date.value
		}
	},
	validateFields(){
		const { description, amount, date } = Form.getValues();

		if ( 	description.trim() == "" ||
				amount.trim() == "" || 
				date.trim() == "" ){

				throw new Error("Favor preencha todos os campos!");		
		}
	},
	formatValues(){
		let { description, amount, date } = Form.getValues();

		amount = Utils.formatAmount(amount);
		date = Utils.formatDate(date);

		return {
			description,
			amount,
			date
		}
	},
	saveTransaction(transaction){
		Transaction.add(transaction);
	},
	clearFields(){
		Form.description.value	= "";
		Form.amount.value 		= "";
		Form.date.value			= "";
	},
	submit(event){
		event.preventDefault();
		
		try {
			Form.validateFields();						//1 - Valida dados do formulário
			const transaction = Form.formatValues();	//2 - Formata os campos necessários para exibição ao usuário		
			Form.saveTransaction(transaction);			//3 - Salva a transaction
			Form.clearFields();							//4 - Limpa os campos inputs do formulário utilizado pelo modal
			Modal.close();								//5 - Fecha a janela do modal
			App.reload();								//6 - Recarrega a aplicação
		} catch (error){
			alert(error.message)
		}
		
	}
}

//Controla aplicação
const App = {
	init(){
		//Exibe transações
		Transaction.all.forEach( (transaction, index) => //Transaction.all.forEach(DOM.addTransaction);
			DOM.addTransaction(transaction, index)
		);

		//Atualiza valores
		DOM.updateBalance();
		
		//Carrego as informações do Localstorage
		Storage.set(Transaction.all);

	},
	reload(){
		DOM.clearTransactions();
		App.init();
	}
}

App.init();

