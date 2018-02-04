App = {
  web3Provider: null,
  contracts: {},

  init: function() {

       // Load trucks.
    $.getJSON('../trucks.json', function(data) {
      var normalRow = $('#trucksRow');
      var petTemplate = $('#trucksTemplate');
      var platoonRow = $('#platoonRow');
      var platoonTemplate = $('#platoonTemplate');
      platoonTemplate.find('.panel-title').text('Super Platoon');

      for (i = 0; i < data.length; i ++) {
        petTemplate.attr("id", i);
        petTemplate.find('.truck-name').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.truck-public-address').text(data[i].publicaddress);
        petTemplate.find('.truck-current-balance').text(data[i].currentbalance);
        petTemplate.find('.truck-timeofentry').text(data[i].timeofentry);
        petTemplate.find('.truck-reputation').text(data[i].reputation);
        petTemplate.find('.btn-action').attr('data-id', data[i].id);
        if(data[i].platoonSubscribed != 'undefined' && data[i].platoonSubscribed.length > 0){
          petTemplate.find('.btn-action').text("Leave");
          petTemplate.find('.btn-action').addClass("btn-leave");
          petTemplate.find('.btn-action').removeClass("btn-join");
          platoonTemplate.append(petTemplate.html());
        }
        else{
          petTemplate.find('.btn-action').text("Join");
          petTemplate.find('.btn-action').addClass("btn-join");
          petTemplate.find('.btn-action').removeClass("btn-leave");
          normalRow.append(petTemplate.html());  
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
    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);

      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });
    
    $.getJSON('PluckCoin.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var PluckCoinArtifact = data;
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
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on('click', '.btn-transfer', App.handleTransfer);
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

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }

  var account = accounts[0];

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        // Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(petId, {from: account});
      }).then(function(result) {
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleTransfer: function(event){
    event.preventDefault();
     var petId = parseInt($(event.target).data('id'));
    web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }

    var account = accounts[0];

      App.contracts.PluckCoin.deployed().then(function(instance) {
        pluckCoinInstance = instance;
        // Execute adopt as a transaction by sending account
        return pluckCoinInstance.balanceOf();
      }).then(function(result) {
        console.log('something happened!');
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleJoinPlatoon: function(event){
    event.preventDefault();
    var truck = $(event.target).closest( ".panel-truck" ).parent();
    $("#platoonRow").append(truck);
    truck.find('.btn-action').text("Leave");
    truck.find('.btn-action').addClass("btn-leave");
    truck.find('.btn-action').removeClass("btn-join");
    alert('Join!');

  },

  handleLeavePlatoon: function(event){
    event.preventDefault();
    var truck = $(event.target).closest( ".panel-truck" ).parent();
    $("#trucksRow").append(truck);
    truck.find('.btn-action').text("Join");
    truck.find('.btn-action').addClass("btn-join");
    truck.find('.btn-action').removeClass("btn-leave");
    alert('Leave');
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
