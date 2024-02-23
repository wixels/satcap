import { SimpleGrid } from '@mantine/core';
import { nanoid } from 'nanoid';
import { ToolCard } from '../../components/ToolCard';
import { useGetMine } from '../../hooks/network/useMine';

export const Tools = (): JSX.Element => {
  const { data: mine, isLoading } = useGetMine();

  return (
    <>
      <SimpleGrid
        cols={3}
        spacing="lg"
        breakpoints={[
          { maxWidth: 'md', cols: 1, spacing: 'sm' },
          { maxWidth: 'lg', cols: 2, spacing: 'lg' },
        ]}
      >
        {mine?.packages?.map((pack, i) => {
          // @ts-ignore
          if (pack?.survey?.surveys) {
            // @ts-ignore
            return pack?.survey?.surveys.map((survey) => {
              return (
                <ToolCard
                  linkId={survey.key}
                  name={survey.title}
                  description={survey.description}
                  docId={survey.key}
                  key={survey.key}
                />
              );
            });
          } else {
            return (
              <ToolCard
                linkId={pack.survey.key}
                name={pack.name}
                description={pack.scopes.join(', ')}
                docId={pack.docId}
                key={nanoid()}
              />
            );
          }
        })}
      </SimpleGrid>
    </>
  );
};
