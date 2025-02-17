import React, { useState, useEffect } from 'react';
import { BrowserProvider, ethers, HDNodeWallet, JsonRpcSigner, TransactionReceipt } from 'ethers';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Config, useConnectorClient } from 'wagmi';
import { Button, Layout, message, Space, Table } from 'antd';
import ModalInputWallet from './components/ModalInputWallet';
const { Header, Footer, Sider, Content } = Layout;

type TableData = {
  address: string,
  balance: string, 
  count: string,
  index: string,
  wallet: ethers.HDNodeWallet,
}

type HDVo = {
  mnemonic: string,
  path: string,
}

export default function HomePage() {
  // HD wallet
  const [hdVo, setHdVo] = useState<HDVo>();
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

    setHdVo({
      mnemonic: "basic armor style cause undo peace tilt ticket join empty market harvest",
      path: "m/44'/60'/0'/0/"
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
      <Layout style={window.innerWidth > 1000 ? { padding: '100px 200px', background: '#fff' } : {padding: '100px 0px', background: '#fff'}}>
        <Header>
          <Space style={{display: 'flex', justifyContent: 'space-between'}} align='center'>
            <div style={{color: '#fff', fontSize: '20px', fontWeight: 'bold'}}>HD Wallet Management</div>
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
                title: 'Available Balance',
                dataIndex: 'balance',
              },
              {
                title: 'Transaction Amount',
                dataIndex: 'count',
              },
              {
                title: 'Wallet Index',
                dataIndex: 'index',
              },
              {
                title: 'Key',
                dataIndex: 'state',
                render: value => {
                  return <a>Check Key</a>
                }
              },
            ]} 
            dataSource={list}
            pagination={false}
          />
        </Content>
        <Footer style={{display: 'flex', justifyContent: 'space-between'}}>
            <Space direction={'vertical'}>
              <div>MNEMONIC:</div>
              <div>{hdVo?.mnemonic}</div>
            </Space>
            <Space direction={'vertical'}>
              <div>HD PATH:</div>
              <div>{hdVo?.path}<span style={{color:'green'}}>index</span></div>
            </Space>
            <Space>
              <ModalInputWallet onOK={(count: bigint, index: bigint) => {
                if (hdVo == null) return;
                let mnemonic = ethers.Mnemonic.fromPhrase(hdVo?.mnemonic);
                let computedSeed = mnemonic.computeSeed();

                let hdNodeWallet = ethers.HDNodeWallet.fromSeed(computedSeed);

                let vs: TableData[] = [];
                for (let i = 0; i < count; i++) {
                  let start = index + ethers.getUint(i);
                  let derivePath = hdNodeWallet.derivePath(hdVo.path + start);

                  vs.push({
                    address: derivePath.address,
                    balance: '-',
                    count: '-',
                    index: String(start),
                    wallet: derivePath
                  })
                }
                setList(prevState => vs);
              }}/>
            </Space>
        </Footer>
      </Layout>
    </div>
  );
}
