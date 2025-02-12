import React, { useState } from 'react';
import { Button, Input, message, Modal } from 'antd';
import { ethers } from 'ethers';

type AppData = {
  onOK: Function
}
const App: React.FC = ({onOK}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [value, setValue] = useState<string>();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    if (value == null) {
      message.error('please input a address');
      return;
    }
    let strings = value.split("\n");

    let vs: string[] = [];
    for (let i = 0; i < strings.length; i++) {
      let string = strings[i].trim();
      if (ethers.isHexString(string, 20)) {
        vs.push(string);
      }
    }
    onOK && onOK(vs);
    console.log(vs);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button type='primary' onClick={showModal}>Input Address</Button>
      <Modal title="Basic Modal" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <Input.TextArea rows={10} placeholder='Please input one address per line' onChange={res => {
          setValue(res.target.value);
        }}/>
      </Modal>
    </>
  );
};

export default App;