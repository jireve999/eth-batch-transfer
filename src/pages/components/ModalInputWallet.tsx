import React, { useState } from 'react';
import { Button, Divider, Form, Input, message, Modal } from 'antd';
import { ethers } from 'ethers';

type AppData = {
  onOK: Function
}
const App: React.FC<AppData> = ({onOK}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [count, setCount] = useState<string>(String(10));
  const [index, setIndex] = useState<string>(String(0));

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    if(count == null) {
      message.error('Please input amount');
      return;
    }
    if (ethers.getUint(count) <= 0) {
      message.error('Please input amount');
      return;
    }
    onOK && onOK(ethers.getUint(count), ethers.getUint(index));
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button onClick={showModal} type={'primary'}>Generate Address</Button>
      <Modal title="Generate Configuration" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <Divider />
        <Form>
          <Form.Item
            required
            label="Generate Quantity"
            name={'count'}
            extra={'Please input a quantity'}
          >
            <Input 
              defaultValue={count}
              onChange={e => {
              setCount(e.target.value);
            }} />
          </Form.Item>
          <Form.Item
            required
            label="Generate Index"
            name={'index'}
            extra={'Initial Index'}
            labelCol={{ style: { width: '150px' } }}
          >
            <Input 
              defaultValue={index}
              onChange={e => {
              setIndex(e.target.value);
            }}/>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default App;