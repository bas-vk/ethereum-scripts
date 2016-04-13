var Utils = function() {
    this._minerThreads = 1;      // default number of CPU workers to start when pending transactions are mined
    this._minePendingTx = false; // by default don't mine pending transactions
    this.isMainNet = (eth.getBlock(0).hash === "0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3");
    this.isTestNet = (eth.getBlock(0).hash === "0x0cd786a2425d16f152c658316c423e6ce1181e15c3295826d7c9904cba9ce303");
};

// Print balances for accounts iny eth.accounts
Utils.prototype.balances = function() {
    console.log("account\t\t\t\t\t\tbalance (ETH)");
    eth.accounts.forEach(function(acc) {
	var balance = eth.getBalance(acc);
	console.log(acc + "\t" + web3.fromWei(balance, "ether"));
    });
};

// Enable of disable mining pending transactions automatically.
Utils.prototype.minePendingTransactions = function(enable, threads) {
    this._minePendingTx = enable;
    if (threads !== undefined) {
	this._minerThreads = threads;
    }
};

// helper function that starts the miner if there are pending transactions
// or stops the miner when there are no pending transactions. These pending
// transactions must be send from one of the accounts of the node the console
// is connected to!
Utils.prototype._checkPendingTx = function() {
    if (this._minePendingTx) {
	if (eth.pendingTransactions.length > 0 && eth.hashrate === 0) {
	    miner.start(this._minerThreads);
	} else if (eth.pendingTransactions.length == 0) {
	    miner.stop();
	}
    }
};

var utils = new Utils();
utils.minePendingTransactions(true, 1);

// helper filter that call callbacks when a new block is added to the chain
eth.filter("latest", function(err, block) {
    utils._checkPendingTx();
});

// helper that fires when something changes in the pending state
eth.filter("pending", function(err, block) {
    utils._checkPendingTx();
});

