import React, { useState, useEffect } from 'react';
import { BrowserProvider, ethers, JsonRpcSigner, TransactionReceipt } from 'ethers';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Config, useConnectorClient } from 'wagmi';
import { Button, Divider, Layout, message, Space, Table } from 'antd';
import ModalInputAddress from './components/ModalInputAddress';
import ModalInputBalance from './components/ModalInputBalance';
const { Header, Footer, Sider, Content } = Layout;

type TableData = {
  address: string,
  balance: string, 
  state: string,
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

  // transaction Listening
  const onHash = async (hash: string) => {
    let transaction = await provider?.getTransaction(hash);
    if (transaction == null) return;
    if (transaction.from != signer?.address) return;

    setList(prevState => {
      let vs: TableData[] = [];
      for(let i = 0; i < prevState.length; i++) {
        let tableDatum = prevState[i];
        if (tableDatum.address == transaction.to) {
          tableDatum.state = "transaction is handling...";
        }
        vs.push(tableDatum);
      }
      return vs;
    })

    provider?.once(hash, (tx: TransactionReceipt) => {
      setList(prevState => {
        let vs: TableData[] = [];
        for(let i = 0; i < prevState.length; i++) {
          let tableDatum = prevState[i];
          if (tableDatum.address == tx.to) {
            if (tx.status == 1) {
              tableDatum.state = "Transaction Credited";
            } else {
              tableDatum.state = "transaction is failed";
            }
          }
          vs.push(tableDatum);
        }
        return vs;
      })
    })
  }
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

    let jsonRpcProvider = new ethers.JsonRpcProvider(client.chain.rpcUrls.default.http[0]);
    jsonRpcProvider.addListener("pending", hash => {
      onHash(hash);
    })
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
              <ModalInputBalance signer={signer} onOK={(value: bigint) => {
                console.log(value)
                if (list.length == 0) return;
                for (let i = 0; i < list.length; i++) {
                  let tableDatum = list[i];
                  let tx = {
                    to: tableDatum.address,
                    value: value,
                  }
                  signer?.sendTransaction(tx).then(res => {
                    console.log(res);
                  })
                }
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
                console.log('contractVo', contractVo);
              }}>test</Button>
            </Space>
          </div>
        </Footer>
      </Layout>
    </div>
  );
}
