import React, { useState } from 'react';
import { Button, Input, message, Modal } from 'antd';

type AppData = {
  onOK: Function
}
const App: React.FC<AppData> = ({onOK}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [value, setValue] = useState<string>();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    if (value == null) {
      message.error('Please input content');
      return;
    }
    onOK && onOK(value);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button type={'primary'} onClick={showModal}>Publish Tweet</Button>
      <Modal title="Edit Content" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <Input.TextArea rows={10}
          placeholder={'Please input content'}
          onChange={e => {
            setValue(e.target.value)
          }}
        />
      </Modal>
    </>
  );
};

export default App;