const moment = require('moment');
const fs = require('fs');
const parse = require('csv-parse/lib/sync');
const log4js = require('log4js');
const readline = require('readline-sync');

log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});

const logger = log4js.getLogger('index.js');

logger.info('Program starts');

class Transaction{
    constructor(transaction) {
        this.transaction = transaction;
    }
    date() {
        return this.transaction.Date;
    } 
    from() {
        return this.transaction.From;
    }
    to() {
        return this.transaction.To;
    }
    narrative() {
        return this.transaction.Narrative;
    }
    amount() {
        return parseFloat(this.transaction.Amount);
    } 
}


class Account {
    constructor(name, transactions) {
        this.name = name;
        this.transactions = transactions;
    }

    getBalance() {
        let balance = 0;
        for (let i = 0; i < this.transactions.length; i++) {
            let thisTransaction = this.transactions[i];
            if (thisTransaction.from() === this.name) {
                balance -= thisTransaction.amount();
            } else {
                balance += thisTransaction.amount();
            }
        }
        return balance.toFixed(2);
    }
}

const file = importFile();
const parsedTransactions = parser(file);
const validatedTransactions = validate(parsedTransactions);
const classedTransactions = classTransactions(validatedTransactions);
const accounts = listAccounts(classedTransactions);
const classedAccounts = classAccounts(accounts);
print(classedAccounts);

function importFile() {
    const filename = getStringFromPrompt('Please enter filename:');
    const contents = fs.readFileSync(filename, 'utf-8');
    return {
        name: filename,
        contents: contents
    }
}

function parser(file) {
    if (file.name.slice(-4) === '.csv') {
        return csvParse(file.contents);
    } else if (file.name.slice(-5) === '.json') {
        return jsonParse(file.contents);
    }
}

function csvParse(file) {
    let parsedFile = parse(file, {
        columns: true, 
        skip_empty_lines: true
    });   
    for (let i = 0; i < parsedFile.length; i++) {
        parsedFile[i].Date = moment(parsedFile[i].Date, 'DD/MM/YYYY');
    }
    return parsedFile;
}

function jsonParse(file) {
    const parsedFile = JSON.parse(file);
    for (let i = 0; i < parsedFile.length; i++) {
        parsedFile[i].Date = moment(parsedFile[i].Date);
        parsedFile[i].To = parsedFile[i].ToAccount;
        parsedFile[i].From = parsedFile[i].FromAccount;
    }
    return parsedFile;
}

function listAccounts(transactions) {    //takes list of transactions and returns dictionary of accounts; name = key, value = list of transactions
    let people = {};
    for (let i = 0; i < transactions.length; i++) {
        let person = transactions[i].from();
        if (!(person in people)) {
            people[person] = [transactions[i]];
        } else {
            people[person].push(transactions[i]);
        }
        person = transactions[i].to();
        if (!(person in people)) {
            people[person] = [transactions[i]];
        } else {
            people[person].push(transactions[i]);
        }
    }
    return people;
}


function validate(transactions) {
    let validTransactions = [];
    for (let i = 0; i < transactions.length; i++) {
        let date = transactions[i].Date;
        if (!(date.isValid())) {
            logger.error(`Date format for transaction between ${transactions[i].From} and ${transactions[i].To} is invalid`);
            console.log(`Date format for transaction between ${transactions[i].From} and ${transactions[i].To} is invalid, entry removed.`);
        } else if (transactions[i].To == '') {
            logger.error(`No recipient for transaction from ${transactions[i].From} on ${transactions[i].Date}`);
            console.log(`No recipient for transaction from ${transactions[i].From} on ${transactions[i].Date}, entry removed.`);
        } else if (transactions[i].From == '') {
            logger.error(`No sender for transaction to ${transactions[i].To} on ${transactions[i].Date}`);
            console.log(`No sender for transaction to ${transactions[i].To} on ${transactions[i].Date}, entry removed.`);
        } else if (isNaN(parseInt(transactions[i].Amount))) {
            logger.error(`Amount format for transaction between ${transactions[i].From} and ${transactions[i].To} is invalid`);
            console.log(`Amount format for transaction between ${transactions[i].From} and ${transactions[i].To} is invalid, entry removed.`);
        } else if (transactions[i].Narrative == '') {
            logger.error(`No narrative given for transaction from ${transactions[i].From} to ${transactions[i].To} on ${transactions[i].Date}.`);
        } else {
            validTransactions.push(transactions[i]);
        }
    }
    return validTransactions;
}

function classTransactions(transactions) {
    for (let i = 0; i < transactions.length; i++) {
        transactions[i] = new Transaction(transactions[i]);
    }
    return transactions;
}

function classAccounts(accounts) {    
    for (let person in accounts) {
        let transactions = accounts[person];
        accounts[person] = new Account(person, transactions);
    }
    return accounts;
}




function print(Accounts) {
    let option = getStringFromPrompt(`Choose one of the following:
    1) print all names and balances
    2) print account`);
    if (option == 1) {
        printAll(Accounts);
    } else if (option == 2) {
        let name = getStringFromPrompt('Account name: ');
        printAccount(name, Accounts);
    }
}

function printAll(Accounts) {
    for (let person in Accounts) {
        console.log(`${person}:     ${Accounts[person].getBalance()}`);
    }
}

function printAccount(name, Accounts) {
    let transactions = Accounts[name].transactions;

    console.log(`${name}:`);
    for (let transaction of transactions) {
        console.log(`${transaction.date().toString()}    ${transaction.narrative()}`);
    }
}


function getStringFromPrompt(prompt) {
    console.log(prompt);
    return readline.prompt();
}