// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * ClawOrb On-chain Ownership Attestation
 * Simple immutable claim of ownership and canonical implementation.
 * Deploy on Base (or any EVM) to create a permanent public record.
 */
contract ClawOrbOwnershipAttestation {
    address public immutable owner;
    string public constant NAME = "ClawOrb";
    string public constant VERSION = "0.1.0";
    string public githubRepo;
    string public description;
    uint256 public immutable attestedAt;

    event OwnershipClaimed(
        address indexed owner,
        string githubRepo,
        string description,
        uint256 timestamp
    );

    constructor(string memory _githubRepo, string memory _description) {
        owner = msg.sender;
        githubRepo = _githubRepo;
        description = _description;
        attestedAt = block.timestamp;

        emit OwnershipClaimed(msg.sender, _githubRepo, _description, block.timestamp);
    }

    function getAttestation()
        external
        view
        returns (
            address _owner,
            string memory _name,
            string memory _version,
            string memory _repo,
            string memory _description,
            uint256 _attestedAt
        )
    {
        return (owner, NAME, VERSION, githubRepo, description, attestedAt);
    }
}
