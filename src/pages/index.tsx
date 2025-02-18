import React, { useState, useEffect } from 'react';
import { BrowserProvider, ethers, JsonRpcSigner, TransactionReceipt } from 'ethers';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Config, useConnectorClient } from 'wagmi';
import { Button, Layout, message, Space, Table } from 'antd';
import ModalInputAddress from './components/ModalInputAddress';
import ModalInputBalance from './components/ModalInputBalance';
import ModalInputContent from './components/ModalInputContent';
const { Header, Footer, Sider, Content } = Layout;

type TableData = {
  address: string,
  content: string, 
  time: string,
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
      <Layout style={window.innerWidth > 1000 ? { padding: '100px 150px', background: '#fff' } : {padding: '100px 0px', background: '#fff'}}>
        <Header>
          <Space style={{display: 'flex', justifyContent: 'space-between'}} align='center'>
            <div style={{color: '#fff', fontSize: '20px', fontWeight: 'bold'}}>Blockchain Tweet System</div>
            <ConnectButton />
          </Space>
        </Header>
        <Content>
          <Table
            columns={[
              {
                title: 'Publisher',
                dataIndex: 'address',
              },
              {
                title: 'Content',
                dataIndex: 'content',
              },
              {
                title: 'Publish Time',
                dataIndex: 'time',
              },
            ]} 
            dataSource={list}
            pagination={false}
          />
        </Content>
        <Footer style={{textAlign: 'right'}}>
          <ModalInputContent />
        </Footer>
      </Layout>
    </div>
  );
}
