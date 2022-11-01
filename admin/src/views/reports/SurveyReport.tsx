import { Avatar, Group, SimpleGrid, Text, UnstyledButton } from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons';
import { Link, useMatch } from '@tanstack/react-location';
import { useMemo } from 'react';
import { useGetSingleLink } from '../../hooks/network/useLink';
import { LocationGenerics } from '../../router';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { randomColor } from '../../utils/randomColor';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const viz = {
  // 'wp-two-one': [
  // ],
  // 'wp-three-two': [],
  'wp-three-one': [
    {
      key: 'Pre-Application Survey Responses',
      survey: 'wp-three-one-pre',
      qKeys: [
        'questionTwentyTwo',
        'questionTwenty',
        'questionFifteen',
        'questionFourteen',
        'questionThirteen',
        'questionNine',
        'questionSeven',
        'questionSix',
      ],
      mutatorFn: (
        responses: any[],
        qKeys: string[],
        key: string,
        survey?: string
      ) => {
        // resCopy.
        const filteredBySurvey = responses?.filter((x) => x?.survey === survey);
        const labels: any[] = qKeys;
        let datasets: any[] = [
          {
            label: 'Yes',
            data: [],
            backgroundColor: '#FDB51B',
          },
          {
            label: 'No',
            data: [],
            backgroundColor: '#DD382F',
          },
        ];

        labels.forEach((label) => {
          let yes = 0;
          let no = 0;
          filteredBySurvey.forEach((res) => {
            res[label] === 'Yes' ? yes++ : no++;
          });
          datasets[0].data.push(yes);
          datasets[1].data.push(no);
        });
        return (
          <Bar
            key={`${key}-${survey}`}
            options={{
              indexAxis: 'y',
              plugins: {
                title: {
                  display: true,
                  text: key,
                },
              },
              responsive: true,
              scales: {
                x: {
                  stacked: true,
                },
                y: {
                  stacked: true,
                },
              },
            }}
            data={{
              labels,
              datasets,
            }}
          />
        );
      },
    },
    {
      key: 'Post-Application Checklist',
      survey: 'wp-three-one-post',
      qKeys: ['questionSeven', 'questionSix', 'questionThree'],
      mutatorFn: (
        responses: any[],
        qKeys: string[],
        key: string,
        survey?: string
      ) => {
        const filteredBySurvey = responses?.filter((x) => x?.survey === survey);
        const labels: string[] = qKeys;

        let datasets: any[] = [
          {
            label: 'Yes',
            data: [],
            backgroundColor: '#FDB51B',
          },
          {
            label: 'No',
            data: [],
            backgroundColor: '#DD382F',
          },
        ];

        labels.forEach((label) => {
          let yes = 0;
          let no = 0;
          filteredBySurvey.forEach((res) => {
            res[label] === 'Yes' ? yes++ : no++;
          });
          datasets[0].data.push(yes);
          datasets[1].data.push(no);
        });
        return (
          <Bar
            key={`${key}-${survey}`}
            options={{
              indexAxis: 'y',
              plugins: {
                title: {
                  display: true,
                  text: key,
                },
              },
              responsive: true,
              scales: {
                x: {
                  stacked: true,
                },
                y: {
                  stacked: true,
                },
              },
            }}
            data={{
              labels,
              datasets,
            }}
          />
        );
      },
    },
    {
      key: 'Post-response Checklist Responses',
      survey: 'wp-three-one-post-response',
      qKeys: ['questionThree', 'questionTwo', 'questionOne'],
      mutatorFn: (
        responses: any[],
        qKeys: string[],
        key: string,
        survey?: string
      ) => {
        const filteredBySurvey = responses?.filter((x) => x?.survey === survey);
        const labels: string[] = qKeys;

        let datasets: any[] = [
          {
            label: 'Yes',
            data: [],
            backgroundColor: '#FDB51B',
          },
          {
            label: 'No',
            data: [],
            backgroundColor: '#DD382F',
          },
        ];

        labels.forEach((label) => {
          let yes = 0;
          let no = 0;
          filteredBySurvey.forEach((res) => {
            res[label] === 'Yes' ? yes++ : no++;
          });
          datasets[0].data.push(yes);
          datasets[1].data.push(no);
        });
        return (
          <Bar
            key={`${key}-${survey}`}
            options={{
              indexAxis: 'y',
              plugins: {
                title: {
                  display: true,
                  text: key,
                },
              },
              responsive: true,
              scales: {
                x: {
                  stacked: true,
                },
                y: {
                  stacked: true,
                },
              },
            }}
            data={{
              labels,
              datasets,
            }}
          />
        );
      },
    },
    {
      key: 'Preferred Medium of Communication',
      survey: 'wp-three-one-post-response',
      qKeys: ['questionFive'],
      mutatorFn: (
        responses: any[],
        qKeys: string[],
        key: string,
        survey?: string
      ) => {
        const filteredBySurvey = responses?.filter((x) => x?.survey === survey);
        const labels: string[] = qKeys;

        let datasets: any[] = [
          {
            data: [],
            backgroundColor: '#FDB51B',
          },
        ];

        labels.forEach((label) => {
          let Cellphone = 0;
          let Email = 0;
          let Other = 0;
          filteredBySurvey.forEach((res) => {
            res[label] === 'Cellphone'
              ? Cellphone++
              : res[label] === 'Email'
              ? Email++
              : Other++;
          });
          datasets[0].data.push(Cellphone);
          datasets[0].data.push(Email);
          datasets[0].data.push(Other);
        });
        return (
          <Bar
            key={`${key}-${survey}`}
            options={{
              plugins: {
                legend: {
                  display: false,
                },
                title: {
                  display: true,
                  text: key,
                },
              },
              responsive: true,
              scales: {
                x: {
                  stacked: true,
                },
                y: {
                  stacked: true,
                },
              },
            }}
            data={{
              labels: ['Cell', 'Email', 'Other'],
              datasets,
            }}
          />
        );
      },
    },
    {
      key: 'Service Offering',
      survey: 'wp-three-one-pre',
      qKeys: ['questionFive'],
      mutatorFn: (
        responses: any[],
        qKeys: string[],
        key: string,
        survey?: string
      ) => {
        const filteredBySurvey = responses?.filter((x) => x?.survey === survey);
        const set = new Set();
        filteredBySurvey.forEach((res) => {
          set.add(res[qKeys[0]]);
        });
        const labels = Array.from(set);
        let datasets: any[] = [
          {
            data: [],
            backgroundColor: labels.map((_) => randomColor()),
          },
        ];
        labels.forEach((label, i) => {
          let count = 0;
          filteredBySurvey.forEach((res) => {
            res[qKeys[0]] === label && count++;
          });
          datasets[0].data.push(count);
        });

        return (
          <Pie
            key={`${key}-${survey}`}
            options={{
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: key,
                },
              },
            }}
            data={{
              labels,
              datasets,
            }}
          />
        );
      },
    },
  ],
  'wp-three-two': [
    {
      key: 'Baseline Community Challenges',
      qKeys: ['communityQuestionThirteen'],
      mutatorFn: (responses: any[], qKeys: string[], key: string) => {
        const filtered = responses.filter((x) => x[qKeys[0]]);

        const set = new Set();
        filtered.forEach((res) => {
          const item = res[qKeys[0]];
          if (item) {
            set.add(item);
          }
        });
        const labels = Array.from(set);
        let datasets: any[] = [
          {
            data: [],
            backgroundColor: labels.map((_) => randomColor()),
          },
        ];
        labels.forEach((label) => {
          let count = 0;
          filtered.forEach((res) => {
            if (res && Array.isArray(res)) {
              // @ts-ignore
              res[qKeys[0]].includes(label) && count++;
            } else {
              res[qKeys[0]] === label && count++;
            }
          });
          datasets[0].data.push(count);
        });

        return (
          <Bar
            key={`${key}`}
            options={{
              plugins: {
                title: {
                  display: true,
                  text: key,
                },
                legend: {
                  display: false,
                },
              },
              responsive: true,
              scales: {
                x: {
                  stacked: true,
                },
                y: {
                  stacked: true,
                },
              },
            }}
            data={{
              labels,
              datasets,
            }}
          />
        );
      },
    },
    {
      key: 'Assets required for community upliftment for the future',
      qKeys: ['communityQuestionTwentySix'],
      mutatorFn: (responses: any[], qKeys: string[], key: string) => {
        const filtered = responses.filter((x) => x[qKeys[0]]);

        const set = new Set();
        filtered.forEach((res) => {
          const item = res[qKeys[0]];
          if (item) {
            set.add(item);
          }
        });
        const labels = Array.from(set);

        let datasets: any[] = [
          {
            data: [],
            backgroundColor: labels.map((_) => randomColor()),
          },
        ];
        labels.forEach((label, i) => {
          let count = 0;
          filtered.forEach((res) => {
            if (res && Array.isArray(res)) {
              // @ts-ignore
              res[qKeys[0]].includes(label) && count++;
            } else {
              res[qKeys[0]] === label && count++;
            }
          });
          datasets[0].data.push(count);
        });

        return (
          <Pie
            key={`${key}`}
            options={{
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: key,
                },
              },
            }}
            data={{
              labels,
              datasets,
            }}
          />
        );
      },
    },
    {
      key: 'SMMEs that applied for funding/loans',
      qKeys: ['SMMEQuestionThirteen'],
      mutatorFn: (responses: any[], qKeys: string[], key: string) => {
        const filtered = responses.filter((x) => x[qKeys[0]]);

        let yes = 0;
        let no = 0;
        filtered.forEach((res) => {
          res[qKeys[0]] === 'Yes' ? yes++ : no++;
        });
        return (
          <Pie
            key={`${key}`}
            options={{
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: key,
                },
              },
            }}
            data={{
              labels: ['Yes', 'No'],
              datasets: [
                {
                  data: [yes, no],
                  backgroundColor: ['#FDB51B', '#DD382F'],
                },
              ],
            }}
          />
        );
      },
    },
    {
      key: 'Success in obtaining loan/grant  ',
      qKeys: ['SMMEQuestionThirteenOne'],
      mutatorFn: (responses: any[], qKeys: string[], key: string) => {
        const filtered = responses.filter((x) => x[qKeys[0]]);

        let yes = 0;
        let no = 0;

        filtered.forEach((res) => {
          res[qKeys[0]] === 'Yes' ? yes++ : no++;
        });
        return (
          <Pie
            key={`${key}`}
            options={{
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: key,
                },
              },
            }}
            data={{
              labels: ['Yes', 'No'],
              datasets: [
                {
                  data: [yes, no],
                  backgroundColor: ['#FDB51B', '#DD382F'],
                },
              ],
            }}
          />
        );
      },
    },
    {
      key: 'Utilisation of funding support by SMME ',
      qKeys: ['SMMEQuestionThirteenOneOne'],
      mutatorFn: (responses: any[], qKeys: string[], key: string) => {
        const filtered = responses.filter((x) => x[qKeys[0]]);

        const set = new Set();
        filtered.forEach((res) => {
          const item = res[qKeys[0]];
          if (item) {
            set.add(item);
          }
        });
        const labels = Array.from(set);

        let datasets: any[] = [
          {
            data: [],
            backgroundColor: labels.map((_) => randomColor()),
          },
        ];
        labels.forEach((label) => {
          let count = 0;
          filtered.forEach((res) => {
            res[qKeys[0]] === label && count++;
          });
          datasets[0].data.push(count);
        });

        return (
          <Bar
            key={`${key}`}
            options={{
              plugins: {
                title: {
                  display: true,
                  text: key,
                },
                legend: {
                  display: false,
                },
              },
              responsive: true,
              scales: {
                x: {
                  stacked: true,
                },
                y: {
                  stacked: true,
                },
              },
            }}
            data={{
              labels,
              datasets,
            }}
          />
        );
      },
    },
    {
      key: 'SMME awarenes of Black Industrialist Scheme (BIS)',
      qKeys: ['SMMEQuestionThirtyOne'],
      mutatorFn: (responses: any[], qKeys: string[], key: string) => {
        const filtered = responses.filter((x) => x[qKeys[0]]);
        const set = new Set();
        filtered.forEach((res) => {
          const item = res[qKeys[0]];
          if (item) {
            set.add(item);
          }
        });
        const labels = Array.from(set);

        let datasets: any[] = [
          {
            data: [],
            backgroundColor: labels.map((_) => randomColor()),
          },
        ];
        labels.forEach((label, i) => {
          let count = 0;
          filtered.forEach((res) => {
            res[qKeys[0]] === label && count++;
          });
          datasets[0].data.push(count);
        });

        return (
          <Pie
            key={`${key}`}
            options={{
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: key,
                },
              },
            }}
            data={{
              labels,
              datasets,
            }}
          />
        );
      },
    },
    {
      key: 'SMMEs that applied for BIS ',
      qKeys: ['SMMEQuestionThirtyOneOne'],
      mutatorFn: (responses: any[], qKeys: string[], key: string) => {
        const filtered = responses.filter((x) => x[qKeys[0]]);
        const set = new Set();
        filtered.forEach((res) => {
          const item = res[qKeys[0]];
          if (item) {
            set.add(item);
          }
        });
        const labels = Array.from(set);

        let datasets: any[] = [
          {
            data: [],
            backgroundColor: labels.map((_) => randomColor()),
          },
        ];
        labels.forEach((label, i) => {
          let count = 0;
          filtered.forEach((res) => {
            res[qKeys[0]] === label && count++;
          });
          datasets[0].data.push(count);
        });

        return (
          <Pie
            key={`${key}`}
            options={{
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: key,
                },
              },
            }}
            data={{
              labels,
              datasets,
            }}
          />
        );
      },
    },
    // {
    //   key: 'SMMEs that were successful in retrieving BIS Scheme ',
    //   qKeys: ['SMMEQuestionThirtyOneOneOne'],
    //   mutatorFn: (responses: any[], qKeys: string[], key: string) => {
    //     const filtered = responses.filter((x) => x[qKeys[0]]);
    //     const set = new Set();
    //     filtered.forEach((res) => {
    //       const item = res[qKeys[0]];
    //       if (item) {
    //         set.add(item);
    //       }
    //     });
    //     const labels = Array.from(set);

    //     let datasets: any[] = [
    //       {
    //         data: [],
    //         backgroundColor: labels.map((_) => randomColor()),
    //       },
    //     ];
    //     labels.forEach((label, i) => {
    //       let count = 0;
    //       filtered.forEach((res) => {
    //         res[qKeys[0]] === label && count++;
    //       });
    //       datasets[0].data.push(count);
    //     });

    //     return (
    //       <Pie
    //         key={`${key}`}
    //         options={{
    //           plugins: {
    //             title: {
    //               display: true,
    //               text: key,
    //             },
    //           },
    //         }}
    //         data={{
    //           labels,
    //           datasets,
    //         }}
    //       />
    //     );
    //   },
    // },
    {
      key: 'Assistance from organisations that SMMEs wish to access for their business post-mining ',
      qKeys: ['SMMEQuestionThirtyTwo'],
      mutatorFn: (responses: any[], qKeys: string[], key: string) => {
        const filtered = responses.filter((x) => x[qKeys[0]]);

        const set = new Set();
        filtered.forEach((res) => {
          const item = res[qKeys[0]];
          if (item) {
            set.add(item);
          }
        });
        const labels = Array.from(set);
        let datasets: any[] = [
          {
            data: [],
            backgroundColor: labels.map((_) => randomColor()),
          },
        ];
        labels.forEach((label) => {
          let count = 0;
          filtered.forEach((res) => {
            res[qKeys[0]] === label && count++;
          });
          datasets[0].data.push(count);
        });

        return (
          <Bar
            key={`${key}`}
            options={{
              plugins: {
                title: {
                  display: true,
                  text: key,
                },
                legend: {
                  display: false,
                },
              },
              responsive: true,
              scales: {
                x: {
                  stacked: true,
                },
                y: {
                  stacked: true,
                },
              },
            }}
            data={{
              labels,
              datasets,
            }}
          />
        );
      },
    },
    {
      key: 'Assets that exist within community',
      qKeys: ['SMMEQuestionNineteen'],
      mutatorFn: (responses: any[], qKeys: string[], key: string) => {
        const filtered = responses.filter(
          (x) => x['questionSeven'] === 'No' && x[qKeys[0]]
        );

        const set = new Set();
        filtered.forEach((res) => {
          const item = res[qKeys[0]];
          if (item) {
            set.add(item);
          }
        });
        const labels = Array.from(set);
        let datasets: any[] = [
          {
            data: [],
            backgroundColor: labels.map((_) => randomColor()),
          },
        ];
        labels.forEach((label) => {
          let count = 0;
          filtered.forEach((res) => {
            res[qKeys[0]] === label && count++;
          });
          datasets[0].data.push(count);
        });

        return (
          <Bar
            key={`${key}`}
            options={{
              plugins: {
                title: {
                  display: true,
                  text: key,
                },
                legend: {
                  display: false,
                },
              },
              responsive: true,
              scales: {
                x: {
                  stacked: true,
                },
                y: {
                  stacked: true,
                },
              },
            }}
            data={{
              labels,
              datasets,
            }}
          />
        );
      },
    },
    {
      key: 'SMMEs that use natural assets to provide services ',
      qKeys: ['SMMEQuestionNine'],
      mutatorFn: (responses: any[], qKeys: string[], key: string) => {
        const filtered = responses.filter((x) => x[qKeys[0]]);

        let yes = 0;
        let no = 0;
        filtered.forEach((res) => {
          res[qKeys[0]] === 'Yes' ? yes++ : no++;
        });
        return (
          <Pie
            key={`${key}`}
            options={{
              plugins: {
                title: {
                  display: true,
                  text: key,
                },
              },
            }}
            data={{
              labels: ['Yes', 'No'],
              datasets: [
                {
                  data: [yes, no],
                  backgroundColor: ['#FDB51B', '#DD382F'],
                },
              ],
            }}
          />
        );
      },
    },
    {
      key: 'Natural assets that assists SMME business operations ',
      qKeys: ['SMMEQuestionNineteenOne'],
      mutatorFn: (responses: any[], qKeys: string[], key: string) => {
        const filtered = responses.filter((x) => x[qKeys[0]]);

        const set = new Set();
        filtered.forEach((res) => {
          const item = res[qKeys[0]];
          if (item) {
            set.add(item);
          }
        });
        const labels = Array.from(set);

        let datasets: any[] = [
          {
            data: [],
            backgroundColor: labels.map((_) => randomColor()),
          },
        ];
        labels.forEach((label, i) => {
          let count = 0;
          filtered.forEach((res) => {
            // @ts-ignore
            res[qKeys[0]].includes(label) && count++;
          });
          datasets[0].data.push(count);
        });

        return (
          <Pie
            key={`${key}`}
            options={{
              plugins: {
                title: {
                  display: true,
                  text: key,
                },
              },
            }}
            data={{
              labels,
              datasets,
            }}
          />
        );
      },
    },
    {
      key: 'Initiatives, programs or business that assist with community needs',
      qKeys: ['SMMEQuestionThirtyThree'],
      mutatorFn: (responses: any[], qKeys: string[], key: string) => {
        const filtered = responses.filter((x) => x[qKeys[0]]);
        console.log('NEW FILTER::: ', filtered);

        let yes = 0;
        let no = 0;
        filtered.forEach((res) => {
          res[qKeys[0]] === 'Yes' ? yes++ : no++;
        });
        return (
          <Pie
            key={`${key}`}
            options={{
              plugins: {
                title: {
                  display: true,
                  text: key,
                },
              },
            }}
            data={{
              labels: ['Yes', 'No'],
              datasets: [
                {
                  data: [yes, no],
                  backgroundColor: ['#FDB51B', '#DD382F'],
                },
              ],
            }}
          />
        );
      },
    },
    {
      key: 'Assets that SMMEs have indicated exists within community  with potential for economic benefit',
      qKeys: ['SMMEQuestionThirtyFour'],
      mutatorFn: (responses: any[], qKeys: string[], key: string) => {
        const filtered = responses.filter((x) => x[qKeys[0]]);

        const set = new Set();
        filtered.forEach((res) => {
          const item = res[qKeys[0]];
          if (item) {
            set.add(item);
          }
        });
        const labels = Array.from(set);
        let datasets: any[] = [
          {
            data: [],
            backgroundColor: labels.map((_) => randomColor()),
          },
        ];
        labels.forEach((label) => {
          let count = 0;
          filtered.forEach((res) => {
            if (res && Array.isArray(res)) {
              // @ts-ignore
              res[qKeys[0]].includes(label) && count++;
            } else {
              res[qKeys[0]] === label && count++;
            }
          });
          datasets[0].data.push(count);
        });

        return (
          <Bar
            key={`${key}`}
            options={{
              plugins: {
                title: {
                  display: true,
                  text: key,
                },
                legend: {
                  display: false,
                },
              },
              responsive: true,
              scales: {
                x: {
                  stacked: true,
                },
                y: {
                  stacked: true,
                },
              },
            }}
            data={{
              labels,
              datasets,
            }}
          />
        );
      },
    },
  ],
};

