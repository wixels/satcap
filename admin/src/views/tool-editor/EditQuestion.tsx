import { useMatch } from '@tanstack/react-location';

type Props = {};
export const EditQuestion: React.FC<Props> = ({}) => {
  const {
    params: { surveyKey },
  } = useMatch();

  //   const form = useForm({
  //     initialValues: {
  //       questions: [questionDefaultValues],
  //     },
  //   });
  return <div>EditQuestion</div>;
};
