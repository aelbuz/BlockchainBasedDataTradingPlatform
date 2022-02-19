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

            if (App.account == purchaseRequest[3]) {
                const dataRecord = await App.dataRecords.records(purchaseRequest[1]);

                const requestId = purchaseRequest[0].toNumber();
                const purchaseDataId = purchaseRequest[1].toNumber();
                const dataRecordTitle = dataRecord[2];
                const dataRecordBuyerAddress = purchaseRequest[2];
                const dataRecordPrice = dataRecord[5].toNumber();

                const $newDataRecordTemplate = $dataRecordTemplate.clone();
                $newDataRecordTemplate.find('.dataRequestId').html(requestId);
                $newDataRecordTemplate.find('.dataRecordId').html(purchaseDataId);
                $newDataRecordTemplate.find('.dataRecordTitle').html(dataRecordTitle);
                $newDataRecordTemplate.find('.dataRecordBuyer').html(dataRecordBuyerAddress);
                $newDataRecordTemplate.find('.dataRecordPrice').html(dataRecordPrice);

                if (purchaseRequest[5]) {
                    $newDataRecordTemplate.find('#btnApproveRequest').prop('disabled', true);
                }

                if (!(purchaseRequest[4] && purchaseRequest[5])) {
                    $("#dataRecordsListBody").append($newDataRecordTemplate);
                    $newDataRecordTemplate.show();
                }
            }
        }
    },

    approvePurchaseRequest: async (btn) => {
        var dataRequestId = $(btn).closest(".dataRecordTemplate").find(".dataRequestId").html();
        $("#uploadDataFileSelector").trigger("click");

        document.getElementById("uploadDataFileSelector").onchange = () => {
            let lines;
            const selectedFile = document.getElementById('uploadDataFileSelector').files[0];

            var fr = new FileReader();
            fr.onload = function (e) {
                var fileContent = fr.result;
                lines = fileContent.split('\r\n');

                const uploadedDataProof = computeMerkleRoot(lines);
                App.checkAndApprovePurchaseRequest(dataRequestId, uploadedDataProof);
            }

            fr.readAsText(selectedFile);
        }

    },

    checkAndApprovePurchaseRequest: async (dataRequestId, uploadedDataProof) => {
        const dataRequest = await App.dataRecords.requests(dataRequestId);
        const dataId = dataRequest[1];
        const dataRecord = await App.dataRecords.records(dataId);
        const dataProofOnChain = dataRecord[4];

        if (uploadedDataProof == dataProofOnChain) {
            await App.dataRecords.approveBySeller(dataRequestId, App.account);
            window.alert("Veri satın alma talebi onaylandı.");
            window.location.reload();
        }
        else {
            window.alert("Yüklediğiniz veri hatalı, lütfen veriyi kontrol ediniz.");
        }
    }
}

var sha256 = function a(b) { function c(a, b) { return a >>> b | a << 32 - b } for (var d, e, f = Math.pow, g = f(2, 32), h = "length", i = "", j = [], k = 8 * b[h], l = a.h = a.h || [], m = a.k = a.k || [], n = m[h], o = {}, p = 2; 64 > n; p++)if (!o[p]) { for (d = 0; 313 > d; d += p)o[d] = p; l[n] = f(p, .5) * g | 0, m[n++] = f(p, 1 / 3) * g | 0 } for (b += "\x80"; b[h] % 64 - 56;)b += "\x00"; for (d = 0; d < b[h]; d++) { if (e = b.charCodeAt(d), e >> 8) return; j[d >> 2] |= e << (3 - d) % 4 * 8 } for (j[j[h]] = k / g | 0, j[j[h]] = k, e = 0; e < j[h];) { var q = j.slice(e, e += 16), r = l; for (l = l.slice(0, 8), d = 0; 64 > d; d++) { var s = q[d - 15], t = q[d - 2], u = l[0], v = l[4], w = l[7] + (c(v, 6) ^ c(v, 11) ^ c(v, 25)) + (v & l[5] ^ ~v & l[6]) + m[d] + (q[d] = 16 > d ? q[d] : q[d - 16] + (c(s, 7) ^ c(s, 18) ^ s >>> 3) + q[d - 7] + (c(t, 17) ^ c(t, 19) ^ t >>> 10) | 0), x = (c(u, 2) ^ c(u, 13) ^ c(u, 22)) + (u & l[1] ^ u & l[2] ^ l[1] & l[2]); l = [w + x | 0].concat(l), l[4] = l[4] + w | 0 } for (d = 0; 8 > d; d++)l[d] = l[d] + r[d] | 0 } for (d = 0; 8 > d; d++)for (e = 3; e + 1; e--) { var y = l[d] >> 8 * e & 255; i += (16 > y ? 0 : "") + y.toString(16) } return i };

function computeMerkleRoot(dataLines) {
    if (dataLines.length == 0) {
        return "";
    }

    if (dataLines.length == 1) {
        return dataLines[0];
    }

    if (dataLines.length % 2 > 0) {
        dataLines[dataLines.length] = dataLines[dataLines.length - 1]
    }

    const merkleBranches = [];

    for (var i = 0; i < dataLines.length; i += 2) {
        var leafPair = dataLines[i].toString() + dataLines[i + 1].toString();
        merkleBranches[merkleBranches.length] = sha256(leafPair);
    }

    return computeMerkleRoot(merkleBranches);
}

$(() => {
    $(window).load(() => {
        App.load()
    })
})