export const SurveyReport = () => {
  const {
    params: { docId },
  } = useMatch<LocationGenerics>();
  const { data: link } = useGetSingleLink(docId);

  const visualization = useMemo(() => {
    // @ts-ignore
    const features = viz[link?.package.survey.key];
    if (!features) return '';

    return (
      <SimpleGrid cols={2}>
        {features?.map((vis: any) => (
          <div>
            {vis?.mutatorFn(link?.responses, vis.qKeys, vis.key, vis?.survey)}
          </div>
        ))}
      </SimpleGrid>
    );
  }, []);

  return (
    <>
      <Group position="apart" align="center" mb={'xl'}>
        <Link to="/reports">
          <UnstyledButton
            p="lg"
            sx={(theme) => ({
              borderRadius: theme.radius.md,
              '&:hover': {
                backgroundColor:
                  theme.colorScheme === 'dark'
                    ? theme.colors.dark[8]
                    : theme.colors.gray[1],
              },
            })}
          >
            <Group>
              <Avatar size={40} color="blue">
                <IconChevronLeft />
              </Avatar>
              <div>
                {/* @ts-ignore */}
                <Text weight={700}>{link?.package.name}</Text>
                <Text size="xs" color="dimmed">
                  Click here to go back
                </Text>
              </div>
            </Group>
          </UnstyledButton>
        </Link>
      </Group>
      {visualization}
    </>
  );
};
