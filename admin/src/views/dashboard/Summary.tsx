import {
  Avatar,
  Card,
  Divider,
  Group,
  Stack,
  Table,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core';
import { IconChevronsLeft } from '@tabler/icons';
import { Link, useMatch } from '@tanstack/react-location';
import { useMemo } from 'react';
import { useGetResponses } from '../../hooks/network/useResponses';
import { LocationGenerics } from '../../router';

const tableData = {
  'wp-two-one': [
    {
      title: 'Current Community and SMME Skills and Training',
      description:
        'Green – 66% or more responders picked the following skill Yellow – Between 33% and 65% responders picked the following skill Red – Less than 33% picked the following skill',
      levels: {
        above: 66,
        below: 33,
      },
      qKeys: ['questionSeven-One'],
      mutatorFn: (
        responses: any[],
        qKeys: string[],
        levels: { above: number; below: number }
      ) => {
        const filtered = responses.filter((x) => x[qKeys[0]]);

        const set = new Set();
        filtered.forEach((res) => {
          const items: string[] | string = res[qKeys[0]];
          if (Array.isArray(items)) items.forEach((item) => set.add(item));
          else set.add(items);
        });
        const rows = Array.from(set).map((item) => {
          return {
            skill: item,
            percent: Math.round(
              (filtered.filter((x) => x?.[qKeys[0]].includes(item)).length /
                filtered.length) *
                100
            ),
          };
        });

        return (
          <Table>
            <thead>
              <tr>
                <th>Skills & Training</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(
                // @ts-ignore
                ({ percent, skill }: { percent: number; skill: number }) => (
                  <tr key={skill}>
                    <td>{skill}</td>
                    <td
                      style={{
                        backgroundColor:
                          percent >= levels.above
                            ? 'green'
                            : percent <= levels.below
                            ? 'red'
                            : 'yellow',
                      }}
                    >
                      {percent}%
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </Table>
        );
      },
    },
    {
      title: 'Alternative Economy Industries',
      description:
        'Green – 66% or more responders picked the following skill Yellow – Between 33% and 65% responders picked the following skill Red – Less than 33% picked the following skill',
      levels: {
        above: 66,
        below: 33,
      },
      qKeys: ['questionFifteen'],
      mutatorFn: (
        responses: any[],
        qKeys: string[],
        levels: { above: number; below: number }
      ) => {
        const filtered = responses.filter((x) => x[qKeys[0]]);

        const set = new Set();
        filtered.forEach((res) => {
          const items: string[] | string = res[qKeys[0]];
          if (Array.isArray(items)) items.forEach((item) => set.add(item));
          else set.add(items);
        });
        const rows = Array.from(set).map((item) => {
          return {
            skill: item,
            percent: Math.round(
              (filtered.filter((x) => x?.[qKeys[0]].includes(item)).length /
                filtered.length) *
                100
            ),
          };
        });

        return (
          <Table mt={'xl'}>
            <thead>
              <tr>
                <th>Alternative Economy Industry</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(
                // @ts-ignore
                ({ percent, skill }: { percent: number; skill: number }) => (
                  <tr key={skill}>
                    <td>{skill}</td>
                    <td
                      style={{
                        backgroundColor:
                          percent >= levels.above
                            ? 'green'
                            : percent <= levels.below
                            ? 'red'
                            : 'yellow',
                      }}
                    >
                      {percent}%
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </Table>
        );
      },
    },
  ],
  'wp-three-one': [
    {
      title: 'Pre-application',
      description:
        'Green – 75% or more responders answered yes. Yellow – 50% or more responders answered yes. Red – Less than 50% of responders answered yes',
      levels: {
        above: 75,
        below: 50,
      },
      survey: 'wp-three-one-pre',
      qKeys: [
        'questionSix',
        'questionSeven',
        'questionNine',
        'questionTwentyTwo',
        'questionThirteen',
        'questionFourteen',
        'questionFifteen',
        'questionTwenty',
      ],
      mutatorFn: (
        responses: any[],
        qKeys: string[],
        levels: { above: number; below: number },
        survey: string
      ) => {
        const filtered = responses.filter((x) => x?.survey === survey);

        const questionStrings = {
          questionSix: 'Registration with the CIPC',
          questionSeven: 'Company registration number',
          questionNine: "Workman's compensation",
          questionTwentyTwo: 'Health and safety',
          questionThirteen: 'Company tax number',
          questionFourteen: 'VAT number',
          questionFifteen: 'Bank account',
          questionTwenty: 'Understanding of tender requirements',
        };

        const rows = qKeys.map((item, i) => {
          return {
            items: questionStrings?.[item as keyof typeof questionStrings],
            status: Math.round(
              (filtered.filter((x) => x?.[qKeys[i]]?.toLowerCase() === 'yes')
                .length /
                filtered.length) *
                100
            ),
          };
        });

        return (
          <Table>
            <thead>
              <tr>
                <th>Items</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(
                // @ts-ignore
                ({ status, items }: { status: number; items: number }) => (
                  <tr key={items}>
                    <td>{items}</td>
                    <td
                      style={{
                        backgroundColor:
                          status >= levels.above
                            ? 'green'
                            : status <= levels.below
                            ? 'red'
                            : 'yellow',
                      }}
                    >
                      {status}%
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </Table>
        );
      },
    },
    {
      title: 'Post-application',
      description:
        'Green – 75% or more responders answered yes. Yellow – 50% or more responders answered yes. Red – Less than 50% of responders answered yes',
      levels: {
        above: 75,
        below: 50,
      },
      survey: 'wp-three-one-post',
      qKeys: ['questionSeven', 'questionSix'],
      mutatorFn: (
        responses: any[],
        qKeys: string[],
        levels: { above: number; below: number },
        survey: string
      ) => {
        const filtered = responses.filter((x) => x?.survey === survey);

        const questionStrings = {
          questionSeven: 'Monitoring of application status',
          questionSix: 'Knowledge of where to check application status',
        };

        const rows = qKeys.map((item, i) => {
          return {
            items: questionStrings?.[item as keyof typeof questionStrings],
            status: Math.round(
              (filtered.filter((x) => x?.[qKeys[i]]?.toLowerCase() === 'yes')
                .length /
                filtered.length) *
                100
            ),
          };
        });

        return (
          <Table>
            <thead>
              <tr>
                <th>Items</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(
                // @ts-ignore
                ({ status, items }: { status: number; items: number }) => (
                  <tr key={items}>
                    <td>{items}</td>
                    <td
                      style={{
                        backgroundColor:
                          status >= levels.above
                            ? 'green'
                            : status <= levels.below
                            ? 'red'
                            : 'yellow',
                      }}
                    >
                      {status}%
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </Table>
        );
      },
    },
    {
      title: 'Post-response',
      description:
        'Green – 75% or more responders answered yes. Yellow – 50% or more responders answered yes. Red – Less than 50% of responders answered yes',
      levels: {
        above: 75,
        below: 50,
      },
      survey: 'wp-three-one-post-response',
      qKeys: ['questionThree', 'questionTwo', 'questionOne'],
      mutatorFn: (
        responses: any[],
        qKeys: string[],
        levels: { above: number; below: number },
        survey: string
      ) => {
        const filtered = responses.filter((x) => x?.survey === survey);

        const questionStrings = {
          questionThree: 'Ease of uploading documents',
          questionTwo: 'Ease of understanding vendor portal',
          questionOne: 'Knowledge of navigating a vendor portal',
        };

        const rows = qKeys.map((item, i) => {
          return {
            items: questionStrings?.[item as keyof typeof questionStrings],
            status: Math.round(
              (filtered.filter((x) => x?.[qKeys[i]]?.toLowerCase() === 'yes')
                .length /
                filtered.length) *
                100
            ),
          };
        });

        return (
          <Table>
            <thead>
              <tr>
                <th>Items</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(
                // @ts-ignore
                ({ status, items }: { status: number; items: number }) => (
                  <tr key={items}>
                    <td>{items}</td>
                    <td
                      style={{
                        backgroundColor:
                          status >= levels.above
                            ? 'green'
                            : status <= levels.below
                            ? 'red'
                            : 'yellow',
                      }}
                    >
                      {status}%
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </Table>
        );
      },
    },
  ],
  'wp-three-two': [
    {
      title: 'Current Community and SMME Social Needs',
      description:
        'Red – 66% or more responders selected the following social need/answered yes. Yellow – Between 33% and 66% responders selected the following social need/answered yes. Green – Less than 33% selected the following need/answered yes',
      levels: {
        above: 66,
        below: 33,
      },
      qKeys: {
        community: [
          'communityQuestionTen',
          'communityQuestionEleven',
          'communityQuestionFourteen-1',
          'communityQuestionFourteen-2',
          'communityQuestionFourteen-3',
          'communityQuestionFourteen-4',
          'communityQuestionFourteen-5',
          'communityQuestionTwelve',
          'communityQuestionFifteen',
          'communityQuestionSixteen',
          'communityQuestionSeventeen',
          'communityQuestionEighteen',
          'communityQuestionTwentyOne',
        ],
        smme: [
          'SMMEQuestionThirteen',
          'SMMEQuestionEighteen',
          'SMMEQuestionTwentyTwo',
          'SMMEQuestionTwentyThree',
          'SMMEQuestionTwentyFour',
          'SMMEQuestionTwentyFive',
          'SMMEQuestionTwentySix',
          'SMMEQuestionTwentySeven',
        ],
      },
      mutatorFn: (
        responses: any[],
        qKeys: { community: string[]; smme: string[] },
        levels: { above: number; below: number }
      ) => {
        const community = responses.filter(
          (x) => x?.['questionSeven']?.toLowerCase() === 'no'
        );
        const smme = responses.filter(
          (x) => x?.['questionSeven']?.toLowerCase() === 'yes'
        );

        const questionStrings = {
          communityQuestionTen: 'Education',
          communityQuestionEleven: 'Environmental needs',
          'communityQuestionFourteen-1': 'Livelihood needs',
          'communityQuestionFourteen-2': 'Skills improvement',
          'communityQuestionFourteen-3': 'Access to jobs',
          'communityQuestionFourteen-4': 'Finances to start a business',
          'communityQuestionFourteen-5': 'Transportation around the community',
          communityQuestionTwelve: 'Security',
          communityQuestionFifteen: 'Water',
          communityQuestionSixteen: 'Food',
          communityQuestionSeventeen: 'Shelter/Housing',
          communityQuestionEighteen: 'Health Care',
          communityQuestionTwentyOne: 'Recreational Centres',
          SMMEQuestionThirteen: 'Finance/Funding ',
          SMMEQuestionEighteen: 'Skills ',
          SMMEQuestionTwentyTwo: 'Collaborations and partnerships ',
          SMMEQuestionTwentyThree: 'Learning and Development ',
          SMMEQuestionTwentyFour: 'Infrastructure ',
          SMMEQuestionTwentyFive: 'Connectivity ',
          SMMEQuestionTwentySix: 'Utilities ',
          SMMEQuestionTwentySeven: 'Security ',
        };

        type row = {
          items: string;
          status: number;
        };
        let communityRows: row[] = [];
        let smmeRows: row[] = [];
        qKeys.community.map((item, i) => {
          switch (item) {
            case 'communityQuestionFourteen-1':
            case 'communityQuestionFourteen-2':
            case 'communityQuestionFourteen-3':
            case 'communityQuestionFourteen-4':
            case 'communityQuestionFourteen-5': {
              communityRows.push({
                items: questionStrings?.[item as keyof typeof questionStrings],
                status: Math.round(
                  (community.filter((x) => {
                    return x?.['communityQuestionFourteen']?.includes(
                      questionStrings?.[item]
                    );
                  }).length /
                    community.length) *
                    100
                ),
              });
              break;
            }

            case 'communityQuestionSeventeen':
            case 'communityQuestionEighteen':
            case 'communityQuestionEleven':
            case 'communityQuestionTwelve':
              communityRows.push({
                items: questionStrings?.[item as keyof typeof questionStrings],
                status: Math.round(
                  (community.filter(
                    (x) =>
                      x?.[item] === 'Adequate' ||
                      x?.[item] === 'Good' ||
                      x?.[item] === 'Excellent'
                  ).length /
                    community.length) *
                    100
                ),
              });
              break;

            default:
              communityRows.push({
                items: questionStrings?.[item as keyof typeof questionStrings],
                status: Math.round(
                  (community.filter((x) => x?.[qKeys.community[i]] === 'Yes')
                    .length /
                    community.length) *
                    100
                ),
              });
              break;
          }
        });

        qKeys.smme.map((item, i) => {
          switch (item) {
            case 'SMMEQuestionTwentyThree':
            case 'SMMEQuestionEighteen': {
              const set = new Set();
              smme.forEach((res) => {
                const items: string[] | string = res[item];
                if (Array.isArray(items)) {
                  items.forEach((item) => item && set.add(item));
                } else if (item) {
                  set.add(items);
                }
              });
              Array.from(set).forEach((opt: any) => {
                if (opt) {
                  smmeRows.push({
                    items: opt,
                    status: Math.round(
                      (smme.filter((x) => x?.[item]?.includes(opt)).length /
                        smme.length) *
                        100
                    ),
                  });
                }
              });
              break;
            }

            default:
              smmeRows.push({
                items: questionStrings?.[item as keyof typeof questionStrings],
                status: Math.round(
                  (smme.filter((x) => x?.[qKeys.smme[i]] === 'Yes').length /
                    smme.length) *
                    100
                ),
              });
              break;
          }
        });

        return (
          <Table>
            <thead>
              <tr>
                <th>Social Needs</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={2}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(234, 239, 255, 1)',
                    fontWeight: 'bolder',
                  }}
                  align="center"
                >
                  Community
                </td>
              </tr>
              {communityRows.map(
                // @ts-ignore
                ({ status, items }: { status: number; items: number }) => (
                  <tr key={items}>
                    <td>{items}</td>
                    <td
                      style={{
                        backgroundColor:
                          status >= levels.above
                            ? 'green'
                            : status <= levels.below
                            ? 'red'
                            : 'yellow',
                      }}
                    >
                      {status}%
                    </td>
                  </tr>
                )
              )}
              <tr>
                <td
                  colSpan={2}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(234, 239, 255, 1)',
                    fontWeight: 'bolder',
                  }}
                  align="center"
                >
                  SMMEs
                </td>
              </tr>
              {smmeRows.map(
                // @ts-ignore
                ({ status, items }: { status: number; items: number }) => (
                  <tr key={items}>
                    <td>{items}</td>
                    <td
                      style={{
                        backgroundColor:
                          status >= levels.above
                            ? 'green'
                            : status <= levels.below
                            ? 'red'
                            : 'yellow',
                      }}
                    >
                      {status}%
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </Table>
        );
      },
    },
    {
      title: 'Perceived future community and SMME social needs',
      description:
        'Red – 66% or more responders selected the following social need/answered yes. Yellow – Between 33% and 66% responders selected the following social need/answered yes. Green – Less than 33% selected the following need/answered yes',
      levels: {
        above: 66,
        below: 33,
      },
      qKeys: {
        community: [
          'communityQuestionTwentyFour',
          'communityQuestionTwentySix',
        ],
        smme: ['SMMEQuestionThirtyTwo'],
      },
      mutatorFn: (
        responses: any[],
        qKeys: { community: string[]; smme: string[] },
        levels: { above: number; below: number }
      ) => {
        const community = responses.filter(
          (x) => x?.['questionSeven']?.toLowerCase() === 'no'
        );
        const smme = responses.filter(
          (x) => x?.['questionSeven']?.toLowerCase() === 'yes'
        );

        type row = {
          items: string;
          status: number;
        };

        const communityRows: row[] = [];
        qKeys?.community?.map((item) => {
          const set = new Set();
          community.forEach((res) => {
            const items: string[] | string = res[item];
            if (Array.isArray(items)) {
              items.forEach((item) => item && set.add(item));
            } else if (item) {
              set.add(items);
            }
          });
          Array.from(set)
            .filter((x) => x)
            .forEach((opt: any) => {
              communityRows.push({
                items: opt,
                status: Math.round(
                  (community.filter((x) => x?.[item]?.includes(opt)).length /
                    community.length) *
                    100
                ),
              });
            });
        });
        const smmeRows: row[] = [];
        qKeys?.smme?.map((item) => {
          const set = new Set();
          smme.forEach((res) => {
            const items: string[] | string = res[item];
            if (Array.isArray(items)) {
              items.forEach((item) => item && set.add(item));
            } else if (item) {
              set.add(items);
            }
          });
          Array.from(set)
            .filter((x) => x)
            .forEach((opt: any) => {
              smmeRows.push({
                items: opt,
                status: Math.round(
                  (smme.filter((x) => x?.[item]?.includes(opt)).length /
                    smme.length) *
                    100
                ),
              });
            });
        });

        console.log('smmeRows::: ', smmeRows);

        return (
          <Table>
            <thead>
              <tr>
                <th>Social Needs</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={2}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(234, 239, 255, 1)',
                    fontWeight: 'bolder',
                  }}
                  align="center"
                >
                  Community
                </td>
              </tr>
              {communityRows.map(
                // @ts-ignore
                ({ status, items }: { status: number; items: number }) => (
                  <tr key={items}>
                    <td>{items}</td>
                    <td
                      style={{
                        backgroundColor:
                          status >= levels.above
                            ? 'green'
                            : status <= levels.below
                            ? 'red'
                            : 'yellow',
                      }}
                    >
                      {status}%
                    </td>
                  </tr>
                )
              )}
              <tr>
                <td
                  colSpan={2}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(234, 239, 255, 1)',
                    fontWeight: 'bolder',
                  }}
                  align="center"
                >
                  SMMEs
                </td>
              </tr>
              {smmeRows.map(
                // @ts-ignore
                ({ status, items }: { status: number; items: number }) => (
                  <tr key={items}>
                    <td>{items}</td>
                    <td
                      style={{
                        backgroundColor:
                          status >= levels.above
                            ? 'green'
                            : status <= levels.below
                            ? 'red'
                            : 'yellow',
                      }}
                    >
                      {status}%
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </Table>
        );
      },
    },
    {
      title: 'Active/current asset bases in the community',
      description:
        'Red – 66% or more responders selected the following social need/answered yes. Yellow – Between 33% and 66% responders selected the following social need/answered yes. Green – Less than 33% selected the following need/answered yes',
      levels: {
        above: 66,
        below: 33,
      },
      qKeys: {
        community: ['communityQuestionNineteen'],
        smme: ['SMMEQuestionNineteen-One'],
      },
      mutatorFn: (
        responses: any[],
        qKeys: { community: string[]; smme: string[] },
        levels: { above: number; below: number }
      ) => {
        const community = responses.filter(
          (x) => x?.['questionSeven']?.toLowerCase() === 'no'
        );
        const smme = responses.filter(
          (x) => x?.['questionSeven']?.toLowerCase() === 'yes'
        );

        console.log('smme::: ', smme);
        type row = {
          items: string;
          status: number;
        };

        const communityRows: row[] = [];
        qKeys?.community?.map((item) => {
          const set = new Set();
          community.forEach((res) => {
            const items: string[] | string = res[item];
            if (Array.isArray(items)) {
              items.forEach((item) => item && set.add(item));
            } else if (item) {
              set.add(items);
            }
          });
          Array.from(set)
            .filter((x) => x)
            .forEach((opt: any) => {
              communityRows.push({
                items: opt,
                status: Math.round(
                  (community.filter((x) => x?.[item]?.includes(opt)).length /
                    community.length) *
                    100
                ),
              });
            });
        });
        const smmeRows: row[] = [];
        qKeys?.smme?.map((item) => {
          const set = new Set();
          smme.forEach((res) => {
            const items: string[] | string = res[item];
            if (Array.isArray(items)) {
              items.forEach((item) => item && set.add(item));
            } else if (item) {
              set.add(items);
            }
          });
          Array.from(set)
            .filter((x) => x)
            .forEach((opt: any) => {
              smmeRows.push({
                items: opt,
                status: Math.round(
                  (smme.filter((x) => x?.[item]?.includes(opt)).length /
                    smme.length) *
                    100
                ),
              });
            });
        });

        console.log('smmeRows::: ', smmeRows);

        return (
          <Table>
            <thead>
              <tr>
                <th>Social Needs</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={2}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(234, 239, 255, 1)',
                    fontWeight: 'bolder',
                  }}
                  align="center"
                >
                  Community
                </td>
              </tr>
              {communityRows.map(
                // @ts-ignore
                ({ status, items }: { status: number; items: number }) => (
                  <tr key={items}>
                    <td>{items}</td>
                    <td
                      style={{
                        backgroundColor:
                          status >= levels.above
                            ? 'green'
                            : status <= levels.below
                            ? 'red'
                            : 'yellow',
                      }}
                    >
                      {status}%
                    </td>
                  </tr>
                )
              )}
              <tr>
                <td
                  colSpan={2}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(234, 239, 255, 1)',
                    fontWeight: 'bolder',
                  }}
                  align="center"
                >
                  SMMEs
                </td>
              </tr>
              {smmeRows.map(
                // @ts-ignore
                ({ status, items }: { status: number; items: number }) => (
                  <tr key={items}>
                    <td>{items}</td>
                    <td
                      style={{
                        backgroundColor:
                          status >= levels.above
                            ? 'green'
                            : status <= levels.below
                            ? 'red'
                            : 'yellow',
                      }}
                    >
                      {status}%
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </Table>
        );
      },
    },
  ],
  'wp-two-two': [
    {
      title: 'Current Community and SMME Skills and Training',
      description:
        'Green – 66% or more responders picked the following skill Yellow – Between 33% and 65% responders picked the following skill Red – Less than 33% picked the following skill',
      levels: {
        above: 66,
        below: 33,
      },
      qKeys: ['questionSeven-One'],
      mutatorFn: (
        responses: any[],
        qKeys: string[],
        levels: { above: number; below: number }
      ) => {
        const filtered = responses.filter((x) => x[qKeys[0]]);

        const set = new Set();
        filtered.forEach((res) => {
          const items: string[] | string = res[qKeys[0]];
          if (Array.isArray(items)) items.forEach((item) => set.add(item));
          else set.add(items);
        });
        const rows = Array.from(set).map((item) => {
          return {
            skill: item,
            percent: Math.round(
              (filtered.filter((x) => x?.[qKeys[0]].includes(item)).length /
                filtered.length) *
                100
            ),
          };
        });

        return (
          <Table>
            <thead>
              <tr>
                <th>Skills & Training</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {/* {rows.map(
                // @ts-ignore
                ({ percent, skill }: { percent: number; skill: number }) => (
                  <tr key={skill}>
                    <td>{skill}</td>
                    <td
                      style={{
                        backgroundColor:
                          percent >= levels.above
                            ? 'green'
                            : percent <= levels.below
                            ? 'red'
                            : 'yellow',
                      }}
                    >
                      {percent}%
                    </td>
                  </tr>
                )
              )} */}
            </tbody>
          </Table>
        );
      },
    },
  ],
};

const Summary = () => {
  // DATA
  const {
    params: { key },
  } = useMatch<LocationGenerics>();
  const { data: responses, isLoading } = useGetResponses(key);

  const table = useMemo(() => {
    if (isLoading || !responses) return null;
    const tables = tableData?.[key as keyof typeof tableData];
    if (!tables)
      return (
        <Text>
          This package is not yet supported. Thank you for your patience.
        </Text>
      );

    return (
      <Stack spacing={'xl'}>
        {tables?.map((table: any, i) => {
          return (
            <Card key={i}>
              <Title my={'lg'}>{table.title}</Title>
              <Text>{table.description}</Text>
              <Divider my={'xl'} />
              {table?.mutatorFn(
                responses,
                table.qKeys,
                table.levels,
                table.survey
              )}
            </Card>
          );
        })}
      </Stack>
    );
  }, [responses, isLoading]);

  return (
    <>
      <Link to="/dashboard">
        <UnstyledButton
          mb={'xl'}
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
              <IconChevronsLeft />
            </Avatar>
            <div>
              <Text weight={700}>Package</Text>
              <Text size="xs" color="dimmed">
                Click here to go back
              </Text>
            </div>
          </Group>
        </UnstyledButton>
      </Link>
      {table}
    </>
  );
};

export { Summary };
