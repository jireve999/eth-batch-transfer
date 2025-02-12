import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button, Layout, Space, Table } from 'antd';
const { Header, Footer, Sider, Content } = Layout;

type TableData = {
  address: string,
  balance: string, 
  state: string,
}

export default function HomePage() {
  const [list, setList] = useState<TableData[]>([]);
 
  return (
    <div>
      <Layout style={{ padding: '100px 200px' }}>
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
            <Button type='primary'>Input Address</Button>
          </Space>
        </Footer>
      </Layout>
    </div>
  );
}
