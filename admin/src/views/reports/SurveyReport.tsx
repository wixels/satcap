import { useMatch } from '@tanstack/react-location';
import { useGetLinkResponses } from '../../hooks/network/useLinks';

type Props = {};

export const SurveyReport = (props: Props) => {
  const {
    params: { link },
  } = useMatch();
  const { data } = useGetLinkResponses(link);
  console.log(data);

  return <div>This is the report</div>;
};
