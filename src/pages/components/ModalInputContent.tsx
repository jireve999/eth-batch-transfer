import React, { useState } from 'react';
import { Button, Input, Modal } from 'antd';

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button type={'primary'} onClick={showModal}>Publish Tweet</Button>
      <Modal title="Edit Content" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <Input.TextArea rows={10} placeholder={'Please input content'}/>
      </Modal>
    </>
  );
};

export default App;