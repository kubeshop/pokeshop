import { DOCUMENTATION_URL, GITHUB_URL, COMMUNITY_SLACK_URL } from '../../constants/common';
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
          key: 'slack',
          label: (
            <a href={COMMUNITY_SLACK_URL} target="_blank" data-cy="slack-link">
              Slack
            </a>
          ),
        },
      ]}
    />
  );
};
