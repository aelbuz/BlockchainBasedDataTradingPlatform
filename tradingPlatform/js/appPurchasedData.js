App = {
    contracts: {

    },
    load: async () => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.renderPurchasedDataRecords()
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

    renderPurchasedDataRecords: async () => {
        const purchasedDataRecordCount = await App.dataRecords.requestCount()
        const $dataRecordTemplate = $('.purchasedDataRecordTemplate')

        for (var i = 1; i <= purchasedDataRecordCount; i++) {
            const purchaseRequest = await App.dataRecords.requests(i);

            if (App.account == purchaseRequest[2] && purchaseRequest[4] && purchaseRequest[5]) {
                const dataRecord = await App.dataRecords.records(purchaseRequest[1]);

                const purchaseDataId = purchaseRequest[1].toNumber();
                const dataRecordTitle = dataRecord[2];
                const dataRecordMetadata = dataRecord[3];

                const $newDataRecordTemplate = $dataRecordTemplate.clone();
                $newDataRecordTemplate.find('.purchasedDataRecordId').html(purchaseDataId);
                $newDataRecordTemplate.find('.purchasedDataRecordTitle').html(dataRecordTitle);
                $newDataRecordTemplate.find('.purchasedDataRecordMetadata').html(dataRecordMetadata);

                $("#purchasedDataRecordsListBody").append($newDataRecordTemplate);
                $newDataRecordTemplate.show();
            }
        }
    },

    downloadData: async () => {
        window.alert("Veri indirildi.");
    },
}

$(() => {
    $(window).load(() => {
        App.load()
    })
})