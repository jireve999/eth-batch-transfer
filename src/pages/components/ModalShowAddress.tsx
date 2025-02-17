import React, { useState } from 'react';
import { Button, Modal } from 'antd';

type AppData = {
  body: React.ReactNode,
}
const App: React.FC<AppData> = ({body}) => {
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
      <Button type="link" onClick={showModal}>
        Show Key
      </Button>
      <Modal width={600} title="Address Information" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        {body}
      </Modal>
    </>
  );
};

export default App;