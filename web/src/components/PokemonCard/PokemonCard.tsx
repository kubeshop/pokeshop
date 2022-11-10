import { Card, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { TPokemon } from '../../types/pokemon';
import * as S from './PokemonCard.styled';
import usePokemonCrud from '../../hooks/usePokemonCrud';

interface IProps {
  pokemon: TPokemon;
  isFeaturedList: boolean;
}

const PokemonCard = ({ pokemon: { id = 0, name = '', type = '', imageUrl = '' }, isFeaturedList }: IProps) => {
  const { deletePokemon } = usePokemonCrud();

  return (
    <Card
      hoverable
      style={{ width: 240 }}
      cover={
        <S.CardCover>
          {!isFeaturedList && (
            <S.DeleteContainer>
              <Button
                onClick={() => deletePokemon.mutate(id)}
                danger
                type="primary"
                size="small"
                shape="circle"
                icon={<CloseOutlined />}
              />
            </S.DeleteContainer>
          )}
          <img alt={name} src={imageUrl} />
        </S.CardCover>
      }
    >
      <Card.Meta title={name} description={type} />
    </Card>
  );
};

export default PokemonCard;
