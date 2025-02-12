import React, { useState, useEffect } from 'react';
import { BrowserProvider, ethers, JsonRpcSigner } from 'ethers';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Config, useConnectorClient } from 'wagmi';
import { Button, Layout, Space, Table } from 'antd';
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
          />
        </Content>
        <Footer style={{textAlign: 'right'}}>
          <Space>
            <Button type='primary'>Send a transaction</Button>
            <Button type='primary'>Refresh Balance</Button>
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
