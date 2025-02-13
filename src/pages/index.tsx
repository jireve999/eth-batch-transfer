import React, { useState, useEffect } from 'react';
import { BrowserProvider, ethers, JsonRpcSigner } from 'ethers';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Config, useConnectorClient } from 'wagmi';
import { Button, Layout, message, Space, Table } from 'antd';
import ModalInputAddress from './components/ModalInputAddress';
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
            <Button type='primary'>Send a transaction</Button>
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
              provider?.getBalance("0xBF814Aa92970E1459F5b746dB2aE1C14B10f709").then(res => {
                console.log(res);
              })
            }}>test</Button>
          </Space>
        </Footer>
      </Layout>
    </div>
  );
}
