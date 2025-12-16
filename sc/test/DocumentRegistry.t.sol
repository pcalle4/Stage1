// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {DocumentRegistry} from "../contracts/DocumentRegistry.sol";
import {IDocumentRegistry} from "../contracts/interfaces/IDocumentRegistry.sol";

contract DocumentRegistryTest is Test {
    using MessageHashUtils for bytes32;

    uint256 private constant PRIVATE_KEY = 0xA11CE;
    address private signer = vm.addr(PRIVATE_KEY);

    DocumentRegistry private registry;

    function setUp() public {
        registry = new DocumentRegistry();
    }

    function _signHash(bytes32 hash) internal returns (bytes memory) {
        bytes32 ethSignedHash = hash.toEthSignedMessageHash();
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, ethSignedHash);
        return abi.encodePacked(r, s, v);
    }

    function testStoreDocumentHashStoresCorrectly() public {
        bytes32 hash = keccak256("test-document");
        uint256 timestamp = block.timestamp;
        bytes memory signature = _signHash(hash);

        vm.prank(signer);
        registry.storeDocumentHash(hash, timestamp, signature);

        assertTrue(registry.isDocumentStored(hash), "Document should be marked as stored");

        IDocumentRegistry.Document memory info = registry.getDocumentInfo(hash);
        assertEq(info.hash, hash, "Stored hash mismatch");
        assertEq(info.signer, signer, "Signer should match caller");
        assertTrue(info.exists, "exists flag should be true");
        assertEq(info.timestamp, timestamp, "Timestamp mismatch");
        assertEq(info.signature, signature, "Signature mismatch");
    }

    function testStoreDocumentHashRevertsIfAlreadyStored() public {
        bytes32 hash = keccak256("duplicate-document");
        uint256 timestamp = block.timestamp;
        bytes memory signature = _signHash(hash);

        vm.prank(signer);
        registry.storeDocumentHash(hash, timestamp, signature);

        vm.expectRevert(bytes("Document already stored"));
        vm.prank(signer);
        registry.storeDocumentHash(hash, timestamp, signature);
    }

    function testIsDocumentStoredReturnsFalseForUnknownHash() public {
        bytes32 unknownHash = keccak256("unknown");
        assertFalse(registry.isDocumentStored(unknownHash), "Unknown hash should return false");
    }

    function testGetDocumentSignatureReturnsStoredBytes() public {
        bytes32 hash = keccak256("signed-document");
        uint256 timestamp = block.timestamp;
        bytes memory signature = _signHash(hash);

        vm.prank(signer);
        registry.storeDocumentHash(hash, timestamp, signature);

        bytes memory storedSignature = registry.getDocumentSignature(hash);
        assertEq(storedSignature, signature, "Stored signature mismatch");
    }

    function testStoreAndVerifyDocumentWithValidSignature() public {
        bytes32 documentHash = keccak256("doc-1");
        uint256 timestamp = block.timestamp;
        bytes memory signature = _signHash(documentHash);

        vm.prank(signer);
        registry.storeDocumentHash(documentHash, timestamp, signature);

        assertTrue(registry.isDocumentStored(documentHash), "Document should be stored");

        bool isValid = registry.verifyDocument(documentHash, signer, signature);
        assertTrue(isValid, "Verification should succeed");
    }

    function testVerifyDocumentReturnsFalseWithWrongSigner() public {
        bytes32 documentHash = keccak256("doc-1");
        uint256 timestamp = block.timestamp;
        bytes memory signature = _signHash(documentHash);

        vm.prank(signer);
        registry.storeDocumentHash(documentHash, timestamp, signature);

        bool isValid = registry.verifyDocument(documentHash, address(1234), signature);
        assertFalse(isValid, "Verification should fail for wrong signer");
    }

    function testStoreDocumentHashRevertsWithInvalidSignature() public {
        bytes32 documentHash = keccak256("doc-2");
        uint256 timestamp = block.timestamp;
        bytes memory signature = _signHash(documentHash);
        // Flip one byte to make it invalid
        signature[0] = bytes1(uint8(signature[0]) ^ 0x01);

        vm.expectRevert(bytes("Invalid signature for msg.sender"));
        vm.prank(signer);
        registry.storeDocumentHash(documentHash, timestamp, signature);
    }
}
