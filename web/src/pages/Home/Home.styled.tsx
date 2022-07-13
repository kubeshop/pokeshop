import { Button, Typography } from 'antd';
import styled from 'styled-components';

export const CreateTestButton = styled(Button)``;

export const PageHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: end;
  width: 100%;
  margin: 14px 0;
`;

export const TitleText = styled(Typography.Title).attrs({ level: 3 })`
  && {
    margin: 14px 0;
  }
`;

export const Wrapper = styled.div`
  padding: 0 24px;
  flex-grow: 1;
`;

export const ActionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

export const NoResultsContainer = styled.div`
  height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;
