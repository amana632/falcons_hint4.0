var FalconsToken = artifacts.require("./FalconsToken.sol");

contract('FalconsToken', function (accounts) {
  var tokenInstance;

  it('initializes the contract', function () {
    return FalconsToken.deployed().then(function (instance) {
      tokenInstance = instance;
      return tokenInstance.name();
    }).then(function (name) {
      assert.equal(name, 'Falcons Token', 'correct namec check');
      return tokenInstance.symbol();
    }).then(function (symbol) {
      assert.equal(symbol, 'FALCONS', 'correct symbol check');
      return tokenInstance.standard();
    }).then(function (standard) {
      assert.equal(standard, 'Falcons Token v1.0', 'correct standard check');
    });
  })

  it('initial supply allocation', function () {
    return FalconsToken.deployed().then(function (instances) {
      tokenInstance = instance;
      return tokenInstance.totalSupply();
    }).then(function (totalSupply) {
      assert.equal(totalSupply.toNumber(), 100000, 'total supply = 800,000');
      return tokenInstance.balanceOf(accounts[0]);
    }).then(function (adminBalance) {
      assert.equal(adminBalance.toNumber(), 100000, 'allocates the initial supply to the admin');
    });
  });

  it('transfers token ownership', function () {
    return FalconsToken.deployed().then(function (instance) {
      tokenInstance = instance;
      return tokenInstance.transfer.call(accounts[1], 9999999999999999999999);
    }).then(assert.fail).catch(function (error) {
      return tokenInstance.transfer.call(accounts[1], 250000, { from: accounts[0] });
    }).then(function (success) {
      assert.equal(success, true, 'it returns true');
      return tokenInstance.transfer(accounts[1], 250000, { from: accounts[0] });
    }).then(function (receipt) {
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
      assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
      assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
      assert.equal(receipt.logs[0].args, 250000, 'logs the transfer amount');
      return tokenInstance.balanceOf(accounts[1]);
    }).then(function (balance) {
      assert.equal(balance.toNumber(), 250000, 'adds the amount to the receiving account');
      return tokenInstance.balanceOf(accounts[0]);
    }).then(function (balance) {
      assert.equal(balance.toNumber(), 750000, 'deducts the amount from the sending account');
    });
  });

  it('delegated transfer', function () {
    return FalconsToken.deployed().then(function (instance) {
      tokenInstance = instance;
      return tokenInstance.approve.call(accounts[1], 100);
    }).then(function (success) {
      assert.equal(success, true, 'it returns true');
      return tokenInstance.approve(accounts[1], 100, { from: accounts[0] });
    }).then(function (receipt) {
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
      assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account ');
      assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account to');
      assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');
      return tokenInstance.allowance(accounts[0], accounts[1]);
    }).then(function (allowance) {
      assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated trasnfer');
    });
  });

  it('handles delegated token transfers', function () {
    return FalconsToken.deployed().then(function (instance) {
      tokenInstance = instance;
      fromAccount = accounts[2];
      toAccount = accounts[3];
      spendingAccount = accounts[4];
      return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
    }).then(function (receipt) {
      return tokenInstance.approve(spendingAccount, 10, { from: fromAccount });
    }).then(function (receipt) {
      return tokenInstance.transferFrom(toAccount, 9999, { from: spendingAccount });
    }).then(assert.fail).catch(function (error) {
      assert(error.message.indexOf('revert') >= 0, 'cannot transfer larger');
      return tokenInstance.transferFrom(fromAccount, 20, { from: spendingAccount });
    }).then(assert.fail).catch(function (error) {
      assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger');
      return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
    }).then(function (success) {
      assert.equal(success, true);
      return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
    }).then(function (receipt) {
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Transfer', ' "Transfer" event');
      assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the transferred from');
      assert.equal(receipt.logs[0].args._to, toAccount, 'logs the  transferred to');
      assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');
      return tokenInstance.balanceOf(fromAccount);
    }).then(function (balance) {
      assert.equal(balance.toNumber(), 90, 'deducts amount from sending account');
      return tokenInstance.balanceOf(toAccount);
    }).then(function (balance) {
      assert.equal(balance.toNumber(), 10, 'adds the amount account');
      return tokenInstance.allowance(fromAccount, spendingAccount);
    }).then(function (allowance) {
      assert.equal(allowance.toNumber(), 0, 'deducts the amount');
    });
  });
});
