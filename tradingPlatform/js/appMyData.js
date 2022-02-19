App = {
    contracts: {

    },
    load: async () => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.renderMyDataRecords()
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

    renderMyDataRecords: async () => {
        const dataRecordCount = await App.dataRecords.dataRecordCount()
        const $dataRecordTemplate = $('.myDataRecordTemplate')

        for (var i = 1; i <= dataRecordCount; i++) {
            const dataRecord = await App.dataRecords.records(i);
            const dataRecordOwnerAddress = dataRecord[1];

            if (dataRecordOwnerAddress == App.account) {
                const dataRecordId = dataRecord[0].toNumber();
                const dataRecordTitle = dataRecord[2];
                const dataRecordMetadata = dataRecord[3];
                const dataRecordPrice = dataRecord[5].toNumber();

                const $newDataRecordTemplate = $dataRecordTemplate.clone();
                $newDataRecordTemplate.find('.myDataRecordId').html(dataRecordId);
                $newDataRecordTemplate.find('.myDataRecordTitle').html(dataRecordTitle);
                $newDataRecordTemplate.find('.myDataRecordMetadata').html(dataRecordMetadata);
                $newDataRecordTemplate.find('.myDataRecordPrice').html(dataRecordPrice);

                $("#myDataRecordsListBody").append($newDataRecordTemplate);
                $newDataRecordTemplate.show();
            }
        }
    },

    showDataDetails: async (btn) => {
        var dataId = $(btn).closest(".myDataRecordTemplate").find(".myDataRecordId").html();
        const dataRecord = await App.dataRecords.records(dataId);
        $("#dataRecordDetailDataId").html(dataRecord[0].toNumber());
        $("#dataRecordDetailDataTitle").html(dataRecord[2]);
        $("#dataRecordDetailDataMetadata").html(dataRecord[3]);
        $("#dataRecordDetailDataProof").html(dataRecord[4]);
        $("#dataRecordDetailDataPrice").html(dataRecord[5].toNumber());

        $("#dialog").dialog({modal: true, resizable: false, width: 800, height: 300});
    }
}

$(() => {
    $(window).load(() => {
        App.load()
    })
})