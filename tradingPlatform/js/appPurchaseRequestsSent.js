App = {
    contracts: {

    },
    load: async () => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.renderMyPurchaseRequests()
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

    renderMyPurchaseRequests: async () => {
        const myDataPurchaseRequestCount = await App.dataRecords.requestCount();
        const $dataRecordTemplate = $('.dataRecordTemplate');

        for (var i = 1; i <= myDataPurchaseRequestCount; i++) {
            const purchaseRequest = await App.dataRecords.requests(i);

            if (App.account == purchaseRequest[2]) {
                const dataRecord = await App.dataRecords.records(purchaseRequest[1]);

                const requestId = purchaseRequest[0].toNumber();
                const purchaseDataId = purchaseRequest[1].toNumber();
                const dataRecordTitle = dataRecord[2];
                const dataRecordSellerAddress = purchaseRequest[3];
                const dataRecordPrice = dataRecord[5].toNumber();

                const $newDataRecordTemplate = $dataRecordTemplate.clone();
                $newDataRecordTemplate.find('.dataRequestId').html(requestId);
                $newDataRecordTemplate.find('.dataRecordId').html(purchaseDataId);
                $newDataRecordTemplate.find('.dataRecordTitle').html(dataRecordTitle);
                $newDataRecordTemplate.find('.dataRecordSeller').html(dataRecordSellerAddress);
                $newDataRecordTemplate.find('.dataRecordPrice').html(dataRecordPrice);

                if (!purchaseRequest[4] && purchaseRequest[5]) {
                    $newDataRecordTemplate.find('#btnApproveRequestBuyer').prop('disabled', false);
                    $newDataRecordTemplate.find('#btnApproveRequestBuyer').show();
                }
                else {
                    $newDataRecordTemplate.find('#btnApproveRequestBuyer').prop('disabled', true);
                    $newDataRecordTemplate.find('#btnApproveRequestBuyer').hide();
                }

                if (!(purchaseRequest[4] && purchaseRequest[5])) {
                    $("#dataRecordsListBody").append($newDataRecordTemplate);
                    $newDataRecordTemplate.show();
                }
            }
        }
    },

    approvePurchaseRequestBuyer: async (btn) => {

        var dataRequestId = $(btn).closest(".dataRecordTemplate").find(".dataRequestId").html();
        const dataRequest = await App.dataRecords.requests(dataRequestId);
        const dataRecord = await App.dataRecords.records(dataRequest[1]);
        const dataId = dataRecord[0].toNumber();
        const dataPrice = dataRecord[5].toNumber();
        const dataPriceAsWei = web3.toWei(dataPrice, "ether");

        web3.eth.sendTransaction({
            from: App.account,
            to: dataRecord[1],
            value: dataPriceAsWei
        }, function (error, result) {
            if (!error) {
                console.log(result);
            }
            else {
                console.log(error.code);
                window.alert("Veri satın alma işlemi sırasında hata oluştu.");
            }
        });

        await App.dataRecords.approveByBuyer(dataRequestId, App.account);
        window.alert("Veri satın alma işlemi tamamlandı.");
        window.location.replace("purchasedData.html");
    },
}

$(() => {
    $(window).load(() => {
        App.load()
    })
})