// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {DocumentRegistry} from "../contracts/DocumentRegistry.sol";

contract Deploy is Script {
    function run() external returns (DocumentRegistry deployed) {
        vm.startBroadcast();
        deployed = new DocumentRegistry();
        console2.log("DocumentRegistry deployed at:", address(deployed));
        vm.stopBroadcast();
    }
}
