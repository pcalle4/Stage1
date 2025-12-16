// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IDocumentRegistry {
    struct Document {
        bytes32 hash;
        uint256 timestamp;
        address signer;
        bytes signature;
        bool exists;
    }

    event DocumentStored(bytes32 indexed hash, address indexed signer, uint256 timestamp, bytes signature);
    event DocumentVerified(bytes32 indexed hash, address indexed signer, bool isValid);

    function storeDocumentHash(bytes32 hash, uint256 timestamp, bytes calldata signature) external;

    function verifyDocument(bytes32 hash, address signer, bytes calldata signature) external returns (bool);

    function getDocumentInfo(bytes32 hash) external view returns (Document memory);

    function isDocumentStored(bytes32 hash) external view returns (bool);

    function getDocumentSignature(bytes32 hash) external view returns (bytes memory);
}
