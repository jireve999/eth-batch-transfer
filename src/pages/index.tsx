import React, { useState, useEffect } from 'react';
import { BrowserProvider, ethers, JsonRpcSigner, TransactionReceipt, TransactionResponse } from 'ethers';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Config, useConnectorClient } from 'wagmi';
import { Button, Layout, message, notification, Space, Table } from 'antd';
import ModalInputContent from './components/ModalInputContent';
const { Header, Footer, Sider, Content } = Layout;
import abis from "./abis/tweet.json";

type TableData = {
  address: string,
  content: string, 
  time: string,
}

export default function HomePage() {
  const [api, contextHolder] = notification.useNotification();
  // list data
  const [list, setList] = useState<TableData[]>([]);
  // balance refresh status
  const [upListCount, setUpListCount] = useState<number>(1);
  // provider info
  const { data: client } = useConnectorClient<Config>();
  const [provider, setProvider] = useState<BrowserProvider>();
  const [signer, setSigner] = useState<JsonRpcSigner>();

  // contract information
  const [contract, setContract] = useState<ethers.Contract>();

  // launch information
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

    let contract = new ethers.Contract("0x3711952A25eDB8490A395E36acD92432871F3DE9", abis, signer);
    setContract(contract);

  }, [client, provider, signer]);

  // loading list
  const loadTweetList = async () => {
    if (contract == null) return [];
    let get = contract?.getFunction("get(uint256, uint256)");
    let newVar: ethers.Result[] = await get(ethers.getUint(1), ethers.getUint(10));

    let vs: TableData[] = [];
    for (let i = 0; i < newVar.length; i++) {
      let result = newVar[i];
      vs.push({
        address: result.at(0),
        content: result.at(1),
        time: new Date(ethers.getNumber(result.at(2))).toLocaleString(),
      });
    }
    return vs;
  }

  useEffect(() => {
    loadTweetList().then(res => {
      setList(prevState => res.reverse());
    })
  }, [upListCount]);

  useEffect(() => {
    if (contract == null) return;

    // "log" || contract.filter.log
    contract.addListener("log", (address: string, str: string, time: bigint) => {

      api.success({
        message: `${address} publish a tweet`,
      });
      loadTweetList().then(res => {
        setList(prevState => res.reverse());
      })
    })

    loadTweetList().then(res => {
      setList(prevState => res.reverse());
    })
  }, [contract]);
 
  return (
    <div>
      {contextHolder}
      <Layout style={window.innerWidth > 1000 ? { padding: '100px 120px', background: '#fff' } : {padding: '100px 0px', background: '#fff'}}>
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
          <ModalInputContent onOK={async(tweet: string) => {
            let messageType = message.loading('Verifying...', -1);

            try {
              let transactionResponse: TransactionResponse = await contract?.getFunction("create(string,uint256)")(tweet, ethers.getUint(Date.now()));
              let newVar = await transactionResponse.wait();
              
              if (newVar == null || newVar.status != 1) {
                message.error("Publish failed");
                return;
              }

              messageType();
              message.success('Successfully published');
              setUpListCount(prevState => prevState + 1);
            } finally {
              messageType();
            }
          }}/>
        </Footer>
      </Layout>
    </div>
  );
}
