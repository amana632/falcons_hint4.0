var FalconsToken = artifacts.require("./FalconsToken.sol");

contract('FalconsToken', function (accounts) {
  var tokenInstance;

  it('initializing contract with values', function () {
    return FalconsToken.deployed().then(function (instance) {
      tokenInstance = instance;
      return tokenInstance.name();
    }).then(function (name) {
      assert.equal(name, 'Falcons Token', 'checks the correct name');
      return tokenInstance.symbol();
    }).then(function (symbol) {
      assert.equal(symbol, 'FALCONS', 'checks the correct symbol');
      return tokenInstance.standard();
    }).then(function (standard) {
      assert.equal(standard, 'Falcons Token v1.0', 'checks the correct standard');
    });
  })

  it(' upon deployment - allocating the initial supply', function () {
    return FalconsToken.deployed().then(function (instance) {
      tokenInstance = instance;
      return tokenInstance.totalSupply();
    }).then(function (totalSupply) {
      assert.equal(totalSupply.toNumber(), 2000000, 'setting the total supply to 2,000,000');
      return tokenInstance.balanceOf(accounts[0]);
    }).then(function (adminBalance) {
      assert.equal(adminBalance.toNumber(), 2000000, 'allocating the initial supply to the admin');
    });
  });

  it('transfers token ownership', function () {
    return FalconsToken.deployed().then(function (instance) {
      tokenInstance = instance;
      return tokenInstance.transfer.call(accounts[1], 888888888888888888888);
    }).then(assert.fail).catch(function (error) {
      // assert(error.message.indexOf('revert') >= 0, 'error ');
      return tokenInstance.transfer.call(accounts[1], 300000, { from: accounts[0] });
    }).then(function (success) {
      assert.equal(success, true, 'will return true');
      return tokenInstance.transfer(accounts[1], 300000, { from: accounts[0] });
    }).then(function (receipt) {
      assert.equal(receipt.logs.length, 1, 'triggers the event');
      assert.equal(receipt.logs[0].event, 'Transfer', 'that should be the "Transfer" event');
      assert.equal(receipt.logs[0].args._from, accounts[0], 'logging the account the tokens are transferred from');
      assert.equal(receipt.logs[0].args._to, accounts[1], 'logging the account the tokens are transferred to');
      assert.equal(receipt.logs[0].args._value, 300000, 'logging the transfer amount');
      return tokenInstance.balanceOf(accounts[1]);
    }).then(function (balance) {
      assert.equal(balance.toNumber(), 300000, 'adding to the receiving account');
      return tokenInstance.balanceOf(accounts[0]);
    }).then(function (balance) {
      assert.equal(balance.toNumber(), 1700000, 'deducting from the sending account');
    });
  });

  it('A check for delegated transfer', function () {
    return FalconsToken.deployed().then(function (instance) {
      tokenInstance = instance;
      return tokenInstance.approve.call(accounts[1], 100);
    }).then(function (success) {
      assert.equal(success, true, 'should returns true');
      return tokenInstance.approve(accounts[1], 100, { from: accounts[0] });
    }).then(function (receipt) {
      assert.equal(receipt.logs.length, 1, 'triggers the event');
      assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
      assert.equal(receipt.logs[0].args._owner, accounts[0], 'logging the tokens are authorized by');
      assert.equal(receipt.logs[0].args._spender, accounts[1], 'logging the tokens are authorized to');
      assert.equal(receipt.logs[0].args._value, 100, 'logging the transfer amount');
      return tokenInstance.allowance(accounts[0], accounts[1]);
    }).then(function (allowance) {
      assert.equal(allowance.toNumber(), 100, 'allowance for delegated trasnfer');
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
      return tokenInstance.transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount });
    }).then(assert.fail).catch(function (error) {
      assert(error.message.indexOf('revert') >= 0, 'shouldnt transfer value >  balance');
      return tokenInstance.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount });
    }).then(assert.fail).catch(function (error) {
      assert(error.message.indexOf('revert') >= 0, 'shouldnt transfer value >  approved amount');
      return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
    }).then(function (success) {
      assert.equal(success, true);
      return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
    }).then(function (receipt) {
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
      assert.equal(receipt.logs[0].args._from, fromAccount, 'logging the tokens are transferred from');
      assert.equal(receipt.logs[0].args._to, toAccount, 'logging the tokens are transferred to');
      assert.equal(receipt.logs[0].args._value, 10, 'logging the transfer amount');
      return tokenInstance.balanceOf(fromAccount);
    }).then(function (balance) {
      assert.equal(balance.toNumber(), 90, 'deducting the amount from sending account');
      return tokenInstance.balanceOf(toAccount);
    }).then(function (balance) {
      assert.equal(balance.toNumber(), 10, 'adding the amount from receiving account');
      return tokenInstance.allowance(fromAccount, spendingAccount);
    }).then(function (allowance) {
      assert.equal(allowance.toNumber(), 0, 'deducting the amount from allowance');
    });
  });
});
