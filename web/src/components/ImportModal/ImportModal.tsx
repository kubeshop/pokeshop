import { Modal, Form, Input } from 'antd';

interface IImportValues {
  id: number;
}

interface IProps {
  isOpen: boolean;
  onImport(values: IImportValues): void;
  onClose(): void;
}

const ImportModal = ({ isOpen, onImport, onClose }: IProps) => {
  const [form] = Form.useForm<IImportValues>();
  const handleSubmit = (values: IImportValues) => {
    onClose();
    onImport(values);
  };

  return (
    <Modal title="Import Pokemon" visible={isOpen} onOk={() => form.submit()} onCancel={onClose}>
      <Form form={form} onFinish={handleSubmit} data-cy="import-pokemon-form">
        <Form.Item name="id" label="ID" rules={[{ required: true, message: 'Please input ID!' }]}>
          <Input type="number" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ImportModal;
