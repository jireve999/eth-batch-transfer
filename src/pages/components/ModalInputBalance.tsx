import React, { useState } from 'react';
import { Button, Divider, Input, message, Modal, Space } from 'antd';
import { ethers, JsonRpcSigner } from 'ethers';

type AppData = {
  signer: JsonRpcSigner | undefined,
  onOK: Function,
}
const App: React.FC<AppData> = ({ signer, onOK }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balance, setBalance] = useState<string>();
  const [value, setValue] = useState<string>();

  const showModal = () => {
    signer?.provider.getBalance(signer?.address).then(res => {
      setBalance(ethers.formatEther(res));
    })
    setIsModalOpen(true);
  };

  const handleOk = () => {
    if (value == null) {
      message.error('Please input amount');
      return;
    }
    let bigint = ethers.parseEther(value);
    if (bigint < 0) {
      message.error('Input amount error');
      return;
    }
    onOK && onOK(bigint);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button type='primary' onClick={showModal}>Send a transaction</Button>
      <Modal title="Input Transfer Amount" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <Divider />
        <Space direction='vertical' style={{width: '100%'}}>
          <div>Transfer Amount</div>
          <Input placeholder={'Please input amount'} onChange={res => {
            setValue(res.target.value);
          }}/>
        </Space>
        <Space style={{padding: '20px 0', color: 'green', fontWeight: 'bold', fontSize: '20px'}}>
          <div>Balance: {balance}</div>
        </Space>
      </Modal>
    </>
  );
};

export default App;