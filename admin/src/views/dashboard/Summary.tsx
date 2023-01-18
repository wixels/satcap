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

type levels = {
  operator: number;
  supervisor: number;
  manager: number;
};

function getScore(arr: any[], qKey: string[]) {
  const maxScore = qKey?.length * 5 * arr?.length;
  console.log('qKey::: ', qKey);
  console.log('arr::: ', arr);
  console.log('maxScore::: ', maxScore);
  let score = 0;
  arr.forEach((res) => {
    qKey.forEach((key: string) => {
      if (res[key]) score += Number(res[key].split('-')[0]);
    });
  });
  return Math.round((score / maxScore) * 100);
}

const interpretation = {
  a1: [
    'This grade relates to the workforce’s ability to use digital assets to communicate and learn. A low score would imply that the workforce does not confidently type on digital devices and/or does not use utilise digital assets to learn.',
    'Recommended that the workforce increase the amount of time typing on a digital device. An online, free-to-use learning platform is TypingClub (https://www.typingclub.com/) or TypingTrainer (https://www.typingtest.com/trainer/). Utilising these resources can increase the workforce’s ability to type and improve their active learning scores.',
  ],
  a2: [
    'These questions are evaluation-type questions that are based on the workforce’s general knowledge of digital security. A low score would relate to a lack of awareness of the discipline. In addition, this section aims to understand how the workforce responds to change.',
    'Living in a more digitised economy would require a better understanding of cyber security and the risks thereof. SkillUp hosts a free Introduction to Cyber Security course for anyone who registers to use it on their platform (https://www.simplilearn.com/learn-cyber-security-basics-skillup#how-do-beginners-learn-cyber-security-fundamentals)',
  ],
  b1: [
    'This selection of questions relates directly to how often the workforce uses specific software or applications to perform a function. Note that some of these may not be required of the workforce to perform their job. Therefore, it is important to consider the actual job activities of that workforce and whether the software tested is critical for them to perform their job.',
    'Encourage the workforce to spend more time using a digital asset that they have access to. There are various upskilling interventions available on ICDL Global (www.icdl.org.za).',
  ],
  b2: [
    'These questions relate to the workforce’s awareness of how and when to use technology to perform day-to-day activities and their willingness to use technology for their job.',
    'Engage with the workforce level to understand the hesitation behind using technology in their day-to-day activities. Bespoke interventions may be required as per the workforce’s needs and reservations.',
  ],
  c1: [
    'This grade relates to the workforce’s ability to integrate their personal or professional activities with technology for optimal results. A low score would imply the workforce still lives a &quot;low-tech&quot; life.',
    'Encourage the workforce to spend more time using a digital asset that they have access to. There are various upskilling interventions available on ICDL Global (www.icdl.org.za).',
  ],
  c2: [
    'This section aims to understand if and how the workforce uses the internet to obtain information. Once that information is obtained, how do they then make sense of it in relation to their specific job function within the organisation. Furthermore, the section aims to understand the psychological nature of the workforce and how they perceive themselves in relation to the digital transformation and perceived leadership ability from close colleagues.',
    'Development intervention may require a refresher course on specific procedures required to perform the day-to-day activities across the workforce levels.',
  ],
  d1: [
    'The digital confidence section tries to understand how capable the workforce believes they are when utilising digital assets to perform specific job activities. A low score would imply that the workforce does not feel confident using the specific applications to perform their job.',
    'Refer to the job description of the employee to understand their specific job activities. If the various digital applications are not necessary then the employee should not be judged unfavourably. However, there are free online training courses if additional training is required on the specific applications. For example, free video tutorials can be found on GCF Global (https://edu.gcfglobal.org/en/topics/office/). Skilling and upskilling in these applications can occur in the employee&#39;s personal time. More advanced courses can be found on Alison (https://alison.com/tag/microsoft-office), which are free to use once an account has been created.',
  ],
  d2: [
    'This section aims to understand how the workforce proactively uses digital assets to learn, and subsequently apply those learnings to their job. In addition, the section attempts to understand how the workforce responds to change within their job function. A low score would imply that the workforce does not actively learn and apply new ways of doing things to their job activities nor are they willing to.',
    'Refer to the job description of the employee to understand their specific job activities. If the various digital applications are not necessary, then the employee should not be judged unfavourably. Microsoft 365 offers a wide range of training services that are free to use if the organisation possesses a Microsoft subscription. There are many factsheets, infographics, and training courses that any employee can use to increase their knowledge on how to use the various software applications more confidently and productively. These can be found here https://support.microsoft.com/en-us/training',
  ],
  e1: [
    'These questions aim to understand the level of critical thinking with digital assets that the workforce utilises to understand and interpret information. Relate that information to the organisation&#39;s objectives. Plan a course to achieve those objectives using the information and human capital at their disposal. Lastly, setting clear goals to measure, monitor, and evaluate the outcomes of their decisions. A low score would imply limited utilisation of digital assets to perform the steps above.',
    'It is recommended that the employee read over the resources listed on the SATCAP dashboard. For ease of reference: 1. PwC Workforce Of The Future 2030 2. PwC Global Trends Challenged By African Realities Report 3.Harvard Business Review Digital Transformation Refocused 4. SABPP Leadership Standard 5. WEF Future Skills Article',
  ],
  e2: [
    'The aim of this section is to understand how the workforce leads and influences across digital channels. Furthermore, whether they are willing to adapt to the digital transformation occurring around them.',
    'It is recommended that the employee read over the resources listed on the SATCAP dashboard. For ease of reference: 1. PwC Workforce Of The Future 2030 2. PwC Global Trends Challenged By African Realities Report 3. Harvard Business Review Digital Transformation Refocused 4. SABPP Leadership Standard 5. WEF Future Skills Article',
  ],
};

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
      title: 'Digital Literacy',
      description: '',
      levels: {
        a1: {
          operator: 59,
          supervisor: 60,
          manager: 71,
        },
        a2: {
          operator: 54,
          supervisor: 57,
          manager: 90,
        },
      },
      qKeys: {
        a1: ['questionSix', 'questionSeven', 'questionEight'],
        a2: ['questionNine', 'questionTen', 'questionEleven'],
      },
      mutatorFn: (
        responses: any[],
        qKeys: { a1: string[]; a2: string[] },
        levels: {
          a1: levels;
          a2: levels;
        }
      ) => {
        const operators = responses.filter(
          (x) => x?.questionTwo === 'Operator'
        );
        const supervisors = responses.filter(
          (x) => x?.questionTwo === 'Supervisor'
        );
        const managers = responses.filter((x) => x?.questionTwo === 'Manager');

        type keyType = keyof typeof qKeys;
        const rows = Object.keys(qKeys).map((key: string) => {
          return {
            grade: key,
            interpretation:
              interpretation[key as keyof typeof interpretation][0],
            operator: getScore(operators, qKeys[key as keyType]),
            supervisor: getScore(supervisors, qKeys[key as keyType]),
            manager: getScore(managers, qKeys[key as keyType]),
            intervention: interpretation[key as keyof typeof interpretation][1],
          };
        });

        return (
          <Table>
            <thead>
              <tr>
                <th>Grade</th>
                <th>Construct interpretation</th>
                <th>Operators</th>
                <th>Supervisors</th>
                <th>Managers</th>
                <th>Development intervention</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(
                ({
                  grade,
                  interpretation,
                  operator,
                  supervisor,
                  manager,
                  intervention,
                }) => (
                  <tr key={grade}>
                    <td style={{ textTransform: 'uppercase' }}>{grade}</td>
                    <td style={{ width: '30%' }}>{interpretation}</td>
                    <td
                      style={{
                        backgroundColor:
                          operator >=
                          levels[grade as keyof typeof levels].operator
                            ? 'green'
                            : operator <=
                              levels[grade as keyof typeof levels].operator - 25
                            ? 'red'
                            : 'yellow',
                      }}
                    >
                      {operator}
                    </td>
                    <td
                      style={{
                        backgroundColor:
                          supervisor >=
                          levels[grade as keyof typeof levels].supervisor
                            ? 'green'
                            : supervisor <=
                              levels[grade as keyof typeof levels].supervisor -
                                25
                            ? 'red'
                            : 'yellow',
                      }}
                    >
                      {supervisor}
                    </td>
                    <td
                      style={{
                        backgroundColor:
                          manager >=
                          levels[grade as keyof typeof levels].manager
                            ? 'green'
                            : manager <=
                              levels[grade as keyof typeof levels].manager - 25
                            ? 'red'
                            : 'yellow',
                      }}
                    >
                      {manager}
                    </td>
                    <td style={{ width: '30%' }}>{intervention}</td>
                  </tr>
                )
              )}
            </tbody>
          </Table>
        );
      },
    },
    {
      title: 'Digital Fluency',
      description: '',
      levels: {
        b1: {
          operator: 41,
          supervisor: 50,
          manager: 75,
        },
        b2: {
          operator: 61,
          supervisor: 66,
          manager: 78,
        },
      },
      qKeys: {
        b1: [
          'questionTwelve',
          'questionThirteen',
          'questionFourteen',
          'questionFifteen',
          'questionSixteen',
          'questionSeventeen',
          'questionEighteen',
          'questionNineeen',
        ],
        b2: ['questionTwenty', 'questionTwentyOne'],
      },
      mutatorFn: (
        responses: any[],
        qKeys: { b1: string[]; b2: string[] },
        levels: {
          b1: levels;
          b2: levels;
        }
      ) => {
        const operators = responses.filter(
          (x) => x?.questionTwo === 'Operator'
        );
        const supervisors = responses.filter(
          (x) => x?.questionTwo === 'Supervisor'
        );
        const managers = responses.filter((x) => x?.questionTwo === 'Manager');

        type keyType = keyof typeof qKeys;
        const rows = Object.keys(qKeys).map((key: string) => {
          return {
            grade: key,
            interpretation:
              interpretation[key as keyof typeof interpretation][0],
            operator: getScore(operators, qKeys[key as keyType]),
            supervisor: getScore(supervisors, qKeys[key as keyType]),
            manager: getScore(managers, qKeys[key as keyType]),
            intervention: interpretation[key as keyof typeof interpretation][1],
          };
        });

        return (
          <Table>
            <thead>
              <tr>
                <th>Grade</th>
                <th>Construct interpretation</th>
                <th>Operators</th>
                <th>Supervisors</th>
                <th>Managers</th>
                <th>Development intervention</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(
                ({
                  grade,
                  interpretation,
                  operator,
                  supervisor,
                  manager,
                  intervention,
                }) => (
                  <tr key={grade}>
                    <td style={{ textTransform: 'uppercase' }}>{grade}</td>
                    <td style={{ width: '30%' }}>{interpretation}</td>
                    <td
                      style={{
                        backgroundColor:
                          operator >=
                          levels[grade as keyof typeof levels].operator
                            ? 'green'
                            : operator <=
                              levels[grade as keyof typeof levels].operator - 25
                            ? 'red'
                            : 'yellow',
                      }}
                    >
                      {operator}
                    </td>
                    <td
                      style={{
                        backgroundColor:
                          supervisor >=
                          levels[grade as keyof typeof levels].supervisor
                            ? 'green'
                            : supervisor <=
                              levels[grade as keyof typeof levels].supervisor -
                                25
                            ? 'red'
                            : 'yellow',
                      }}
                    >
                      {supervisor}
                    </td>
                    <td
                      style={{
                        backgroundColor:
                          manager >=
                          levels[grade as keyof typeof levels].manager
                            ? 'green'
                            : manager <=
                              levels[grade as keyof typeof levels].manager - 25
                            ? 'red'
                            : 'yellow',
                      }}
                    >
                      {manager}
                    </td>
                    <td style={{ width: '30%' }}>{intervention}</td>
                  </tr>
                )
              )}
            </tbody>
          </Table>
        );
      },
    },
    {
      title: 'Digital Proficiency',
      description: '',
      levels: {
        c1: {
          operator: 65,
          supervisor: 75,
          manager: 88,
        },
        c2: {
          operator: 68,
          supervisor: 74,
          manager: 89,
        },
      },
      qKeys: {
        c1: [
          'questionTwentyTwo',
          'questionTwentyThree',
          'questionTwentyFour',
          'questionTwentyFive',
        ],
        c2: ['questionTwentySix', 'questionTwentySeven', 'questionTwentyEight'],
      },
      mutatorFn: (
        responses: any[],
        qKeys: { c1: string[]; c2: string[] },
        levels: {
          c1: levels;
          c2: levels;
        }
      ) => {
        const operators = responses.filter(
          (x) => x?.questionTwo === 'Operator'
        );
        const supervisors = responses.filter(
          (x) => x?.questionTwo === 'Supervisor'
        );
        const managers = responses.filter((x) => x?.questionTwo === 'Manager');

        type keyType = keyof typeof qKeys;
        const rows = Object.keys(qKeys).map((key: string) => {
          return {
            grade: key,
            interpretation:
              interpretation[key as keyof typeof interpretation][0],
            operator: getScore(operators, qKeys[key as keyType]),
            supervisor: getScore(supervisors, qKeys[key as keyType]),
            manager: getScore(managers, qKeys[key as keyType]),
            intervention: interpretation[key as keyof typeof interpretation][1],
          };
        });

        return (
          <Table>
            <thead>
              <tr>
                <th>Grade</th>
                <th>Construct interpretation</th>
                <th>Operators</th>
                <th>Supervisors</th>
                <th>Managers</th>
                <th>Development intervention</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(
                ({
                  grade,
                  interpretation,
                  operator,
                  supervisor,
                  manager,
                  intervention,
                }) => (
                  <tr key={grade}>
                    <td style={{ textTransform: 'uppercase' }}>{grade}</td>
                    <td style={{ width: '30%' }}>{interpretation}</td>
                    <td
                      style={{
                        backgroundColor:
                          operator >=
                          levels[grade as keyof typeof levels].operator
                            ? 'green'
                            : operator <=
                              levels[grade as keyof typeof levels].operator - 25
                            ? 'red'
                            : 'yellow',
                      }}
                    >
                      {operator}
                    </td>
                    <td
                      style={{
                        backgroundColor:
                          supervisor >=
                          levels[grade as keyof typeof levels].supervisor
                            ? 'green'
                            : supervisor <=
                              levels[grade as keyof typeof levels].supervisor -
                                25
                            ? 'red'
                            : 'yellow',
                      }}
                    >
                      {supervisor}
                    </td>
                    <td
                      style={{
                        backgroundColor:
                          manager >=
                          levels[grade as keyof typeof levels].manager
                            ? 'green'
                            : manager <=
                              levels[grade as keyof typeof levels].manager - 25
                            ? 'red'
                            : 'yellow',
                      }}
                    >
                      {manager}
                    </td>
                    <td style={{ width: '30%' }}>{intervention}</td>
                  </tr>
                )
              )}
            </tbody>
          </Table>
        );
      },
    },
    {
      title: 'Digital Confidence',
      description: '',
      levels: {
        d1: {
          operator: 0,
          supervisor: 73,
          manager: 90,
        },
        d2: {
          operator: 0,
          supervisor: 74,
          manager: 90,
        },
      },
      qKeys: {
        d1: [
          'questionTwentyNine',
          'questionThirty',
          'questionThirtyOne',
          'questionThirtyTwo',
          'questionThirtyThree',
          'questionThirtyFour',
        ],
        d2: ['questionThirtyFive', 'questionThirtySix', 'questionThirtySeven'],
      },
      mutatorFn: (
        responses: any[],
        qKeys: { d1: string[]; d2: string[] },
        levels: {
          d1: levels;
          d2: levels;
        }
      ) => {
        const operators = responses.filter(
          (x) => x?.questionTwo === 'Operator'
        );
        const supervisors = responses.filter(
          (x) => x?.questionTwo === 'Supervisor'
        );
        const managers = responses.filter((x) => x?.questionTwo === 'Manager');

        type keyType = keyof typeof qKeys;
        const rows = Object.keys(qKeys).map((key: string) => {
          return {
            grade: key,
            interpretation:
              interpretation[key as keyof typeof interpretation][0],
            operator: getScore(operators, qKeys[key as keyType]),
            supervisor: getScore(supervisors, qKeys[key as keyType]),
            manager: getScore(managers, qKeys[key as keyType]),
            intervention: interpretation[key as keyof typeof interpretation][1],
          };
        });

        return (
          <Table>
            <thead>
              <tr>
                <th>Grade</th>
                <th>Construct interpretation</th>
                <th>Operators</th>
                <th>Supervisors</th>
                <th>Managers</th>
                <th>Development intervention</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(
                ({
                  grade,
                  interpretation,
                  supervisor,
                  manager,
                  intervention,
                }) => (
                  <tr key={grade}>
                    <td style={{ textTransform: 'uppercase' }}>{grade}</td>
                    <td style={{ width: '30%' }}>{interpretation}</td>
                    <td
                      style={{
                        backgroundColor: 'black',
                      }}
                    ></td>
                    <td
                      style={{
                        backgroundColor:
                          supervisor >=
                          levels[grade as keyof typeof levels].supervisor
                            ? 'green'
                            : supervisor <=
                              levels[grade as keyof typeof levels].supervisor -
                                25
                            ? 'red'
                            : 'yellow',
                      }}
                    >
                      {supervisor}
                    </td>
                    <td
                      style={{
                        backgroundColor:
                          manager >=
                          levels[grade as keyof typeof levels].manager
                            ? 'green'
                            : manager <=
                              levels[grade as keyof typeof levels].manager - 25
                            ? 'red'
                            : 'yellow',
                      }}
                    >
                      {manager}
                    </td>
                    <td style={{ width: '30%' }}>{intervention}</td>
                  </tr>
                )
              )}
            </tbody>
          </Table>
        );
      },
    },
    {
      title: 'Digital Leadership',
      description: '',
      levels: {
        e1: {
          operator: 0,
          supervisor: 0,
          manager: 86,
        },
        e2: {
          operator: 0,
          supervisor: 0,
          manager: 82,
        },
      },
      qKeys: {
        e1: [
          'questionThirtyEight',
          'questionThirtyNine',
          'questionForty',
          'questionFortyOne',
          'questionFortyTwo',
          'questionFortyThree',
          'questionFortyFour',
          'questionFortyFive',
          'questionFortySix',
        ],
        e2: [
          'questionFortySeven',
          'questionFortyEight',
          'questionFortyNine',
          'questionFifty',
          'questionFiftyOne',
          'questionFiftyTwo',
          'questionFiftyThree',
          'questionFiftyFour',
          'questionFiftyFive',
          'questionFiftySix',
          'questionFiftySeven',
        ],
      },
      mutatorFn: (
        responses: any[],
        qKeys: { e1: string[]; e2: string[] },
        levels: {
          e1: levels;
          e2: levels;
        }
      ) => {
        const operators = responses.filter(
          (x) => x?.questionTwo === 'Operator'
        );
        const supervisors = responses.filter(
          (x) => x?.questionTwo === 'Supervisor'
        );
        const managers = responses.filter((x) => x?.questionTwo === 'Manager');

        type keyType = keyof typeof qKeys;
        const rows = Object.keys(qKeys).map((key: string) => {
          return {
            grade: key,
            interpretation:
              interpretation[key as keyof typeof interpretation][0],
            operator: getScore(operators, qKeys[key as keyType]),
            supervisor: getScore(supervisors, qKeys[key as keyType]),
            manager: getScore(managers, qKeys[key as keyType]),
            intervention: interpretation[key as keyof typeof interpretation][1],
          };
        });

        return (
          <Table>
            <thead>
              <tr>
                <th>Grade</th>
                <th>Construct interpretation</th>
                <th>Operators</th>
                <th>Supervisors</th>
                <th>Managers</th>
                <th>Development intervention</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ grade, interpretation, manager, intervention }) => (
                <tr key={grade}>
                  <td style={{ textTransform: 'uppercase' }}>{grade}</td>
                  <td style={{ width: '30%' }}>{interpretation}</td>
                  <td
                    style={{
                      backgroundColor: 'black',
                    }}
                  />
                  <td
                    style={{
                      backgroundColor: 'black',
                    }}
                  />
                  <td
                    style={{
                      backgroundColor:
                        manager >= levels[grade as keyof typeof levels].manager
                          ? 'green'
                          : manager <=
                            levels[grade as keyof typeof levels].manager - 25
                          ? 'red'
                          : 'yellow',
                    }}
                  >
                    {manager}
                  </td>
                  <td style={{ width: '30%' }}>{intervention}</td>
                </tr>
              ))}
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
