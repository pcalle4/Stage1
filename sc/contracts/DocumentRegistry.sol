// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {IDocumentRegistry} from "./interfaces/IDocumentRegistry.sol";

contract DocumentRegistry is IDocumentRegistry {
    using MessageHashUtils for bytes32;

    mapping(bytes32 => Document) private documents;

    function storeDocumentHash(bytes32 hash, uint256 timestamp, bytes calldata signature) external override {
        if (documents[hash].exists) revert("Document already stored");
        if (timestamp == 0) revert("Invalid timestamp");

        bytes32 ethSignedHash = hash.toEthSignedMessageHash();
        (address recovered, ECDSA.RecoverError err,) = ECDSA.tryRecover(ethSignedHash, signature);
        if (err != ECDSA.RecoverError.NoError || recovered == address(0)) {
            revert("Invalid signature for msg.sender");
        }
        if (recovered != msg.sender) revert("Invalid signature for msg.sender");

        documents[hash] = Document({
            hash: hash,
            timestamp: timestamp,
            signer: msg.sender,
            signature: signature,
            exists: true
        });

        emit DocumentStored(hash, msg.sender, timestamp, signature);
    }

    function verifyDocument(bytes32 hash, address signer, bytes calldata signature)
        external
        override
        returns (bool)
    {
        Document storage document = documents[hash];
        if (!document.exists) {
            emit DocumentVerified(hash, signer, false);
            return false;
        }

        bytes32 ethSignedHash = hash.toEthSignedMessageHash();
        (address recovered, ECDSA.RecoverError err,) = ECDSA.tryRecover(ethSignedHash, signature);

        bool isValid = err == ECDSA.RecoverError.NoError
            && recovered == signer
            && document.signer == signer
            && keccak256(signature) == keccak256(document.signature);

        emit DocumentVerified(hash, signer, isValid);
        return isValid;
    }

    function getDocumentInfo(bytes32 hash) external view override returns (Document memory) {
        Document memory document = documents[hash];
        if (!document.exists) revert("Document not found");
        return document;
    }

    function isDocumentStored(bytes32 hash) external view override returns (bool) {
        return documents[hash].exists;
    }

    function getDocumentSignature(bytes32 hash) external view override returns (bytes memory) {
        Document memory document = documents[hash];
        if (!document.exists) revert("Document not found");
        return document.signature;
    }
}
