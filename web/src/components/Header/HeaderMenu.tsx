import { DOCUMENTATION_URL, GITHUB_URL, DISCORD_URL } from '../../constants/common';
import * as S from './Header.styled';

interface IProps {
  pathname: string;
}

export const HeaderMenu = ({ pathname }: IProps) => {
  return (
    <S.NavMenu
      selectedKeys={[pathname]}
      items={[
        {
          key: 'github',
          label: (
            <a href={GITHUB_URL} target="_blank" data-cy="github-link">
              GitHub
            </a>
          ),
        },
        {
          key: 'docs',
          label: (
            <a href={DOCUMENTATION_URL} target="_blank" data-cy="documentation-link">
              Documentation
            </a>
          ),
        },
        {
          key: 'discord',
          label: (
            <a href={DISCORD_URL} target="_blank" data-cy="discord-link">
              Discord
            </a>
          ),
        },
      ]}
    />
  );
};
