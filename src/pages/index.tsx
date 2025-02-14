import React, { useState, useEffect } from 'react';
import { BrowserProvider, ethers, JsonRpcSigner, TransactionReceipt,hexZeroPad } from 'ethers';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Config, useConnectorClient } from 'wagmi';
import { Button, Layout, message, Space, Table } from 'antd';
import ModalInputAddress from './components/ModalInputAddress';
import ModalInputBalance from './components/ModalInputBalance';
const { Header, Footer, Sider, Content } = Layout;

type TableData = {
  address: string,
  balance: string, 
  state: string,
}

export default function HomePage() {
  // list data
  const [list, setList] = useState<TableData[]>([]);
  // balance refresh status
  const [upListCount, setUpListCount] = useState<number>(1);
  // provider info
  const { data: client } = useConnectorClient<Config>();
  const [provider, setProvider] = useState<BrowserProvider>();
  const [signer, setSigner] = useState<JsonRpcSigner>();

  useEffect(() => {
    if (client == null) {
      return;
    }
    let browserProvider = new ethers.BrowserProvider(client.transport);
    setProvider(browserProvider);

    browserProvider.getSigner(0).then(res => {
      setSigner(res);
    })
    return () => {
      if (provider) {
        provider.destroy();
        setProvider(undefined);
        setSigner(undefined);
      }
    }
  }, [client]);

  // transaction Listening
  // const onHash = async (hash: string) => {
  //   let transaction = await provider?.getTransaction(hash);
  //   if (transaction == null) return;
  //   if (transaction.from != signer?.address) return;

  //   setList(prevState => {
  //     let vs: TableData[] = [];
  //     for(let i = 0; i < prevState.length; i++) {
  //       let tableDatum = prevState[i];
  //       if (tableDatum.address == transaction.to) {
  //         tableDatum.state = "transaction is handling...";
  //       }
  //       vs.push(tableDatum);
  //     }
  //     return vs;
  //   })

  //   provider?.once(hash, (tx: TransactionReceipt) => {
  //     setList(prevState => {
  //       let vs: TableData[] = [];
  //       for(let i = 0; i < prevState.length; i++) {
  //         let tableDatum = prevState[i];
  //         if (tableDatum.address == tx.to) {
  //           if (tx.status == 1) {
  //             tableDatum.state = "Transaction Credited";
  //           } else {
  //             tableDatum.state = "transaction is failed";
  //           }
  //         }
  //         vs.push(tableDatum);
  //       }
  //       return vs;
  //     })
  //   })
  // }
  // useEffect(() => {
  //   if (client == null || provider == null || signer == null) {
  //     return;
  //   }
  //   let jsonRpcProvider = new ethers.JsonRpcProvider(client.chain.rpcUrls.default.http[0]);
  //   jsonRpcProvider.addListener("pending", hash => {
  //     onHash(hash);
  //   })
  // }, [client, provider, signer]);

  // balance refresh
  const upBalance = async () => {
    let vs:TableData[] = [];
    for (let i = 0; i < list.length; i++) {
      let tableDatum = list[i];
      let wei = await provider?.getBalance(tableDatum.address);
      tableDatum.balance = ethers.formatEther(wei == null ? 0 : wei);
      vs.push(tableDatum);
    }
    return vs;
  }

  useEffect(() => {
    upBalance().then(res => {
      setList(prevState => res);
    });
  }, [upListCount]);
 
  return (
    <div>
      <Layout style={window.innerWidth > 1000 ? { padding: '100px 200px', background: '#fff' } : {padding: '100px 0px', background: '#fff'}}>
        <Header>
          <Space style={{display: 'flex', justifyContent: 'space-between'}} align='center'>
            <div style={{color: '#fff', fontSize: '20px', fontWeight: 'bold'}}>Eth Batch Transfer</div>
            <ConnectButton />
          </Space>
        </Header>
        <Content>
          <Table
            columns={[
              {
                title: 'Address',
                dataIndex: 'address',
              },
              {
                title: 'Balance',
                dataIndex: 'balance',
              },
              {
                title: 'State',
                dataIndex: 'state',
              },
            ]} 
            dataSource={list}
            pagination={false}
          />
        </Content>
        <Footer style={{textAlign: 'right'}}>
          <Space>
            <ModalInputBalance signer={signer} onOK={(value: bigint) => {
              console.log(value)
              if (list.length == 0) return;

              let add:string[] = [];
              let total:bigint = BigInt(0);
              for (let i = 0; i < list.length; i++) {
                let tableDatum = list[i];
                add.push(tableDatum.address);
                total = total + value;
              }

              // create ABI coder instance
              let abiCoder = new ethers.AbiCoder();
              // coder parameter
              let encodedParams = abiCoder.encode(["address[]", "uint256"], [add, value]);
              // Get the Method Selector (First 4 Bytes)
              let methodSelector = ethers.keccak256(ethers.toUtf8Bytes("name(address[],uint256)")).slice(0, 10);
              // Concatenate the Method Selector and Encoded Parameters
              let data = ethers.concat([ethers.zeroPadValue(methodSelector, 4), encodedParams]);
              // Send the Transaction
                signer?.sendTransaction({
                  to: "0xFc042fAFD5788c45442DA45492ac6BB7FF4E81E0",
                  data: data,
                  value: total
                }).then(res => {
                  if (res == null) {
                    message.error('Transaction is failed');
                    return;
                };
                setList(prevState => {
                  let vs: TableData[] = [];
                  for(let i = 0; i < prevState.length; i++) {
                    let tableDatum = prevState[i];
                    tableDatum.state = "transaction is handling...";
                    vs.push(tableDatum);
                  }
                  return vs;
                })
                provider?.once(res.hash, (res: TransactionReceipt) => {
                  setList(prevState => {
                    let vs: TableData[] = [];
                    for(let i = 0; i < prevState.length; i++) {
                       let tableDatum = prevState[i];
                       tableDatum.state = res.status == 1 ? "Transaction Credited" : "transaction is handling...";
                       vs.push(tableDatum);
                    }
                    return vs;
                  })
                  setUpListCount(prevState => prevState + 1);
                })
              })
            }}/>
            <Button type='primary' onClick={() => {
              if (list.length == 0) {
                message.error('Not found');
                return;
              }
              setUpListCount(prevState => prevState + 1);
              message.success('Refresh Balance Success');
            }}>Refresh Balance</Button>
            <ModalInputAddress onOK={(res: string[]) => {
              console.log(res);
              let vs: TableData[] = [];
              for(let i = 0; i < res.length; i++) {
                vs.push({
                  address: res[i],
                  balance: '-',
                  state: '-'
                })
              }
              setList(prevState => vs);
              setUpListCount(prevState => prevState + 1);
            }}/>
            <Button onClick={() => {
              // ethers V5
              // let abiCoder = ethers.AbiCoder.defaultAbiCoder();
              // let s = abiCoder.encode(["address[]", "uint256"], [["0x72d0fde0C5fC49112aF6Fa779213105F4B12c4D0"], ethers.parseEther("1")]);
              // let s1 = ethers.id("name(address[], uint256)").slice(0,10);
              // signer?.sendTransaction({
              //   to: "0xFc042fAFD5788c45442DA45492ac6BB7FF4E81E0",
              //   data: ethers.concat([s1,s]),
              //   value: ethers.parseEther("1")
              // }).then(res => {
              //   console.log(res);
              // })

              // ethers V6
              // https://github.com/ethers-io/ethers.js/issues/3795
              // create ABI coder instance
              let abiCoder = new ethers.AbiCoder();
              // coder parameter
              let encodedParams = abiCoder.encode(
                ["address[]", "uint256"], 
                [["0x72d0fde0C5fC49112aF6Fa779213105F4B12c4D0"], ethers.parseEther("1")]
              );
              // Get the Method Selector (First 4 Bytes)
              let methodSelector = ethers.keccak256(ethers.toUtf8Bytes("name(address[],uint256)")).slice(0, 10);
              // Concatenate the Method Selector and Encoded Parameters
              let data = ethers.concat([ethers.zeroPadValue(methodSelector, 4), encodedParams]);
              // Send the Transaction
              signer?.sendTransaction({
                to: "0xFc042fAFD5788c45442DA45492ac6BB7FF4E81E0",
                data: data,
                value: ethers.parseEther("1")
              }).then(res => {
                console.log(res);
              }).catch(error => {
                console.error("Error sending transaction:", error);
              });

              // provider?.getBalance("0xD4897E29A8C5A34ef07D9f241091D73A72FE0653").then(res => {
              //   console.log(res);
              // })
            }}>test</Button>
          </Space>
        </Footer>
      </Layout>
    </div>
  );
}
