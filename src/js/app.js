App = {
  web3Provider: null,
  contracts: {},

  init: function() {

       // Load trucks.
    $.getJSON('../trucks.json', function(data) {
      var normalRow = $('#trucksRow');
      var truckTemplate = $('#trucksTemplate');
      var platoonRow = $('#platoonRow');
      var platoonTemplate = $('#platoonTemplate');
      platoonTemplate.find('.panel-title').text('Super Platoon');

      for (i = 0; i < data.length; i ++) {
        truckTemplate.attr("id", i);
        truckTemplate.find('.truck-name').text(data[i].name);
        truckTemplate.find('img').attr('src', data[i].picture);
        truckTemplate.find('.truck-public-address').text(data[i].publicaddress);
        var balance = App.getBalanceOf(data[i].publicaddress);
        if(balance == undefined)
        {
          balance = data[i].currentbalance;
        }
        truckTemplate.find('.truck-current-balance').text(balance);
        truckTemplate.find('.truck-reputation').text(data[i].reputation);
        truckTemplate.find('.btn-action').attr('data-id', data[i].id);
        truckTemplate.find('.truck-timeofentry').text(new Date($.now()));
        if(data[i].platoonSubscribed != 'undefined' && data[i].platoonSubscribed.length > 0){
          truckTemplate.find('.btn-action').text("Leave");
          truckTemplate.find('.btn-action').addClass("btn-leave");
          truckTemplate.find('.btn-action').removeClass("btn-join");
          platoonTemplate.append(truckTemplate.html());
        }
        else{
          truckTemplate.find('.truck-timeofentry').text("-");
          truckTemplate.find('.btn-action').text("Join");
          truckTemplate.find('.btn-action').addClass("btn-join");
          truckTemplate.find('.btn-action').removeClass("btn-leave");
          normalRow.append(truckTemplate.html());  
        }
        
      }

      platoonRow.append(platoonTemplate.html());

    });

    return App.initWeb3();
  },

  initWeb3: function() {
   // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContracts();
  },

  initContracts: function() {
    
    $.getJSON('PluckCoin.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var PluckCoinArtifact = data;
      PluckCoinArtifact.setProvider
      App.contracts.PluckCoin = TruffleContract(PluckCoinArtifact);
      // Set the provider for our contract
      App.contracts.PluckCoin.setProvider(App.web3Provider);


    });

    $.getJSON('PlatoonManagement.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var PlatoonManagementArtifact = data;
      App.contracts.PlatoonManagement = TruffleContract(PlatoonManagementArtifact);

      // Set the provider for our contract
      App.contracts.PlatoonManagement.setProvider(App.web3Provider);

    });


    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-leave', App.handleLeavePlatoon);
    $(document).on('click', '.btn-join', App.handleJoinPlatoon);
  },

  markAdopted: function(adopters, account) {
    var adoptionInstance;

App.contracts.Adoption.deployed().then(function(instance) {
  adoptionInstance = instance;

      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleJoinPlatoon: function(event){
    event.preventDefault();
    bootbox.confirm({
    title: "Join Platoon",
    message: "<div><h5>Rating: 4 Star<h5><div><h5>Cost: 1 PLC per minute</h5><h5>Maximum Vehicles Allowed in Platoon: 5</h5>",
    buttons: {
        confirm: {
            label: 'Yes',
            className: 'btn-success'
        },
        cancel: {
            label: 'No',
            className: 'btn-danger'
        }
    },
    callback: function (result) {
        if(result){
          var truck = $(event.target).closest( ".panel-truck" ).parent();
          $("#platoonRow").append(truck);
          truck.find('.btn-action').text("Leave");
          truck.find('.btn-action').addClass("btn-leave");
          truck.find('.btn-action').removeClass("btn-join");
          truck.find('.truck-timeofentry').text(new Date($.now()));

          console.log('This was logged in the callback: ' + result);
        }
      }
    });


   
    
   /* web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }


      //console.log(pluckCoinContract.balanceOf("0x627306090abaB3A6e1400e9345bC60c78a8BEf57")+"<<<<<<first");

    

    var account = accounts[0];

      App.contracts.PlatoonManagement.deployed().then(function(instance) {
        platoonManagementInstance = instance;
        console.log(pluckCoinInstance.balanceOf("0x627306090abaB3A6e1400e9345bC60c78a8BEf57")+"<<<<<<");

        // Execute adopt as a transaction by sending account
        return pluckCoinInstance.balanceOf("0x627306090abaB3A6e1400e9345bC60c78a8BEf57");
      }).then(function(result) {
        console.log('something happened!');
      }).catch(function(err) {
        console.log(err.message);
      });
    });*/

  },

  handleLeavePlatoon: function(event){
    event.preventDefault();
    bootbox.confirm({
    title: "Leave Platoon",
    message: "<div><h5>Joined on: "+(new Date($.now()))+"</div></h5><div><h5>Total Time Spent: 40 minutes</div></h5><h5><div>Total Cost: 40 PLC</div></h5>",
    buttons: {
        confirm: {
            label: 'Yes',
            className: 'btn-success'
        },
        cancel: {
            label: 'No',
            className: 'btn-danger'
        }
    },
    callback: function (result) {
        if(result){
          var truck = $(event.target).closest( ".panel-truck" ).parent();
          $("#trucksRow").append(truck);
          truck.find('.btn-action').text("Join");
          truck.find('.btn-action').addClass("btn-join");
          truck.find('.btn-action').removeClass("btn-leave");
          truck.find('.truck-timeofentry').text("-");
          var currentbalance = truck.find('.truck-current-balance').text();
          truck.find('.truck-current-balance').text(currentbalance-40);
          var firstTruckCurrentBalance = parseInt($(".panel-truck").first().find('.truck-current-balance').text());
          var firstTruckNewBalance = firstTruckCurrentBalance+40;
          $(".panel-truck").first().find('.truck-current-balance').text(firstTruckNewBalance);
          truck.find('.truck-current-balance').text(currentbalance-40);
          console.log('This was logged in the callback: ' + result);
        }
      }
    });
    
  },

  getBalanceOf(_owner){
    var balance =  App.getPluckCoinContract().balanceOf("0xf17f52151EbEF6C7334FAD080c5704D77216b732", function(error, result){
         if(!error)
        {
          console.log(result+"<<");
          return result;
         }else
          {
            return 0;
          }
     });
  },

  getPluckCoinContract: function(event){
      var pluckCoinContractAddress = "0xF18927eD3046c1983A13d4743Fc486F9BA8AeCB6";
      var pluckCoinContractAbi = [
      {
        "constant": true,
        "inputs": [],
        "name": "version",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_owner",
            "type": "address"
          },
          {
            "name": "_spender",
            "type": "address"
          }
        ],
        "name": "allowance",
        "outputs": [
          {
            "name": "remaining",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_owner",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "name": "balance",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "totalEthInWei",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [
          {
            "name": "",
            "type": "uint8"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "unitsOneEthCanBuy",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "fundsWallet",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_owner",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "_spender",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_from",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "_to",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_from",
            "type": "address"
          },
          {
            "name": "_to",
            "type": "address"
          },
          {
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "transferFrom",
        "outputs": [
          {
            "name": "success",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_spender",
            "type": "address"
          },
          {
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [
          {
            "name": "success",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_spender",
            "type": "address"
          },
          {
            "name": "_value",
            "type": "uint256"
          },
          {
            "name": "_extraData",
            "type": "bytes"
          }
        ],
        "name": "approveAndCall",
        "outputs": [
          {
            "name": "success",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_to",
            "type": "address"
          },
          {
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "transfer",
        "outputs": [
          {
            "name": "success",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "payable": true,
        "stateMutability": "payable",
        "type": "fallback"
      }
    ];

    return web3.eth.contract(pluckCoinContractAbi).at(pluckCoinContractAddress);
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
