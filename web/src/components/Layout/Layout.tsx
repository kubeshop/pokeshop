import * as S from './Layout.styled';
import Header from '../Header';

interface IProps {
  children: React.ReactNode;
}

const Layout = ({children}: IProps) => {
  return (
    <>
      <Header />
      <S.Content>{children}</S.Content>
    </>
  );
};

export default Layout;
