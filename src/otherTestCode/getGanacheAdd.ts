import {ethers} from 'ethers';

let provider = new ethers.JsonRpcProvider('HTTP://127.0.0.1:7545');

provider.getSigner(0).then(res => {
  res.sendTransaction({
    to: "0x72d0fde0C5fC49112aF6Fa779213105F4B12c4D0",
    value: ethers.parseEther("0.1")
  })
})
provider.getBalance("0xD4897E29A8C5A34ef07D9f241091D73A72FE0653").then(res => {
  console.log(res);
})

provider.listAccounts().then(res => {
  res.forEach(value => {
    console.log(value.address);
  })
})

/*
ts-node index.ts
0xD4897E29A8C5A34ef07D9f241091D73A72FE0653
0x72d0fde0C5fC49112aF6Fa779213105F4B12c4D0
0x845BC8B50906c9E66BC367b73f941991D6977e85
0xCc5568b4Cac9c44F168E921653eB5bAe6CF9E036
0x76F5aD61c57e087303C25c5A084fc3BB6B24aEC6
0x0Fe31B03E1bf636c118dc01bcdd63BA815447823
0xE124104b62a67f742a35dabeEb2D48502ff769D6
0xBB73480280f34E4a71EEbd6f3ec26e308701532D
0x2C8fB4B02282b58755a6d578aD0bc05529d63dDc
0xbF6bC55e963384D5B34148994a6E9c3601234470
99799956377100365000n
*/