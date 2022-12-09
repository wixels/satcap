import {
  Avatar,
  Box,
  Card,
  Group,
  SimpleGrid,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core';
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
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  LineElement,
  PointElement,
  RadialLinearScale,
} from 'chart.js';
import { Bar, Pie, Radar } from 'react-chartjs-2';
import { randomColor, transparentize } from '../../utils/randomColor';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  ChartTitle,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

const viz = {
  'wp-two-one': [
    {
      key: 'Types of skills training received in the community',
      qKeys: ['questionSeven-One'],
      mutatorFn: (responses: any[], qKeys: string[], key: string) => {
        const filtered = responses.filter((x) => x[qKeys[0]]);

        console.log('FILTERED::: ', filtered);
        console.log('RESPONSES::: ', responses);
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
            if (res && Array.isArray(res[qKeys[0]])) {
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
            style={{
              maxHeight: '40vh',
            }}
            key={`${key}`}
            options={{
              plugins: {
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
      key: 'Business-related training that SMMEs participated in',
      qKeys: ['questionSeventeen-Five'],
      mutatorFn: (responses: any[], qKeys: string[], key: string) => {
        const filtered = responses.filter((x) => x[qKeys[0]]);

        let yes = 0;
        let no = 0;
        filtered.forEach((res) => {
          res[qKeys[0]] === 'Yes' ? yes++ : no++;
        });
        return (
          <Pie
            style={{
              maxHeight: '40vh',
            }}
            key={`${key}`}
            options={{
              plugins: {},
              responsive: true,
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
      key: 'Types of training SMMEs received',
      qKeys: ['questionSeventeen-Five-Two'],
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
            if (res && Array.isArray(res[qKeys[0]])) {
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
            style={{
              maxHeight: '40vh',
            }}
            key={`${key}`}
            options={{
              plugins: {
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
      key: 'Industries that communities are interested in',
      qKeys: ['questionFifteen'],
      mutatorFn: (responses: any[], qKeys: string[], key: string) => {
        const filtered = responses.filter((x) => x[qKeys[0]]);

        const set = new Set();
        filtered.forEach((res) => {
          const item = res[qKeys[0]];

          if (Array.isArray(item)) {
            item?.forEach((key: string) => {
              if (key) {
                set.add(key);
              }
            });
          } else {
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
            if (res && Array.isArray(res[qKeys[0]])) {
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
            style={{
              maxHeight: '40vh',
            }}
            key={`${key}`}
            options={{
              responsive: true,
              plugins: {},
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
        const qTitles = [
          'Are you aware of health and safety requirements you need to comply with as an employer?',
          'Do you understand the tender requirements?',
          ' Do you have a bank account for your business?',
          'Do you have a VAT registration number?',
          'Do you have a company tax number?',
          'Is your company registered with the Workmans Compensation Fund?',
          'Do you have a company registration number?',
          'Is your company registered with the Companies and Intellectual Properties Commission (CIPC)?',
        ];
        // resCopy.
        const filteredBySurvey = responses?.filter((x) => x?.survey === survey);
        const labels: any[] = qKeys;
        let datasets: any[] = [
          {
            label: 'Yes %',
            data: [],
            backgroundColor: '#FDB51B',
          },
          {
            label: 'No %',
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
          const noPercent = Math.floor((no / filteredBySurvey.length) * 100);
          const yesPercent = 100 - noPercent;

          datasets[0].data.push(yesPercent);
          datasets[1].data.push(noPercent);
        });

        return (
          <Bar
            style={{
              maxHeight: '40vh',
            }}
            key={`${key}-${survey}`}
            options={{
              indexAxis: 'y',
              plugins: {},
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
              labels: qTitles,
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

        const qTitles = [
          'Are you actively monitoring the status of your application?',
          'Do you know where to check the status of your application?',
          'Have you taken our pre-application readiness checklist?',
        ];

        let datasets: any[] = [
          {
            label: 'Yes %',
            data: [],
            backgroundColor: '#FDB51B',
          },
          {
            label: 'No %',
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
          const noPercent = Math.floor((no / filteredBySurvey.length) * 100);
          const yesPercent = 100 - noPercent;

          datasets[0].data.push(yesPercent);
          datasets[1].data.push(noPercent);
        });

        return (
          <Bar
            style={{
              maxHeight: '40vh',
            }}
            key={`${key}-${survey}`}
            options={{
              indexAxis: 'y',
              plugins: {},
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
              labels: qTitles,
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

        const qTitles = [
          'Was it easy to upload your documents on the vendor/procurement portal?',
          'Were the instructions on the vendor/procurement portal easy to follow?',
          'Did you know how to navigate the vendor portal in order to submit your application?',
        ];

        let datasets: any[] = [
          {
            label: 'Yes %',
            data: [],
            backgroundColor: '#FDB51B',
          },
          {
            label: 'No %',
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
          const noPercent = Math.floor((no / filteredBySurvey.length) * 100);
          const yesPercent = 100 - noPercent;

          datasets[0].data.push(yesPercent);
          datasets[1].data.push(noPercent);
        });

        return (
          <Bar
            style={{
              maxHeight: '40vh',
            }}
            key={`${key}-${survey}`}
            options={{
              indexAxis: 'y',
              plugins: {},
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
              labels: qTitles,
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

        console.log(filteredBySurvey);

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
            style={{
              maxHeight: '40vh',
            }}
            key={`${key}-${survey}`}
            options={{
              plugins: {
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
            style={{
              maxHeight: '40vh',
            }}
            key={`${key}-${survey}`}
            options={{
              responsive: true,
              plugins: {},
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
            if (res && Array.isArray(res[qKeys[0]])) {
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
            style={{
              maxHeight: '40vh',
            }}
            key={`${key}`}
            options={{
              plugins: {
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
            if (res && Array.isArray(res[qKeys[0]])) {
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
            style={{
              maxHeight: '40vh',
            }}
            key={`${key}`}
            options={{
              responsive: true,
              plugins: {},
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
            style={{
              maxHeight: '40vh',
            }}
            key={`${key}`}
            options={{
              responsive: true,
              plugins: {},
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
      qKeys: ['SMMEQuestionThirteen-One'],
      mutatorFn: (responses: any[], qKeys: string[], key: string) => {
        const filtered = responses.filter((x) => x[qKeys[0]]);

        let yes = 0;
        let no = 0;

        filtered.forEach((res) => {
          res[qKeys[0]] === 'Yes' ? yes++ : no++;
        });
        return (
          <Pie
            style={{
              maxHeight: '40vh',
            }}
            key={`${key}`}
            options={{
              responsive: true,
              plugins: {},
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
      qKeys: ['SMMEQuestionThirteen-One-One'],
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
            style={{
              maxHeight: '40vh',
            }}
            key={`${key}`}
            options={{
              plugins: {
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
            style={{
              maxHeight: '40vh',
            }}
            key={`${key}`}
            options={{
              responsive: true,
              plugins: {},
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
      qKeys: ['SMMEQuestionThirtyOne-One'],
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
            style={{
              maxHeight: '40vh',
            }}
            key={`${key}`}
            options={{
              responsive: true,
              plugins: {},
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
            style={{
              maxHeight: '40vh',
            }}
            key={`${key}`}
            options={{
              plugins: {
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
            style={{
              maxHeight: '40vh',
            }}
            key={`${key}`}
            options={{
              plugins: {
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
            style={{
              maxHeight: '40vh',
            }}
            key={`${key}`}
            options={{
              plugins: {},
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
      qKeys: ['SMMEQuestionNineteen-One'],
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
            style={{
              maxHeight: '40vh',
            }}
            key={`${key}`}
            options={{
              plugins: {},
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
            style={{
              maxHeight: '40vh',
            }}
            key={`${key}`}
            options={{
              plugins: {},
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
            if (res && Array.isArray(res[qKeys[0]])) {
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
            style={{
              maxHeight: '40vh',
            }}
            key={`${key}`}
            options={{
              plugins: {
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
  'wp-two-two': [
    {
      key: 'Operator Benchmark Comparison',
      qKeys: {
        literacy: [
          'questionSix',
          'questionSeven',
          'questionEight',
          'questionNine',
          'questionTen',
          'questionEleven',
        ],
        fluency: [
          'questionTwelve',
          'questionThirteen',
          'questionFourteen',
          'questionFifteen',
          'questionSixteen',
          'questionSeventeen',
          'questionEighteen',
          'questionNineeen',
          'questionTwenty',
          'questionTwentyOne',
          'questionTwentyTwo',
          'questionTwentyThree',
        ],
        proficiency: [
          'questionTwentyFour',
          'questionTwentyFive',
          'questionTwentySix',
          'questionTwentySeven',
          'questionTwentyEight',
          'questionTwentyNine',
          'questionThirty',
        ],
      },
      survey: 'Operator',
      mutatorFn: (
        responses: any[],
        qKeys: { literacy: string[]; fluency: string[]; proficiency: string[] },
        key: string,
        survey: string
      ) => {
        const filtered = responses.filter((x) => x.questionTwo === survey);

        let litScore = 0;
        let fluScore = 0;
        let profScore = 0;

        filtered.forEach((item) => {
          qKeys.literacy.forEach((key: string) => {
            if (item[key]) litScore += Number(item[key].split('-')[0]);
          });
          qKeys.fluency.forEach((key: string) => {
            if (item[key]) fluScore += Number(item[key].split('-')[0]);
          });
          qKeys.proficiency.forEach((key: string) => {
            if (item[key]) profScore += Number(item[key].split('-')[0]);
          });
        });
        const color = randomColor();
        return (
          <Radar
            style={{
              maxHeight: '40vh',
            }}
            data={{
              labels: [
                'Digital Literacy',
                'Digital Fluency',
                'Digital Proficiency',
              ],
              datasets: [
                {
                  label: key,
                  data: [litScore, fluScore, profScore],
                  borderColor: color,
                  backgroundColor: transparentize(color, 0.5),
                },
              ],
            }}
          />
        );
      },
    },
    {
      key: 'Supervisor Benchmark Comparison',
      qKeys: {
        literacy: [
          'questionSix',
          'questionSeven',
          'questionEight',
          'questionNine',
          'questionTen',
          'questionEleven',
        ],
        fluency: [
          'questionTwelve',
          'questionThirteen',
          'questionFourteen',
          'questionFifteen',
          'questionSixteen',
          'questionSeventeen',
          'questionEighteen',
          'questionNineeen',
          'questionTwenty',
          'questionTwentyOne',
          'questionTwentyTwo',
          'questionTwentyThree',
        ],
        proficiency: [
          'questionTwentyFour',
          'questionTwentyFive',
          'questionTwentySix',
          'questionTwentySeven',
          'questionTwentyEight',
          'questionTwentyNine',
          'questionThirty',
        ],
        confidence: [
          'questionThirtyOne',
          'questionThirtyTwo',
          'questionThirtyThree',
          'questionThirtyFour',
          'questionThirtyFive',
          'questionThirtySix',
          'questionThirtySeven',
          'questionThirtyEight',
          'questionThirtyNine',
        ],
      },
      survey: 'Supervisor',
      mutatorFn: (
        responses: any[],
        qKeys: {
          literacy: string[];
          fluency: string[];
          proficiency: string[];
          confidence: string[];
        },
        key: string,
        survey: string
      ) => {
        const filtered = responses.filter((x) => x.questionTwo === survey);

        let litScore = 0;
        let fluScore = 0;
        let profScore = 0;
        let confScore = 0;

        filtered.forEach((item) => {
          qKeys.literacy.forEach((key: string) => {
            if (item[key]) litScore += Number(item[key].split('-')[0]);
          });
          qKeys.fluency.forEach((key: string) => {
            if (item[key]) fluScore += Number(item[key].split('-')[0]);
          });
          qKeys.proficiency.forEach((key: string) => {
            if (item[key]) profScore += Number(item[key].split('-')[0]);
          });
          qKeys.confidence.forEach((key: string) => {
            if (item[key]) confScore += Number(item[key].split('-')[0]);
          });
        });
        const color = randomColor();
        return (
          <Radar
            style={{
              maxHeight: '40vh',
            }}
            data={{
              labels: [
                'Digital Literacy',
                'Digital Fluency',
                'Digital Proficiency',
                'Digital Confidence',
              ],
              datasets: [
                {
                  label: key,
                  data: [litScore, fluScore, profScore, confScore],
                  borderColor: color,
                  backgroundColor: transparentize(color, 0.2),
                },
              ],
            }}
          />
        );
      },
    },
    {
      key: 'Manager Benchmark Comparison',
      qKeys: {
        literacy: [
          'questionSix',
          'questionSeven',
          'questionEight',
          'questionNine',
          'questionTen',
          'questionEleven',
        ],
        fluency: [
          'questionTwelve',
          'questionThirteen',
          'questionFourteen',
          'questionFifteen',
          'questionSixteen',
          'questionSeventeen',
          'questionEighteen',
          'questionNineeen',
          'questionTwenty',
          'questionTwentyOne',
          'questionTwentyTwo',
          'questionTwentyThree',
        ],
        proficiency: [
          'questionTwentyFour',
          'questionTwentyFive',
          'questionTwentySix',
          'questionTwentySeven',
          'questionTwentyEight',
          'questionTwentyNine',
          'questionThirty',
        ],
        confidence: [
          'questionThirtyOne',
          'questionThirtyTwo',
          'questionThirtyThree',
          'questionThirtyFour',
          'questionThirtyFive',
          'questionThirtySix',
          'questionThirtySeven',
          'questionThirtyEight',
          'questionThirtyNine',
        ],
        leadership: [
          'questionFourty',
          'questionFourtyOne',
          'questionFourtyTwo',
          'questionFourtyThree',
          'questionFourtyFour',
          'questionFourtyFive',
          'questionFourtySix',
          'questionFourtySeven',
          'questionFourtyEight',
          'questionFourtyNine',
          'questionFifty',
          'questionFiftyOne',
          'questionFiftyTwo',
          'questionFiftyThree',
          'questionFiftyFour',
          'questionFiftyFive',
          'questionFiftySix',
          'questionFiftySeven',
          'questionFiftyEight',
          'questionFiftyNine',
        ],
      },
      survey: 'Manager',
      mutatorFn: (
        responses: any[],
        qKeys: {
          literacy: string[];
          fluency: string[];
          proficiency: string[];
          confidence: string[];
          leadership: string[];
        },
        key: string,
        survey: string
      ) => {
        const filtered = responses.filter((x) => x.questionTwo === survey);

        console.log('FILTERED::: ', filtered);

        let litScore = 0;
        let fluScore = 0;
        let profScore = 0;
        let confScore = 0;
        let leadScore = 0;

        filtered.forEach((item) => {
          qKeys.literacy.forEach((key: string) => {
            if (item[key]) litScore += Number(item[key].split('-')[0]);
          });
          qKeys.fluency.forEach((key: string) => {
            if (item[key]) fluScore += Number(item[key].split('-')[0]);
          });
          qKeys.proficiency.forEach((key: string) => {
            if (item[key]) profScore += Number(item[key].split('-')[0]);
          });
          qKeys.confidence.forEach((key: string) => {
            if (item[key]) confScore += Number(item[key].split('-')[0]);
          });
          qKeys.leadership.forEach((key: string) => {
            if (item[key]) leadScore += Number(item[key].split('-')[0]);
          });
        });
        const color = randomColor();
        return (
          <Radar
            style={{
              maxHeight: '40vh',
            }}
            data={{
              labels: [
                'Digital Literacy',
                'Digital Fluency',
                'Digital Proficiency',
                'Digital Confidence',
                'Digital Leadership',
              ],
              datasets: [
                {
                  label: key,
                  data: [litScore, fluScore, profScore, confScore, leadScore],
                  borderColor: color,
                  backgroundColor: transparentize(color, 0.2),
                },
              ],
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
      <SimpleGrid cols={2} spacing="xl">
        {features?.map((vis: any) => {
          return (
            <Card p="xl" mb={'xl'}>
              <Title mb="md" order={5}>
                {vis?.key}
              </Title>
              {vis?.mutatorFn(link?.responses, vis.qKeys, vis.key, vis?.survey)}
            </Card>
          );
        })}
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
      <Text mb="lg" color="dimmed">
        Responses: {link?.responses?.length ?? 0}
      </Text>
      {visualization}
    </>
  );
};
