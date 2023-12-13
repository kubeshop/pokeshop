import { Modal, Form, Input, Switch } from 'antd';
import { TCreatePokemon } from '../../types/pokemon';

type TCreteValues = Required<TCreatePokemon>;

interface IProps {
  isOpen: boolean;
  onCreate(values: TCreteValues): void;
  onClose(): void;
}

const CreateModal = ({ isOpen, onCreate, onClose }: IProps) => {
  const [form] = Form.useForm<TCreteValues>();
  const handleSubmit = (values: TCreteValues) => {
    onClose();
    onCreate(values);
  };

  return (
    <Modal title="Create Pokemon" visible={isOpen} onOk={() => form.submit()} onCancel={onClose}>
      <Form form={form} onFinish={handleSubmit} data-cy="create-pokemon-modal">
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input a Name' }]}>
          <Input />
        </Form.Item>

        <Form.Item name="type" label="Type" rules={[{ required: true, message: 'Please input a Type' }]}>
          <Input />
        </Form.Item>

        <Form.Item name="isFeatured" label="Is Featured">
          <Switch />
        </Form.Item>

        <Form.Item
          name="imageUrl"
          label="Image URL"
          rules={[
            { required: true, message: 'Please input a valid url' },
            { type: 'url', message: 'Image url is not valid' },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateModal;
