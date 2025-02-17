import React, { useState, useEffect } from 'react';
import { BrowserProvider, ethers, JsonRpcSigner, TransactionReceipt } from 'ethers';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Config, useConnectorClient } from 'wagmi';
import { Button, Divider, Layout, message, Space, Table } from 'antd';
import ModalInputAddress from './components/ModalInputAddress';
import ModalInputBalanceERC20 from './components/ModalInputBalanceERC20';
const { Header, Footer, Sider, Content } = Layout;

type TableData = {
  address: string,
  balance: string, 
  state: string | React.ReactNode,
}

type ERC20Metadata = {
  address: string,
  name: string,
  symbol: string,
  decimals: number,
}

export default function HomePage() {
  // contract info
  const [contractVo, setContractVo] = useState<ERC20Metadata>();
  // available balance of current connected account
  const [addressBalance, setAddressBalance] = useState<string>();
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

  useEffect(() => {
    if (client == null || provider == null || signer == null) {
      return;
    }

    // read contract info
    let cdr = "0x46B58F692FeA47a81D01B82855a31b3B1F9b8239";
    const readContractInfoFn = async () => {
      let abiCoder = ethers.AbiCoder.defaultAbiCoder();
      let name = await provider.call({
        to: cdr,
        data: ethers.id("name()").slice(0, 10)
      });
      let symbol = await provider.call({
        to: cdr,
        data: ethers.id("symbol()").slice(0, 10)
      });
      let decimals = await provider.call({
        to: cdr,
        data: ethers.id("decimals()").slice(0, 10)
      });

      setContractVo({
        address: cdr,
        name: abiCoder.decode(["string"], name).at(0),
        symbol: abiCoder.decode(["string"], symbol).at(0),
        decimals: abiCoder.decode(["uint8"], decimals).at(0),
      })
    }

    readContractInfoFn();
  }, [client, provider, signer]);

  // balance refresh
  const upBalance = async () => {
    let vs:TableData[] = [];
    for (let i = 0; i < list.length; i++) {
      let tableDatum = list[i];
      tableDatum.balance = await balanceOf(tableDatum.address);
      vs.push(tableDatum);
    }
    return vs;
  }

  useEffect(() => {
    upBalance().then(res => {
      setList(prevState => res);
    });

    if (signer == null) return;
    if (contractVo == null) return;
    balanceOf(signer?.address).then(res => {
      setAddressBalance(res);
    })
  }, [upListCount]);

  // contract available balance query
  const balanceOf = async (address: string) => {
    let abiCoder = ethers.AbiCoder.defaultAbiCoder();
    let s = ethers.id("balanceOf(address)").slice(0,10);
    let s1 = abiCoder.encode(["address"], [address]);
    let s2 = await provider?.call({
      to: contractVo?.address,
      data: ethers.concat([s, s1]),
    });
    if (s2 == null) {
      return '-';
    }
    return ethers.formatUnits(abiCoder.decode(["uint256"], s2).at(0), contractVo?.decimals) + " " + contractVo?.symbol;
  }

  useEffect(() => {
    if (contractVo == null) return;
    if (signer == null) return;

    balanceOf(signer?.address).then(res => {
      setAddressBalance(res);
    })
  }, [signer, contractVo]);
 
  return (
    <div>
      <Layout style={window.innerWidth > 1000 ? { padding: '100px 50px', background: '#fff' } : {padding: '100px 0px', background: '#fff'}}>
        <Header>
          <Space style={{display: 'flex', justifyContent: 'space-between'}} align='center'>
            <div style={{color: '#fff', fontSize: '20px', fontWeight: 'bold'}}>ERC20 Batch Transfer</div>
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
        <Footer style={{display: 'inline-block'}}>
          <Space>
            <Space>
              <div style={{fontWeight: 'bold'}}>Contract address: </div>
              <div>{contractVo?.address}</div>
            </Space>
            <Space>
              <div style={{fontWeight: 'bold'}}>Available Balance: </div>
              <div>{addressBalance}</div>
            </Space>
          </Space>
          <Divider />
          <div style={{textAlign: 'right'}}>
            <Space>
              <ModalInputBalanceERC20
                signer={signer}
                onOK={(value: bigint) => {
                  console.log(value)
                  if (list.length == 0) return;

                  let abiCoder = new ethers.AbiCoder();
                  let methodSelector = ethers.id("transfer(address,uint256)").slice(0, 10);
                 
                  for (let i = 0; i < list.length; i++) {
                    let tableDatum = list[i];
                    let encodedParams = abiCoder.encode(["address", "uint256"], [tableDatum.address, ethers.parseUnits(String(value), contractVo?.decimals)]);
                    let data = ethers.concat([methodSelector, encodedParams]);
  
                    signer?.sendTransaction({
                      to: contractVo?.address,
                      data: data
                    }).then(res => {
                      setList(prevState => {
                        let vs: TableData[] = [];
                        for (let i = 0; i < prevState.length; i++) {
                          let tableDatum1 = prevState[i];
                          if (tableDatum1.address == tableDatum.address) {
                            tableDatum1.state = <div style={{ color: 'orange'}}>Transaction Verifying...</div>
                          }
                          vs.push(tableDatum1);
                        }
                        return vs;
                      })
                      provider?.once(res.hash, (tr: TransactionReceipt) => {
                        setList(prevState => {
                          let vs: TableData[] = [];
                          for (let i = 0; i < prevState.length; i++) {
                            let tableDatum1 = prevState[i];
                            if (tableDatum1.address == tableDatum.address) {
                              if (tr.status == 1) {
                                tableDatum1.state = <div style={{ color: 'green'}}>Transaction Success</div>
                              } else {
                                tableDatum1.state = <div style={{ color: 'red'}}>Transaction Failed</div>
                              }
                            }
                            vs.push(tableDatum1);
                          }
                          return vs;
                        })
                        setUpListCount(prevState => prevState + 1);
                      })
                    }).catch(error => {
                      console.error("Error sending transaction:", error);
                    });
                  }
                }}
                balanceOf={balanceOf}
              />
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
                let abiCoder = new ethers.AbiCoder();
                console.log(abiCoder)
                let encodedParams = abiCoder.encode(["address", "uint256"], ["0x72d0fde0C5fC49112aF6Fa779213105F4B12c4D0", ethers.parseUnits("1", 18)]);
                let methodSelector = ethers.id("transfer(address,uint256)").slice(0, 10);
                let data = ethers.concat([methodSelector, encodedParams]);

                signer?.sendTransaction({
                  to: contractVo?.address,
                  data: data
                }).then(res => {
                  console.log(res);
                }).catch(error => {
                  console.error("Error sending transaction:", error);
                });
              }}>test</Button>
            </Space>
          </div>
        </Footer>
      </Layout>
    </div>
  );
}
