const moment = require('moment')

class Account {
    constructor(name, transactions) {
        this.name = name;
        this.transactions = transactions;
    }

    getBalance() {
        let balance = 0;
        for (let i = 0; i < this.transactions.length; i++) {
            if (this.transactions[i].From == this.name) {
                balance -= parseInt(this.transactions[i].Amount);
            } else {
                balance += parseInt(this.transactions[i].Amount);
            }
        }
        return balance;
    }
}



parsedRecords = readAndParseRecords('Transactions2014.csv');
accounts = listAccounts(parsedRecords);
classedAccounts = classAccounts(accounts);
printAll(classedAccounts);
printAccount('Todd', classedAccounts);

function printAll(classedAccounts) {
    for (person in classedAccounts) {
        console.log(`${person}:     ${classedAccounts[person].getBalance()}`);
    }
}

function printAccount(name, classedAccounts) {
    transactions = classedAccounts[name].transactions;

    console.log(`${name}:`);
    for (let transaction of transactions) {
        console.log(`${transaction.Date}    ${transaction.Narrative}`);
    }
    
}

function readAndParseRecords(file) {
    const fs = require('fs')
    const parse = require('csv-parse/lib/sync')
    
    const input = fs.readFileSync(file, 'utf-8')
    
    return parse(input, {
      columns: true,
      skip_empty_lines: true
    })    
}



function listAccounts(records) {
    let people = {};
    for (let i = 0; i < records.length; i++) {
        let person = records[i].From;
        if (!(person in people)) {
            people[person] = [records[i]];
        } else {
            people[person].push(records[i]);
        };
        person = records[i].To;
        if (!(person in people)) {
            people[person] = [records[i]];
        } else {
            people[person].push(records[i]);
        }
    }
    return people;
}


function classAccounts(accounts) {
    for (person in accounts) {
        transactions = accounts[person];
        accounts[person] = new Account(person, transactions);
    }
    return accounts;
}



console.log(moment("1995-12-25", "YYYY-MM-DD").toString());