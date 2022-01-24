# [swaveportal](https://swaveportal.herokuapp.com/)

![swaveportal](./screenshot.png)

This is my personal wave portal, the name stands for sporturno wave portal.

# Overview

In this webiste anyone on the internet can send me a wave (message) and have that data stored on the blockchain through an Ethereum smart contract. This project was build using HardHat framework and the smart contract was deployed to Rinkeby test network. When a user leaves a message, they have a 50% chance of being rewarded with an amount of ETH. There is also an anti-bot system to prevent spamming where the same account must wait at least 30 (testing purposes)

## Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```
