import { FC } from 'react';
import Logo from '../../assets/Logo.svg';
import { Link, useLocation } from 'react-router-dom';
import * as S from './Header.styled';
import { HeaderMenu } from './HeaderMenu';

const Header: FC = () => {
  const { pathname } = useLocation();

  return (
    <S.Header>
      <Link to="/">
        <img alt="tracetest_log" data-cy="logo" src={Logo} />
      </Link>
      <HeaderMenu pathname={pathname} />
    </S.Header>
  );
};

export default Header;
