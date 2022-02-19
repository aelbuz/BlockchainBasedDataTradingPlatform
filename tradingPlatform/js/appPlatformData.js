App = {
    contracts: {

    },
    load: async () => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.renderDataRecords()
    },

    loadWeb3: async () => {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider
            App.web3 = new Web3(web3.currentProvider)
        } else {
            window.alert("Please connect to Metamask.")
        }
        // Modern dapp browsers...
        if (window.ethereum) {
            window.web3 = new Web3(ethereum)
            try {
                // Request account access if needed
                await ethereum.enable()
                // Acccounts now exposed
                web3.eth.sendTransaction({/* ... */ })
            } catch (error) {
                // User denied account access...
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = web3.currentProvider
            window.web3 = new Web3(web3.currentProvider)
            // Acccounts always exposed
            web3.eth.sendTransaction({/* ... */ })
        }
        // Non-dapp browsers...
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    },

    loadAccount: async () => {
        App.account = web3.eth.accounts[0];
        document.getElementById('userAddress').innerHTML = App.account;
        web3.eth.getBalance(App.account, function (err, balance) {
            if (err) {
                console.log(err);
            }
            else {
                document.getElementById('userBalance').innerHTML = web3.fromWei(balance, "ether") + " ETH";
            }
        });
    },

    loadContract: async () => {
        const dataRecords = await $.getJSON('DataRecords.json')
        App.contracts.DataRecords = TruffleContract(dataRecords)
        App.contracts.DataRecords.setProvider(App.web3Provider)

        App.dataRecords = await App.contracts.DataRecords.deployed()
    },

    renderDataRecords: async () => {
        const dataRecordCount = await App.dataRecords.dataRecordCount();
        const $dataRecordTemplate = $('.dataRecordTemplate');

        for (var i = 1; i <= dataRecordCount; i++) {
            const dataRecord = await App.dataRecords.records(i);
            const dataRecordId = dataRecord[0].toNumber();
            const dataRecordOwnerAddress = dataRecord[1];
            const dataRecordTitle = dataRecord[2];
            const dataRecordMetadata = dataRecord[3];
            const dataRecordPrice = dataRecord[5].toNumber();

            const $newDataRecordTemplate = $dataRecordTemplate.clone();
            $newDataRecordTemplate.find('.dataRecordId').html(dataRecordId);
            $newDataRecordTemplate.find('.dataRecordTitle').html(dataRecordTitle);
            $newDataRecordTemplate.find('.dataRecordMetadata').html(dataRecordMetadata);
            $newDataRecordTemplate.find('.dataRecordPrice').html(dataRecordPrice);

            if (dataRecordOwnerAddress == App.account) {
                $newDataRecordTemplate.css("background-color", "cornsilk");
                $newDataRecordTemplate.find('#btnPurchaseData').prop('disabled', true);
            }

            $("#dataRecordsListBody").append($newDataRecordTemplate);
            $newDataRecordTemplate.show();
        }
    },

    sendPurchaseRequest: async (btn) => {
        var dataId = $(btn).closest(".dataRecordTemplate").find(".dataRecordId").html();
        const dataRecord = await App.dataRecords.records(dataId);
        const dataRecordSellerAddress = dataRecord[1];
        const dataRecordBuyerAddress = App.account;

        await App.dataRecords.createDataPurchaseRequest(dataId, dataRecordBuyerAddress, dataRecordSellerAddress);
        window.alert("Veri satın alma isteği gönderildi.");
        window.location.replace("purchaseRequestsSent.html");
    },
}

$(() => {
    $(window).load(() => {
        App.load()
    })
})