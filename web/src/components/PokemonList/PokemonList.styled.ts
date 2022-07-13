import styled from 'styled-components';
import { Typography } from 'antd';

export const PokemonList = styled.div`
  display: flex;
  gap: 14px;
  margin: 16px 0;
  flex-wrap: wrap;
`;

export const TitleText = styled(Typography.Title).attrs({ level: 4 })`
  && {
    margin: 64px 0 0;
  }
`;
