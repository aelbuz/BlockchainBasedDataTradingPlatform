pragma solidity ^0.5.0;

contract DataRecords
{
    uint public dataRecordCount = 0;
    uint public requestCount = 0;

    // address dummySeller = (0xA822d12D8548EbC3036e707FA2FE9936fAC876fb);
    // address dummyBuyer = (0xda2E10E69a16B398C63b47E2C8C5aE2654AB3B45);

    struct DataRecord
    {
        uint id;
        address sellerId;
        string title;
        string metadata;
        string proof;
        uint price;
    }
    
    mapping(uint => DataRecord) public records;

    constructor() public {
        // createDataRecord(dummySeller, "Başlık 1", "Üst veri 1", "Özet 1", 1);
        // createDataRecord(dummySeller, "Başlık 2", "Üst veri 2", "Özet 2", 2);
        // createDataRecord(dummyBuyer, "Başlık 3", "Üst veri 3", "Özet 3", 3);
        // createDataRecord(dummyBuyer, "Başlık 4", "Üst veri 4", "Özet 4", 4);
        // createDataPurchaseRequest(3, dummySeller, dummyBuyer);
        // createDataPurchaseRequest(4, dummySeller, dummyBuyer);
        // createDataPurchaseRequest(1, dummyBuyer, dummySeller);
        // createDataPurchaseRequest(2, dummyBuyer, dummySeller);
    }

    function createDataRecord(address _sellerId, string memory _title, string memory _metadata, string memory _proof, uint _price) public
    {
        dataRecordCount++;
        records[dataRecordCount] = DataRecord(dataRecordCount, _sellerId, _title, _metadata, _proof, _price);
    }

    struct DataPurchaseRequest
    {
        uint requestId;
        uint dataId;
        address buyerId;
        address sellerId;
        bool isBuyerApproved;
        bool isSellerApproved;
    }

    mapping (uint => DataPurchaseRequest) public requests;

    function createDataPurchaseRequest(uint _dataId, address _buyerId, address _sellerId) public
    {
        requestCount++;
        requests[requestCount] = DataPurchaseRequest(requestCount, _dataId, _buyerId, _sellerId, false, false);
    }

    function approveBySeller(uint _requestId, address _sellerId) public
    {
        DataPurchaseRequest memory _request = requests[_requestId];

        if (_request.sellerId == _sellerId)
        {
            _request.isSellerApproved = true;
            requests[_requestId] = _request;
        }
    }

    function approveByBuyer(uint _requestId, address _buyerId) public
    {
        DataPurchaseRequest memory _request = requests[_requestId];

        if (_request.buyerId == _buyerId && _request.isSellerApproved)
        {
            _request.isBuyerApproved = true;
            requests[_requestId] = _request;
        }
    }
}