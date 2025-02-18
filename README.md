# ETH-batch-transfer-ethers

## Tech Stack
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Antd](https://img.shields.io/badge/AntDesign-0170FE?style=for-the-badge&logo=antdesign&logoColor=black)
![ethers.js](https://img.shields.io/badge/Ethersjs-2535A0?style=for-the-badge&logo=ethers&logoColor=white)
![wagmi](https://img.shields.io/badge/wagmi-000000?style=for-the-badge&logo=wagmi&logoColor=white)

## Description
This is an project that supports:

I. ETH | ERC20 batch transfer 
1. balance inquiry
2. initiating transfers
3. viewing transaction results

ETH
<img src="docs/ETH.png" width="200" alt="ETH">
ERC20
<img src="docs/ERC20.png" width="200" alt="ERC20">

II. HD Wallet Management
1. HD wallet generation
2. HD wallet balance inquiry
3. HD wallet address and private key shown
<img src="docs/HDWallet.png" width="200" alt="HDWallet">

III. Blockchain Tweet System
1. tweet contract
2. loading tweet list
3. listening tweet events
<img src="docs/TWEET1.png" width="200" alt="TWEET1">
<img src="docs/TWEET2.png" width="200" alt="TWEET2">

## Getting Started
First, run the development server:
```bash
pnpm run dev
```
Open [http://localhost:8000](http://localhost:8000) with your browser to see the result.

## Deploy
```bash
umi build
```
Project will be generated under './dist' folder:
```bash
./dist
├── index.html
├── umi.css
└── umi.js
```