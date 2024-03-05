const functions = require('firebase-functions')
const admin = require('firebase-admin')
const dayjs = require('dayjs')
const { customAlphabet } = require('nanoid')

if (admin.apps.length === 0) {
  admin.initializeApp()
}

exports.createAuthentication = functions.firestore
  .document('mines/{mineId}/users/{userId}')
  .onCreate(async (snap, context) => {
    const adminUrl = process.env.ADMIN_URL
    const userUrl = process.env.USER_URL

    const user = snap.data()
    const password = generator.generate()

    const newUser = {
      email: user.email,
      phoneNumber: (user.mobile?.length) ? user.mobile : null,
      displayName: user.name,
      password
    }

    if (!newUser.phoneNumber) delete newUser.phoneNumber

    const userRecord = await admin.auth().createUser(newUser)

    await admin.firestore().collection(`mines/${context.params.mineId}/users`).doc(context.params.userId).update({
      authUid: userRecord.uid
    })

    await admin.firestore().collection("mail").add({
      to: user.email,
      message: {
        subject: 'SATCAP Admin | New Account Created',
        text: `Hi ${user.name}. Welcome to SATCAP Admin. Please sign in (${adminUrl}) using the following password: ${password}`,
        html: `
          <div style="padding: 20px; background-color: rgb(247, 247, 247);border-radius:10px;max-width:640px;margin:0 auto;">
            <img src="${userUrl}/_style/images/emailheader.jpg" style="width:100%;object-fit:cover;max-height:150px;border-radius:10px;"/>
            <h2 style="font-size: 2em;">Welcome ${user.name}</h2>
            <br>
            <p style="font-size: 1.2em;">You've just been added to the SATCAP Admin Platform; Happy to have you onboard!</p>
            <p style="font-size: 1.2em;">Your Password is:  <strong style="font-size: 1.3em;">${password}</strong></p>
            <br>
            <p style="font-size: 1.2em;">Click below to get started:</p>
            <a style="font-size: 1.2em;" href="${adminUrl}">SATCAP Admin</a><br>
            <br/><br/><br/>
            <div style="text-align:center;width:100%;margin:0 auto;">
              <img src="${userUrl}/_style/images/logo.png" style="width:30px;" alt="SATCAP Logo" />
              <strong style="text-align:center;font-size: 1em;">SATCAP</strong>
            </div>
          </div>
        `
      }
    })
  })

exports.submitQuery = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST')
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    res.set('Access-Control-Max-Age', '3600')
    res.status(204).send('')
    res.end()
  } else {
    if (req.body.mineDocId) {
      const query = await admin.firestore().collection(`mines/${req.body.mineDocId}/queries`).add({
        name: (req.body.isAnonymous === 'on') ? 'Private' : req.body.name,
        contact: (req.body.isAnonymous === 'on') ? 'Private' : req.body.contact,
        title: req.body.title,
        description: req.body.description,
        image: req.body.imageUrl || '',
        userRef: req.body.userRef,
        mineDocId: req.body.mineDocId,
        linkDocId: req.body.linkDocId,
        locationDocId: req.body.locationDocId,
        isAnonymous: (req.body.isAnonymous === 'on'),
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        status: 'open'
      })

      res.send({ sucesss: true, message: 'Successfully created query' })
      res.end()
    } else {
      res.status(412).send({ sucesss: false, message: 'Unable to create query: We need a valid mine ID to continue' })
      res.end()
    }
  }
})

exports.deleteQuery = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'DELETE')
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    res.set('Access-Control-Max-Age', '3600')
    res.status(204).send('')
    res.end()
  } else {
    if (req.body.mineDocId && req.body.queryDocId) {
      await admin.firestore().collection(`mines/${req.body.mineDocId}/queries`).doc(req.body.queryDocId).delete();
      res.send({ sucesss: true, message: 'Successfully deleted query' })
      res.end()
    } else {
      res.status(412).send({ sucesss: false, message: 'Unable to delete query: We need a valid mine ID and query doc ID to continue' })
      res.end()
    }
  }
})

exports.submitSurvey = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST')
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    res.set('Access-Control-Max-Age', '3600')
    res.status(204).send('')
    res.end()
  } else {
    if (req.body.mineDocId && req.body.linkDocId) {
      await admin.firestore().collection(`mines/${req.body.mineDocId}/links/${req.body.linkDocId}/responses`).add({
        ...req.body,
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
      })

      res.send({ sucesss: true, message: 'Successfully submitted your responses' })
      res.end()
    } else {
      res.status(412).send({ sucesss: false, message: 'Unable to submit response: We need a valid mine ID and link ID to continue' })
      res.end()
    }
  }
})

exports.addMine = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET')
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    res.set('Access-Control-Max-Age', '3600')
    res.status(204).send('')
    res.end()
  } else {
    await admin.firestore().collection('mines').add({
      name: req.query.name || 'Enter your mine name here using Firebase console',
      description: 'Enter your mine description here using Firebase console',
      address: 'Enter your mine location here using Firebase console',
      packages: ['ye0erjENgXMIgAMbsufs', 'zM4Z6N9H82ks1xiNLKen', 'ckCa1z7bexNKBI8Ufk0z', 'w8jONMPpUov16uTFJT4G'],
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
    })

    res.send('Mine successfully added to your project')
    res.end()
  }
})

exports.importQuestions = functions.https.onRequest(async (req, res) => {
  
  const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 9)

  res.set('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET')
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    res.set('Access-Control-Max-Age', '3600')
    res.status(204).send('')
    res.end()
  } else {

    const db = admin.firestore()
    const batch = db.batch();
    let writeCount = 0

    const addQuestions = async function (questions, answerId = null) {
      for (let i = 0; i < questions.length; i++) {
        const questionId = nanoid()

        if (Array.isArray(questions[i].answers)) {
          for (const answer of questions[i].answers) {
            answer.id = nanoid()
          }
        }

        if (writeCount <= 500) {
          batch.set(db.collection('questions').doc(questionId), { ...questions[i], id: questionId, answerId, order: i })
          writeCount++
        } else {
          res.send('Too many questions')
          res.end()
          return
        }

        if (Array.isArray(questions[i].answers)) {
          const subQuestions = questions[i].answers.filter((answer) => answer.subView === 'questions')
          if (subQuestions.length) {
            for (let a = 0; a < subQuestions.length; a++) {
              await addQuestions(subQuestions[a].questions, subQuestions[a].id)
            }
          }
        }
      }
    }

    // SMME Engagement Tool
    const wpThreeOnePre = [
      {
        "title": "Does your company have a registered name?",
        "subtitle": "",
        "surveyKey": "wp-three-one-pre",
        "reportingKey": "questionOne",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": "link",
            "link": {
              "title": "Please click on this link to access resources that can help you:",
              "name": "Pre-application cheat sheet",
              "url": "/resources/SMME%20Engagement%20Tool/Pre-Application%20Cheat%20Sheet.pdf"
            },
            "subViewRelated": true,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Do you have a company trading name?",
        "subtitle": "",
        "surveyKey": "wp-three-one-pre",
        "reportingKey": "questionTwo",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": "link",
            "link": {
              "title": "Please click on this link to access resources that can help you:",
              "name": "Pre-application cheat sheet",
              "url": "/resources/SMME%20Engagement%20Tool/Pre-Application%20Cheat%20Sheet.pdf"
            },
            "subViewRelated": true,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Do you have a primary contact person for the company?",
        "subtitle": "",
        "surveyKey": "wp-three-one-pre",
        "reportingKey": "questionThree",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": "link",
            "link": {
              "title": "Please click on this link to access resources that can help you:",
              "name": "Pre-application cheat sheet",
              "url": "/resources/SMME%20Engagement%20Tool/Pre-Application%20Cheat%20Sheet.pdf"
            },
            "subViewRelated": true,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Do you have a primary contact email address for the company?",
        "subtitle": "",
        "surveyKey": "wp-three-one-pre",
        "reportingKey": "questionFour",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": "link",
            "link": {
              "title": "Please click on this link to access resources that can help you:",
              "name": "Pre-application cheat sheet",
              "url": "/resources/SMME%20Engagement%20Tool/Pre-Application%20Cheat%20Sheet.pdf"
            },
            "subViewRelated": true,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Can you explain what your product or service offering is?",
        "subtitle": "",
        "surveyKey": "wp-three-one-pre",
        "reportingKey": "questionFive",
        "answerId": "",
        "type": "dropdown",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Automotive",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Agriculture, regenerative agriculture, agro-processing and re-forestry",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Construction and building",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Creative and Design Industry",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Engineering",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Healthcare",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Mining and minerals",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Mine rehabilitation",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Mine waste beneficiation",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "e-Waste",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Renewable energy",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Small/light manufacturing",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Services and retail trade",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Textiles",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Tourism and hospitality (accomodation and catering)",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Oil and gas",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Recycling or Upcycling",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Waste management",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Catering",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Retail",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Education and Training",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Other",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": true
          }
        ]
      },
      {
        "title": "Is your company registered with the Companies and Intellectual Properties Commission (CIPC)?",
        "subtitle": "",
        "surveyKey": "wp-three-one-pre",
        "reportingKey": "questionSix",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": "link",
            "link": {
              "title": "Please click on this link to access resources that can help you:",
              "name": "Pre-application cheat sheet",
              "url": "/resources/SMME%20Engagement%20Tool/Pre-Application%20Cheat%20Sheet.pdf"
            },
            "subViewRelated": true,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Do you have a company registration number?",
        "subtitle": "",
        "surveyKey": "wp-three-one-pre",
        "reportingKey": "questionSeven",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": "link",
            "link": {
              "title": "Please click on this link to access resources that can help you:",
              "name": "Pre-application cheat sheet",
              "url": "/resources/SMME%20Engagement%20Tool/Pre-Application%20Cheat%20Sheet.pdf"
            },
            "subViewRelated": true,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Is your company registered on the Central Supplier Database (CSD)?",
        "subtitle": "",
        "surveyKey": "wp-three-one-pre",
        "reportingKey": "questionEight",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": "link",
            "link": {
              "title": "Please click on this link to access resources that can help you:",
              "name": "Pre-application cheat sheet",
              "url": "/resources/SMME%20Engagement%20Tool/Pre-Application%20Cheat%20Sheet.pdf"
            },
            "subViewRelated": true,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Is your company registered with the Workmans Compensation Fund?",
        "subtitle": "",
        "surveyKey": "wp-three-one-pre",
        "reportingKey": "questionNine",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": "link",
            "link": {
              "title": "Please click on this link to access resources that can help you:",
              "name": "Pre-application cheat sheet",
              "url": "/resources/SMME%20Engagement%20Tool/Pre-Application%20Cheat%20Sheet.pdf"
            },
            "subViewRelated": true,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "What type of company do you operate?",
        "subtitle": "",
        "surveyKey": "wp-three-one-pre",
        "reportingKey": "questionTen",
        "answerId": "",
        "type": "dropdown",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Sole Proprietor",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Partnership",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Public Company",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Private Company (Pty) Ltd",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Other (Not-for-Profit, Franchise, etc.)",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Unsure",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Are you an exempt micro enterprise (turnover less than R10M) or qualifying small enterprise (turnover between R10M-50M) or generic enterprise (turnover above R50M)?",
        "subtitle": "",
        "surveyKey": "wp-three-one-pre",
        "reportingKey": "questionEleven",
        "answerId": "",
        "type": "dropdown",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Micro",
            "description": "Annual turnover < R10 million",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Small",
            "description": "Annual turnover > or equal to R10 million but < R50 million",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Generic",
            "description": "Annual turnover > R50 million",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Unknown",
            "description": "I am not sure",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Are you an exempt micro enterprise (turnover less than R10M) or qualifying small enterprise (turnover between R10M-50M) or generic enterprise (turnover above R50M)?",
        "subtitle": "",
        "surveyKey": "wp-three-one-pre",
        "reportingKey": "questionTwelve",
        "answerId": "",
        "type": "dropdown",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Level One",
            "description": "Level One > 100 points",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Level Two",
            "description": "Level Two > 95 but < 100 points",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Level Three",
            "description": "Level Three > 90 but < 95 points",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Level Four",
            "description": "Level Four > 80 but < 90 points",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Unknown",
            "description": "Unsure",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Do you have a company tax number?",
        "subtitle": "",
        "surveyKey": "wp-three-one-pre",
        "reportingKey": "questionThirteen",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": "link",
            "link": {
              "title": "Please click on this link to access resources that can help you:",
              "name": "Pre-application cheat sheet",
              "url": "/resources/SMME%20Engagement%20Tool/Pre-Application%20Cheat%20Sheet.pdf"
            },
            "subViewRelated": true,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Do you have a VAT registration number?",
        "subtitle": "",
        "surveyKey": "wp-three-one-pre",
        "reportingKey": "questionFourteen",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": "link",
            "link": {
              "title": "Please click on this link to access resources that can help you:",
              "name": "Pre-application cheat sheet",
              "url": "/resources/SMME%20Engagement%20Tool/Pre-Application%20Cheat%20Sheet.pdf"
            },
            "subViewRelated": true,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Do you have a bank account for your business?",
        "subtitle": "",
        "surveyKey": "wp-three-one-pre",
        "reportingKey": "questionFifteen",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": "link",
            "link": {
              "title": "Please click on this link to access resources that can help you:",
              "name": "Pre-application cheat sheet",
              "url": "/resources/SMME%20Engagement%20Tool/Pre-Application%20Cheat%20Sheet.pdf"
            },
            "subViewRelated": true,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Do you prepare internal management accounts or financial statements?",
        "subtitle": "",
        "surveyKey": "wp-three-one-pre",
        "reportingKey": "questionSixteen",
        "answerId": "",
        "type": "dropdown",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes, we prepare financial statements and management accounts",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No, we do not prepare financial statements or management accounts",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No, we do not prepare financial statements",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No, we do not prepare management accounts",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "When is your financial year end? The term \"financial year-end\" refers to the completion of any one-year or 12-month accounting period",
        "subtitle": "",
        "surveyKey": "wp-three-one-pre",
        "reportingKey": "questionSeventeen",
        "answerId": "",
        "type": "date",
        "maxAnswerCount": null,
        "isLocked": true
      },
      {
        "title": "The average time to complete the application process is 6-8 hours - if your governance is in place. Have you set aside enough time to complete this process?",
        "subtitle": "",
        "surveyKey": "wp-three-one-pre",
        "reportingKey": "questionEighteen",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Do you know how long an application takes to complete when you have all the required documents on hand?",
        "subtitle": "",
        "surveyKey": "wp-three-one-pre",
        "reportingKey": "questionNineteen",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": "link",
            "link": {
              "title": "Please click on this link to access resources that can help you:",
              "name": "Pre-application cheat sheet",
              "url": "/resources/SMME%20Engagement%20Tool/Pre-Application%20Cheat%20Sheet.pdf"
            },
            "subViewRelated": true,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Are you aware of the closing date for the procurement opportunity that you are applying for?",
        "subtitle": "",
        "surveyKey": "wp-three-one-pre",
        "reportingKey": "questionTwenty",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": "link",
            "link": {
              "title": "Please click on this link to access resources that can help you:",
              "name": "Pre-application cheat sheet",
              "url": "/resources/SMME%20Engagement%20Tool/Pre-Application%20Cheat%20Sheet.pdf"
            },
            "subViewRelated": true,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Do you understand the tender requirements?",
        "subtitle": "",
        "surveyKey": "wp-three-one-pre",
        "reportingKey": "questionTwentyOne",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": "link",
            "link": {
              "title": "Please click on this link to access resources that can help you:",
              "name": "Pre-application cheat sheet",
              "url": "/resources/SMME%20Engagement%20Tool/Pre-Application%20Cheat%20Sheet.pdf"
            },
            "subViewRelated": true,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Do you know how to interpret a Request for Proposal (RFP)?",
        "subtitle": "",
        "surveyKey": "wp-three-one-pre",
        "reportingKey": "questionTwentyTwo",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": "link",
            "link": {
              "title": "Please click on this link to access resources that can help you:",
              "name": "Pre-application cheat sheet",
              "url": "/resources/SMME%20Engagement%20Tool/Pre-Application%20Cheat%20Sheet.pdf"
            },
            "subViewRelated": true,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Are you aware of health and safety requirements you need to comply with as an employer?",
        "subtitle": "",
        "surveyKey": "wp-three-one-pre",
        "reportingKey": "questionTwentyThree",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": "link",
            "link": {
              "title": "Please click on this link to access resources that can help you:",
              "name": "Health and Safety Requirements for an employer",
              "url": "https://www.labour.gov.za/DocumentCenter/Publications/Occupational%20Health%20and%20Safety/What%20every%20worker%20should%20know%20about%20health%20and%20safety%20at%20work.pdf"
            },
            "subViewRelated": true,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Have you conducted business/obtained a work contract with the mines before?",
        "subtitle": "",
        "surveyKey": "wp-three-one-pre",
        "reportingKey": "questionTwentyFour",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Are you able to produce proof of your BBBEE Certification?",
        "subtitle": "",
        "surveyKey": "wp-three-one-pre",
        "reportingKey": "questionTwentyFive",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Do you meet the functionality criteria for the opportunity you are interested in?",
        "subtitle": "",
        "surveyKey": "wp-three-one-pre",
        "reportingKey": "questionTwentySix",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      }
    ]
    const wpThreeOnePost = [
      {
        "title": "Have you submitted the required supporting documentation for your tender submission?",
        "subtitle": "",
        "surveyKey": "wp-three-one-post",
        "reportingKey": "questionOne",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": "link",
            "link": {
              "title": "Please click on this link to access resources that can help you:",
              "name": "Post-application cheat sheet",
              "url": "/resources/SMME%20Engagement%20Tool/Bz376PxTgi-Post-Application%20Cheat%20Sheet.pdf"
            },
            "subViewRelated": true,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Are you aware of the pre-application readiness checklist that assists by guiding you through the application process?",
        "subtitle": "",
        "surveyKey": "wp-three-one-post",
        "reportingKey": "questionTwo",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": "link",
            "link": {
              "title": "Please note: You can complete the pre-application checklist on this tool by visiting the home page"
            },
            "subViewRelated": true,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Have you taken our pre-application readiness checklist?",
        "subtitle": "This checklist assists in guiding you through the application process.",
        "surveyKey": "wp-three-one-post",
        "reportingKey": "questionThree",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": "link",
            "link": {
              "title": "Please note: You can complete the pre-application checklist on this tool by visiting the home page"
            },
            "subViewRelated": true,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Have you checked that you have supplied the mining company with the correct contact information?",
        "subtitle": "",
        "surveyKey": "wp-three-one-post",
        "reportingKey": "questionFour",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": "link",
            "link": {
              "title": "Please click on this link to access resources that can help you:",
              "name": "Post-application cheat sheet",
              "url": "/resources/SMME%20Engagement%20Tool/Bz376PxTgi-Post-Application%20Cheat%20Sheet.pdf"
            },
            "subViewRelated": true,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Did you verify that your application was successfully submitted?",
        "subtitle": "",
        "surveyKey": "wp-three-one-post",
        "reportingKey": "questionFive",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": "link",
            "link": {
              "title": "Please click on this link to access resources that can help you:",
              "name": "Post-application cheat sheet",
              "url": "/resources/SMME%20Engagement%20Tool/Bz376PxTgi-Post-Application%20Cheat%20Sheet.pdf"
            },
            "subViewRelated": true,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Did you verify that your application was successfully submitted?",
        "subtitle": "",
        "surveyKey": "wp-three-one-post",
        "reportingKey": "questionFive",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": "link",
            "link": {
              "title": "Please click on this link to access resources that can help you:",
              "name": "Post-application cheat sheet",
              "url": "/resources/SMME%20Engagement%20Tool/Bz376PxTgi-Post-Application%20Cheat%20Sheet.pdf"
            },
            "subViewRelated": true,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Do you know where to check the status of your application?",
        "subtitle": "",
        "surveyKey": "wp-three-one-post",
        "reportingKey": "questionSix",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": "link",
            "link": {
              "title": "Please click on this link to access resources that can help you:",
              "name": "Post-application cheat sheet",
              "url": "/resources/SMME%20Engagement%20Tool/Bz376PxTgi-Post-Application%20Cheat%20Sheet.pdf"
            },
            "subViewRelated": true,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Are you actively monitoring the status of your application where possible?",
        "subtitle": "",
        "surveyKey": "wp-three-one-post",
        "reportingKey": "questionSeven",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": "link",
            "link": {
              "title": "Please click on this link to access resources that can help you:",
              "name": "Post-application cheat sheet",
              "url": "/resources/SMME%20Engagement%20Tool/Bz376PxTgi-Post-Application%20Cheat%20Sheet.pdf"
            },
            "subViewRelated": true,
            "specifyAnswer": false
          }
        ]
      }
    ]
    const wpThreeOnePostResponse = [
      {
        "title": "Did you know how to navigate the vendor portal in order to submit your application?",
        "subtitle": "",
        "surveyKey": "wp-three-one-post-response",
        "reportingKey": "questionOne",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Were the instructions on the vendor/procurement portal easy to follow?",
        "subtitle": "",
        "surveyKey": "wp-three-one-post-response",
        "reportingKey": "questionTwo",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "When applying to the mines, were your supporting documents easy to upload?",
        "subtitle": "",
        "surveyKey": "wp-three-one-post-response",
        "reportingKey": "questionThree",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Was the application process user friendly?",
        "subtitle": "",
        "surveyKey": "wp-three-one-post-response",
        "reportingKey": "questionFour",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "What is your preferred method to receive the outcome of your application?",
        "subtitle": "",
        "surveyKey": "wp-three-one-post-response",
        "reportingKey": "questionFive",
        "answerId": "",
        "type": "multi-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Cellphone call",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "SMS",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Email",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Business telephone call",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Through the vendor portal",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "A letter received in the mail",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Do you know some of the common reasons that applications are rejected?",
        "subtitle": "",
        "surveyKey": "wp-three-one-post-response",
        "reportingKey": "questionSix",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": "link",
            "link": {
              "title": "Please click on this link to access resources that can help you:",
              "name": "FAQ's Post-Response",
              "url": "/resources/SMME%20Engagement%20Tool/p4Tne9qPCI-FAQ's%20Post-Response.pdf"
            },
            "subViewRelated": true,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Were you able to amend your application during the application process?",
        "subtitle": "",
        "surveyKey": "wp-three-one-post-response",
        "reportingKey": "questionSeven",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "How can the mines make the administrative processes easier?",
        "subtitle": "",
        "surveyKey": "wp-three-one-pre",
        "reportingKey": "questionEight",
        "answerId": "",
        "type": "open-text",
        "maxAnswerCount": null,
        "isLocked": true
      }
    ]

    // Community Needs Assessment Tool
    const wpThreeTwo = [
      {
        "title": "Which town/community do you currently live in?",
        "subtitle": "Please provide the place name and/or location",
        "surveyKey": "wp-three-two",
        "reportingKey": "questionOne",
        "answerId": "",
        "type": "dropdown",
        "maxAnswerCount": null,
        "isLocked": true,
        "autoAnswers": "area"
      },
      {
        "title": "Which town/area do you currently work in?",
        "subtitle": "Please provide the place name and/or location",
        "surveyKey": "wp-three-two",
        "reportingKey": "questionTwo",
        "answerId": "",
        "type": "dropdown",
        "maxAnswerCount": null,
        "isLocked": true,
        "autoAnswers": "area"
      },
      {
        "title": "What type of mine is in your community?",
        "subtitle": "",
        "surveyKey": "wp-three-two",
        "reportingKey": "questionThree",
        "answerId": "",
        "type": "multi-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Gold",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Platinum Group Metals (PGM)",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Coal",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Iron",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "None of the above",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Which age bracket do you fall into?",
        "subtitle": "",
        "surveyKey": "wp-three-two",
        "reportingKey": "questionFour",
        "answerId": "",
        "type": "dropdown",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "1-15",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "15-25",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "25-35",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "35-45",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "45-55",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "55-65",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "65 or older",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "What is your gender?",
        "subtitle": "",
        "surveyKey": "wp-three-two",
        "reportingKey": "questionFive",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Female",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Male",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Prefer not to say",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "What is your highest level of education?",
        "subtitle": "",
        "surveyKey": "wp-three-two",
        "reportingKey": "questionSix",
        "answerId": "",
        "type": "dropdown",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "No formal schooling",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Primary School",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "High School",
            "description": "High School (Gr.8 – Gr. 11)",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Matric",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "TVET diploma",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "College diploma",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "University degree/Post graduate studies",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Are you a SMME/business owner?",
        "subtitle": "",
        "surveyKey": "wp-three-two",
        "reportingKey": "questionSeven",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": "questions",
            "subViewRelated": false,
            "specifyAnswer": false,
            "questions": [
              {
                "title": "What services do you provide?",
                "subtitle": "Choose as many as applicable",
                "surveyKey": "wp-three-two",
                "reportingKey": "SMMEQuestionEight",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Automotive",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Agriculture, Regenerative agriculture, agro-processing and re-forestry",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Construction and building",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Creative and Design Industry",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Engineering",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Healthcare",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Mining and minerals",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Mine rehabilitation",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Mine waste beneficiation",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "e-Waste",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Renewable energy",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Small/light manufacturing",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Services and retail trade",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Textiles",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Tourism and hospitality",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Oil and gas",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Recycling or Upcycling",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Waste management",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Catering",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Retail",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "None",
                    "description": "None of the above",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Are you a service provider to the mine?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "SMMEQuestionNine",
                "answerId": "",
                "type": "single-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Yes",
                    "description": "",
                    "subView": "questions",
                    "subViewRelated": true,
                    "specifyAnswer": false,
                    "questions": [
                      {
                        "title": "How long have you been supplying the mine?",
                        "subtitle": "",
                        "surveyKey": "wp-three-two",
                        "reportingKey": "SMMEQuestionNine-One",
                        "answerId": "",
                        "type": "multi-select",
                        "maxAnswerCount": null,
                        "isLocked": true,
                        "answers": [
                          {
                            "title": "A few months",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "6 months - 1 year",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "More than 1 year",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Over 5 years",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "title": "No",
                    "description": "",
                    "subView": "questions",
                    "subViewRelated": true,
                    "specifyAnswer": false,
                    "questions": [
                      {
                        "title": "Would you like to supply the mine?",
                        "subtitle": "",
                        "surveyKey": "wp-three-two",
                        "reportingKey": "SMMEQuestionNine-One",
                        "answerId": "",
                        "type": "single-select",
                        "maxAnswerCount": null,
                        "isLocked": true,
                        "answers": [
                          {
                            "title": "Yes",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "No",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                "title": "What stage would you describe your business at present?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "SMMEQuestionTen",
                "answerId": "",
                "type": "dropdown",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Ideating (A form of idea or concept you are having)",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Concepting (Mapping out the idea on paper)",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Committing (Carrying out the idea)",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Validating (Providing the accuracy of the idea)",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Scaling (Initiating growth in a company)",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Establishing/Maturity (Level off from rapid growth period)",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "How much revenue would do you earn annually?",
                "subtitle": "Provide estimates",
                "surveyKey": "wp-three-two",
                "reportingKey": "SMMEQuestionEleven",
                "answerId": "",
                "type": "dropdown",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Less than R100,000",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "R100,000-R1M",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "R1M-R10M",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "R10M-R50M",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Over R50M",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Can you easily access loan and finances to operate your business?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "SMMEQuestionTwelve",
                "answerId": "",
                "type": "single-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Yes",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "No",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Have you applied for any funding/loans?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "SMMEQuestionThirteen",
                "answerId": "",
                "type": "single-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Yes",
                    "description": "",
                    "subView": "questions",
                    "subViewRelated": true,
                    "specifyAnswer": false,
                    "questions": [
                      {
                        "title": "Were you successful in obtaining the loan or grant?",
                        "subtitle": "",
                        "surveyKey": "wp-three-two",
                        "reportingKey": "SMMEQuestionThirteen-One",
                        "answerId": "",
                        "type": "single-select",
                        "maxAnswerCount": null,
                        "isLocked": true,
                        "answers": [
                          {
                            "title": "Yes",
                            "description": "",
                            "subView": "questions",
                            "subViewRelated": true,
                            "specifyAnswer": false,
                            "questions": [
                              {
                                "title": "What were you able to do with the funding support?",
                                "subtitle": "",
                                "surveyKey": "wp-three-two",
                                "reportingKey": "SMMEQuestionThirteen-One-One",
                                "answerId": "",
                                "type": "dropdown",
                                "maxAnswerCount": null,
                                "isLocked": true,
                                "answers": [
                                  {
                                    "title": "Hire more people",
                                    "description": "",
                                    "subView": null,
                                    "subViewRelated": false,
                                    "specifyAnswer": false
                                  },
                                  {
                                    "title": "Expand the business",
                                    "description": "",
                                    "subView": null,
                                    "subViewRelated": false,
                                    "specifyAnswer": false
                                  },
                                  {
                                    "title": "Grow a new service offering or product line",
                                    "description": "",
                                    "subView": null,
                                    "subViewRelated": false,
                                    "specifyAnswer": false
                                  },
                                  {
                                    "title": "Purchase new equipment or hire additional equipment",
                                    "description": "",
                                    "subView": null,
                                    "subViewRelated": false,
                                    "specifyAnswer": false
                                  },
                                  {
                                    "title": "Hire new business premises",
                                    "description": "",
                                    "subView": null,
                                    "subViewRelated": false,
                                    "specifyAnswer": false
                                  },
                                  {
                                    "title": "Purchase new business premises",
                                    "description": "",
                                    "subView": null,
                                    "subViewRelated": false,
                                    "specifyAnswer": false
                                  },
                                  {
                                    "title": "None of the above",
                                    "description": "",
                                    "subView": null,
                                    "subViewRelated": false,
                                    "specifyAnswer": false
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            "title": "No",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "title": "No",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Have you participated in any initiatives for assistance from the following organisation to grow your business?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "SMMEQuestionFourteen",
                "answerId": "",
                "type": "dropdown",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "National Government",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Local Government",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Municipality",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Mine",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "NGOs",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "CBOs",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Forums",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Unions",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Local Businesses/SMMEs/Industrialists",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "None of the above",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Which of the following skills is most needed for future economies of local communities?",
                "subtitle": "Choose as many as applicable",
                "surveyKey": "wp-three-two",
                "reportingKey": "SMMEQuestionFifteen",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Language proficiency",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Numeracy and literacy",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Job readiness skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Digital literacy skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Technical training",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Business skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Coaching and mentorship",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Ethical Business Practice",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Entrepreneurship and Innovation",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Business management",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Leadership skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Black Industrialists Scheme : Grants, Benefits and Incentives",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Adult Based Education & Training",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Communication Skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "None",
                    "description": "None of the above",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Does your business offer the following opportunities to the community?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "SMMEQuestionSixteen",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Learnerships",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Internships",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Bursaries",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "None",
                    "description": "None of the above",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Have you participated in any training in any of the following industries?",
                "subtitle": "Choose as many as applicable",
                "surveyKey": "wp-three-two",
                "reportingKey": "SMMEQuestionSeventeen",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Mine waste beneficiation",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "e-Waste",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Recycling or Upcycling",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Agriculture, regenerative agriculture, agro-processing and re-forestry",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Renewable energy",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Small/light manufacturing",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Tourism",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Mine rehabilitation",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "None",
                    "description": "None of the above",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Choose the top three (3) skills according to how important they are for SMMEs",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "SMMEQuestionEighteen",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": 3,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Finance",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Business planning",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Marketing",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Registration of business",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Tenders",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Vendor registration",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Health and safety",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Digital literacy",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Ethical business practice",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Business management",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Do you use any natural assets to provide your services?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "SMMEQuestionNineteen",
                "answerId": "",
                "type": "single-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Yes",
                    "description": "",
                    "subView": "questions",
                    "subViewRelated": true,
                    "specifyAnswer": false,
                    "questions": [
                      {
                        "title": "Which of the following natural assets assist you in operating your business?",
                        "subtitle": "",
                        "surveyKey": "wp-three-two",
                        "reportingKey": "SMMEQuestionNineteen-One",
                        "answerId": "",
                        "type": "multi-select",
                        "maxAnswerCount": null,
                        "isLocked": true,
                        "answers": [
                          {
                            "title": "Rivers/Streams/Ground water",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Land",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Mine Waste Dump",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "None",
                            "description": "None of the above",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "title": "No",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Are you aware of any of such business networks, cooperatives and forums etc.?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "SMMEQuestionTwenty",
                "answerId": "",
                "type": "single-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Yes",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "No",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Do you have other businesses that you partner/work with?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "SMMEQuestionTwentyOne",
                "answerId": "",
                "type": "single-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Yes",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "No",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Are you part of any business networks, cooperatives and/or forums?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "SMMEQuestionTwentyTwo",
                "answerId": "",
                "type": "single-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Yes",
                    "description": "",
                    "subView": "questions",
                    "subViewRelated": true,
                    "specifyAnswer": false,
                    "questions": [
                      {
                        "title": "Which of the following natural assets assist you in operating your business?",
                        "subtitle": "",
                        "surveyKey": "wp-three-two",
                        "reportingKey": "SMMEQuestionTwentyTwo-One",
                        "answerId": "",
                        "type": "multi-select",
                        "maxAnswerCount": null,
                        "isLocked": true,
                        "answers": [
                          {
                            "title": "Business Network",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Local Business Forum",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Local Business Cooperatives",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Not sure",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "None",
                            "description": "None of the above",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "title": "No",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Is your business equipped to offer on the job training for skills in the any of the following?",
                "subtitle": "Choose as many as applicable",
                "surveyKey": "wp-three-two",
                "reportingKey": "SMMEQuestionTwentyThree",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Gardening",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Carpentry",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Construction",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Ceiling and Lighting",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Recycling",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Mine Tailings Management",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Catering",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Retail Trade",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Accommodation",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Industrial Engineering",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "None",
                    "description": "None of the above",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Do you operate out of your own premises?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "SMMEQuestionTwentyFour",
                "answerId": "",
                "type": "single-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Yes",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "No",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Do you have connectivity° on your premises?",
                "subtitle": "°Wi-Fi, mobile/telephone network",
                "surveyKey": "wp-three-two",
                "reportingKey": "SMMEQuestionTwentyFive",
                "answerId": "",
                "type": "single-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Yes",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "No",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Do you have running water and electricity on your operation premises?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "SMMEQuestionTwentySix",
                "answerId": "",
                "type": "single-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Yes",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "No",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Is security an issue for your premises and the operation of your business?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "SMMEQuestionTwentySeven",
                "answerId": "",
                "type": "single-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Yes",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "No",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Does your business have any initiatives in place to empower marginalised groups in the community?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "SMMEQuestionTwentyEight",
                "answerId": "",
                "type": "single-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Yes",
                    "description": "",
                    "subView": "questions",
                    "subViewRelated": true,
                    "specifyAnswer": false,
                    "questions": [
                      {
                        "title": "What are these initiatives?",
                        "subtitle": "",
                        "surveyKey": "wp-three-two",
                        "reportingKey": "SMMEQuestionTwentyEight-One",
                        "answerId": "",
                        "type": "open-text",
                        "maxAnswerCount": null,
                        "isLocked": true
                      }
                    ]
                  },
                  {
                    "title": "No",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Do you have information on the other needs in the community that you operate in?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "SMMEQuestionTwentyNine",
                "answerId": "",
                "type": "single-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Yes",
                    "description": "",
                    "subView": "questions",
                    "subViewRelated": true,
                    "specifyAnswer": false,
                    "questions": [
                      {
                        "title": "What is this information?",
                        "subtitle": "",
                        "surveyKey": "wp-three-two",
                        "reportingKey": "SMMEQuestionTwentyNine-One",
                        "answerId": "",
                        "type": "open-text",
                        "maxAnswerCount": null,
                        "isLocked": true
                      }
                    ]
                  },
                  {
                    "title": "No",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Don't know",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Are you aware of any local initiatives, businesses, or groups that are meeting needs in the community?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "SMMEQuestionThirty",
                "answerId": "",
                "type": "single-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Yes",
                    "description": "",
                    "subView": "questions",
                    "subViewRelated": true,
                    "specifyAnswer": false,
                    "questions": [
                      {
                        "title": "What are these initiatives, businesses or groups?",
                        "subtitle": "",
                        "surveyKey": "wp-three-two",
                        "reportingKey": "SMMEQuestionThirty-One",
                        "answerId": "",
                        "type": "open-text",
                        "maxAnswerCount": null,
                        "isLocked": true
                      },
                      {
                        "title": "What needs are they meeting and how?",
                        "subtitle": "",
                        "surveyKey": "wp-three-two",
                        "reportingKey": "SMMEQuestionThirty-Two",
                        "answerId": "",
                        "type": "open-text",
                        "maxAnswerCount": null,
                        "isLocked": true
                      }
                    ]
                  },
                  {
                    "title": "No",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Don't know",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Please tick one of the following that best explains your awareness of the Black Industrialist Scheme (BIS)",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "SMMEQuestionThirtyOne",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "I am not aware of the Black Industrialist Scheme (BIS)",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "I am aware of the Black Industrialist Scheme but have not applied for it",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "I applied for the Black Industrialist Scheme (BIS) and my application was unsuccessful",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "I applied for the Black industrialist Scheme (BIS) and my application was successful",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Would assistance or partnerships with any of the following organisations assist your business to grow to support the local economy post mining?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "SMMEQuestionThirtyTwo",
                "answerId": "",
                "type": "dropdown",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "National Government",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Local Government",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Municipality",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Mine",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "NGOs",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "CBOs",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Forums",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Unions",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Local Businesses/SMMEs/Industrialists",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "None of the above",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Are there initiatives, programs or businesses that assist with meeting community needs?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "SMMEQuestionThirtyThree",
                "answerId": "",
                "type": "single-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Yes",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "No",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Unsure/Don't know",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Do any of these assets exist within your community?",
                "subtitle": "Please choose the top 5 that have the potential for scale-up and further economic benefit",
                "surveyKey": "wp-three-two",
                "reportingKey": "SMMEQuestionThirtyFour",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": 5,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Health facilities",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Community Hall",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Primary and Secondary Schools",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Police Station",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Tuckshops/Spaza Shops",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Transport stations",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Sports and recreational facilities",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Solid waste disposal and recycling depot",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Post office",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Agriculture/farming/gardening",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "None",
                    "description": "None of the above",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              }
            ]
          },
          {
            "title": "No",
            "description": "",
            "subView": "questions",
            "subViewRelated": false,
            "specifyAnswer": false,
            "questions": [
              {
                "title": "Are you employed?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "communityQuestionEight",
                "answerId": "",
                "type": "single-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Yes",
                    "description": "",
                    "subView": "questions",
                    "subViewRelated": true,
                    "specifyAnswer": false,
                    "questions": [
                      {
                        "title": "What is your employment status?",
                        "subtitle": "",
                        "surveyKey": "wp-three-two",
                        "reportingKey": "communityQuestionEight-One",
                        "answerId": "",
                        "type": "dropdown",
                        "maxAnswerCount": null,
                        "isLocked": true,
                        "answers": [
                          {
                            "title": "Formal sector-Full-time",
                            "description": "Formal sector - Full-time",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Formal sector-Part-time",
                            "description": "Formal sector - Part-time",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Formal sector-Seasonal",
                            "description": "Formal sector - Seasonal",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Informal sector-Full-time",
                            "description": "Informal sector - Full-time",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Informal sector-Part-time",
                            "description": "Informal sector - Part-time",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Informal sector-Seasonal",
                            "description": "Informal sector - Seasonal",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          }
                        ]
                      },
                      {
                        "title": "Do you work for the mine?",
                        "subtitle": "",
                        "surveyKey": "wp-three-two",
                        "reportingKey": "communityQuestionEight-Two",
                        "answerId": "",
                        "type": "single-select",
                        "maxAnswerCount": null,
                        "isLocked": true,
                        "answers": [
                          {
                            "title": "Yes",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "No",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "title": "No",
                    "description": "",
                    "subView": "questions",
                    "subViewRelated": true,
                    "specifyAnswer": false,
                    "questions": [
                      {
                        "title": "What is your source of income?",
                        "subtitle": "",
                        "surveyKey": "wp-three-two",
                        "reportingKey": "communityQuestionEight-One",
                        "answerId": "",
                        "type": "dropdown",
                        "maxAnswerCount": null,
                        "isLocked": true,
                        "answers": [
                          {
                            "title": "Family",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Friends",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Government (Local or national)",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Local Business/Initiative",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Social grants",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Own my own business",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "None of the above",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          }
                        ]
                      },
                      {
                        "title": "Are you looking for a job?",
                        "subtitle": "",
                        "surveyKey": "wp-three-two",
                        "reportingKey": "communityQuestionEight-Two",
                        "answerId": "",
                        "type": "single-select",
                        "maxAnswerCount": null,
                        "isLocked": true,
                        "answers": [
                          {
                            "title": "Yes",
                            "description": "",
                            "subView": "questions",
                            "subViewRelated": true,
                            "specifyAnswer": false,
                            "questions": [
                              {
                                "title": "Select which organisations have assisted you in gaining access to a job",
                                "subtitle": "",
                                "surveyKey": "wp-three-two",
                                "reportingKey": "communityQuestionEight-Two-One",
                                "answerId": "",
                                "type": "dropdown",
                                "maxAnswerCount": null,
                                "isLocked": true,
                                "answers": [
                                  {
                                    "title": "National Government",
                                    "description": "",
                                    "subView": null,
                                    "subViewRelated": false,
                                    "specifyAnswer": false
                                  },
                                  {
                                    "title": "Local Government",
                                    "description": "",
                                    "subView": null,
                                    "subViewRelated": false,
                                    "specifyAnswer": false
                                  },
                                  {
                                    "title": "Municipality",
                                    "description": "",
                                    "subView": null,
                                    "subViewRelated": false,
                                    "specifyAnswer": false
                                  },
                                  {
                                    "title": "Mine",
                                    "description": "",
                                    "subView": null,
                                    "subViewRelated": false,
                                    "specifyAnswer": false
                                  },
                                  {
                                    "title": "NGOs",
                                    "description": "",
                                    "subView": null,
                                    "subViewRelated": false,
                                    "specifyAnswer": false
                                  },
                                  {
                                    "title": "CBOs",
                                    "description": "",
                                    "subView": null,
                                    "subViewRelated": false,
                                    "specifyAnswer": false
                                  },
                                  {
                                    "title": "Forums",
                                    "description": "",
                                    "subView": null,
                                    "subViewRelated": false,
                                    "specifyAnswer": false
                                  },
                                  {
                                    "title": "Unions",
                                    "description": "",
                                    "subView": null,
                                    "subViewRelated": false,
                                    "specifyAnswer": false
                                  },
                                  {
                                    "title": "Local Businesses/SMMEs/Industrialists",
                                    "description": "",
                                    "subView": null,
                                    "subViewRelated": false,
                                    "specifyAnswer": false
                                  },
                                  {
                                    "title": "None",
                                    "description": "",
                                    "subView": null,
                                    "subViewRelated": false,
                                    "specifyAnswer": false
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            "title": "No",
                            "description": "",
                            "subView": "questions",
                            "subViewRelated": true,
                            "specifyAnswer": false,
                            "questions": [
                              {
                                "title": "Please provide a reason",
                                "subtitle": "",
                                "surveyKey": "wp-three-two",
                                "reportingKey": "communityQuestionEight-Two-One",
                                "answerId": "",
                                "type": "open-text",
                                "maxAnswerCount": null,
                                "isLocked": true
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                "title": "How often do you have engagements with mines on the needs of your community?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "communityQuestionNine",
                "answerId": "",
                "type": "dropdown",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Annually",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Bi-annually",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Quarterly",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Monthly",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "On going as needed",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "No engagements/Unaware of engagements",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Unsure",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Are there schools in the community you live in?",
                "subtitle": "Within a walking distance of 5-10 Kms",
                "surveyKey": "wp-three-two",
                "reportingKey": "communityQuestionTen",
                "answerId": "",
                "type": "single-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Yes",
                    "description": "",
                    "subView": "questions",
                    "subViewRelated": true,
                    "specifyAnswer": false,
                    "questions": [
                      {
                        "title": "Which of the following are present?",
                        "subtitle": "Within a walking distance of 5-10 Kms",
                        "surveyKey": "wp-three-two",
                        "reportingKey": "communityQuestionTen-One",
                        "answerId": "",
                        "type": "multi-select",
                        "maxAnswerCount": null,
                        "isLocked": true,
                        "answers": [
                          {
                            "title": "Creche",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Primary school",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Secondary school",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Tertiary - TVET Colleges, Colleges, etc.",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Community Training Centre",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "title": "No",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "How would you rate the living conditions in your community?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "communityQuestionEleven",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Inadequate",
                    "description": "Inadequate (My living conditions are unsafe and unhealthy)",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Adequate",
                    "description": "Adequate (My living conditions need improvement)",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Good",
                    "description": "Good (I have safe and healthy living conditions)",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Excellent",
                    "description": "Excellent (My living conditions contribute to my well-being)",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "How would you rate the level of security in your community?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "communityQuestionTwelve",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Inadequate",
                    "description": "Inadequate (unsafe)",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Adequate",
                    "description": "Adequate",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Good",
                    "description": "Good (safe)",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Excellent",
                    "description": "Excellent (contributes to my well-being)",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Which of the following issues are affecting the community's growth for the post-mine future?",
                "subtitle": "Choose as many as applicable",
                "surveyKey": "wp-three-two",
                "reportingKey": "communityQuestionThirteen",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Lack of funding for community initiatives",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Lack of access to health",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Lack of employment opportunities",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Social and gender marginalisation",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Lack of education",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Lack of skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Lack of infrastructure",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "None",
                    "description": "None of the above",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Please select all the items that you believe your community needs",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "communityQuestionFourteen",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Education",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Skills improvement",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Health care/hospital or clinics/medicine",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Access to jobs",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Finances to start a business",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Transportation around the community",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Security around the community",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Access to technology",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Ecosystem services/natural resources",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "None",
                    "description": "None of the above",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Do you have access to water?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "communityQuestionFifteen",
                "answerId": "",
                "type": "single-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Yes",
                    "description": "",
                    "subView": "questions",
                    "subViewRelated": true,
                    "specifyAnswer": false,
                    "questions": [
                      {
                        "title": "Where do get your water?",
                        "subtitle": "i.e. Water Source",
                        "surveyKey": "wp-three-two",
                        "reportingKey": "communityQuestionFifteen-One",
                        "answerId": "",
                        "type": "multi-select",
                        "maxAnswerCount": null,
                        "isLocked": true,
                        "answers": [
                          {
                            "title": "River/Stream",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Dam",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Tap water in household",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Piped water at community stand",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "None",
                            "description": "None of the above",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          }
                        ]
                      },
                      {
                        "title": "How would you describe your water supply/access?",
                        "subtitle": "i.e. Water Quality",
                        "surveyKey": "wp-three-two",
                        "reportingKey": "communityQuestionFifteen-Two",
                        "answerId": "",
                        "type": "multi-select",
                        "maxAnswerCount": null,
                        "isLocked": true,
                        "answers": [
                          {
                            "title": "Inadequate",
                            "description": "Inadequate (unsafe and irregular water supply, access is communal piped water or from water tankers)",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Adequate",
                            "description": "Adequate (clean enough water for domestic use, access from communal piped water source or water tankers)",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Satisfactory",
                            "description": "Satisfactory (safe potable water access but could be improved, access is from municipal source with piped water into dwelling, erratic supply)",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Good",
                            "description": "Good (adequate water access for household needs, access is from municipal source with piped water into dwelling, regular supply)",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Excellent",
                            "description": "Excellent (contributes to my well-being)",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "title": "No",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Do you have access to food?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "communityQuestionSixteen",
                "answerId": "",
                "type": "single-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Yes",
                    "description": "",
                    "subView": "questions",
                    "subViewRelated": true,
                    "specifyAnswer": false,
                    "questions": [
                      {
                        "title": "How would you describe your access to food?",
                        "subtitle": "",
                        "surveyKey": "wp-three-two",
                        "reportingKey": "communityQuestionSixteen-One",
                        "answerId": "",
                        "type": "multi-select",
                        "maxAnswerCount": null,
                        "isLocked": true,
                        "answers": [
                          {
                            "title": "Inadequate",
                            "description": "Inadequate (I sometimes have to go days without food)",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Adequate",
                            "description": "Adequate (I am able to eat at least once a day)",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Good",
                            "description": "Good (adequate water access for household needs, access is from municipal source with piped water into dwelling, regular supply)",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Excellent",
                            "description": "Excellent (contributes to my well-being)",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "title": "No",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "How would you describe your access to shelter/housing?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "communityQuestionSeventeen",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Inadequate",
                    "description": "Inadequate (I do not have a shelter, transient)",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Adequate",
                    "description": "Adequate (I have shelter when I really need it)",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Satisfactory",
                    "description": "Satisfactory (I have a safe shelter to rest)",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Good",
                    "description": "Good (I am not worried about shelter or housing as I have a safe shelter)",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Excellent",
                    "description": "Excellent (I have safe and clean housing which is well cared for)",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "How would you describe your access to health care?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "communityQuestionEighteen",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Inadequate",
                    "description": "Inadequate (I do not have access to health care)",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Adequate",
                    "description": "Adequate (I have access to health care in case of emergencies)",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Satisfactory",
                    "description": "Satisfactory (I have access to healthcare whenever I need it)",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Good",
                    "description": "Good (I have access to regular health check ups and good quality health care)",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Excellent",
                    "description": "Excellent (I always have access to good quality healthcare)",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Do any of these assets exist within your community?",
                "subtitle": "Choose as many as applicable",
                "surveyKey": "wp-three-two",
                "reportingKey": "communityQuestionNineteen",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Health facilities",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Community Hall",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Primary and Secondary Schools",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Police Station",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Tuckshops/Spaza Shops",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Retail shopping centre",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Transport stations",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Sports and recreational facilities",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Solid waste disposal and recycling depot",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Post office",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Agriculture/farming/gardening",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "None",
                    "description": "None of the above",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Are there initiatives, programs or businesses that assist with meeting community needs?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "communityQuestionTwenty",
                "answerId": "",
                "type": "single-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Yes",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "No",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Unsure/Don't know",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Are there any recreational activities/sites/initiatives that are in your community?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "communityQuestionTwentyOne",
                "answerId": "",
                "type": "single-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Yes",
                    "description": "",
                    "subView": "questions",
                    "subViewRelated": true,
                    "specifyAnswer": false,
                    "questions": [
                      {
                        "title": "What are these activities/initiatives?",
                        "subtitle": "",
                        "surveyKey": "wp-three-two",
                        "reportingKey": "communityQuestionTwentyOne-One",
                        "answerId": "",
                        "type": "open-text",
                        "maxAnswerCount": null,
                        "isLocked": true
                      }
                    ]
                  },
                  {
                    "title": "No",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Unsure/Don't know",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "What skills do you have that could be included in the local community economy?",
                "subtitle": "Choose as many as applicable",
                "surveyKey": "wp-three-two",
                "reportingKey": "communityQuestionTwentyTwo",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Agricultural",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Cleaning and Maintenance",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Security",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Trade and service",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Artisanal",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Engineering",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "None",
                    "description": "None of the above",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Would you start a business to sustain the economy post-mining if you were aware of any community needs?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "communityQuestionTwentyThree",
                "answerId": "",
                "type": "single-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Yes",
                    "description": "",
                    "subView": "questions",
                    "subViewRelated": true,
                    "specifyAnswer": false,
                    "questions": [
                      {
                        "title": "What would it be?",
                        "subtitle": "",
                        "surveyKey": "wp-three-two",
                        "reportingKey": "communityQuestionTwentyThree-One",
                        "answerId": "",
                        "type": "open-text",
                        "maxAnswerCount": null,
                        "isLocked": true
                      }
                    ]
                  },
                  {
                    "title": "No",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Unsure/Don't know",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Which of the following skills is most needed for future economies of local communities?",
                "subtitle": "Choose as many as applicable",
                "surveyKey": "wp-three-two",
                "reportingKey": "communityQuestionTwentyFour",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Language proficiency",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Numeracy and literacy",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Job readiness skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Digital literacy skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Technical training",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Business skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Coaching and mentorship",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Ethical Business Practice",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Entrepreneurship and Innovation",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Business management",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Leadership skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Black Industrialists Scheme : Grants, Benefits and Incentives",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Adult Based Education & Training",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Communication Skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "None",
                    "description": "None of the above",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Which of following opportunities would benefit the community?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "communityQuestionTwentyFive",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Learnerships",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Internships",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Bursaries",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "None",
                    "description": "None of the above",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "What do you think is required to make the community a better place for future generations?",
                "subtitle": "Choose as many as applicable",
                "surveyKey": "wp-three-two",
                "reportingKey": "communityQuestionTwentySix",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Clean air",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Healthy fertile soil",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Access to land",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Pollution free environment",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Functioning waste management system",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Water and sanitation",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "None",
                    "description": "None of the above",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "What standout initiatives, businesses and SMMEs do you think can be building blocks for the post mine future?",
                "subtitle": "",
                "surveyKey": "wp-three-two",
                "reportingKey": "communityQuestionTwentySeven",
                "answerId": "",
                "type": "open-text",
                "maxAnswerCount": null,
                "isLocked": true
              },
              {
                "title": "What sort of businesses do you want to see in the community after the closure of the mine?",
                "subtitle": "Choose as many as applicable",
                "surveyKey": "wp-three-two",
                "reportingKey": "communityQuestionTwentyEight",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Mine waste beneficiation",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "e-Waste",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Recycling or Upcycling",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Regenerative agriculture, agro-processing and re-forestry",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Renewable energy",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Small/light manufacturing",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Tourism",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Mine rehabilitation",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "None",
                    "description": "None of the above",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              }
            ]
          }
        ]
      }
    ]

    // Training Needs Assessment Survey Tool
    const wpTwoOne = [
      {
        "title": "Which town/community do you currently live in?",
        "subtitle": "Please provide the place name and/or location",
        "surveyKey": "wp-two-one",
        "reportingKey": "questionOne",
        "answerId": "",
        "type": "dropdown",
        "maxAnswerCount": null,
        "isLocked": true,
        "autoAnswers": "area"
      },
      {
        "title": "Which town/area do you currently work in?",
        "subtitle": "Please provide the place name and/or location",
        "surveyKey": "wp-two-one",
        "reportingKey": "questionTwo",
        "answerId": "",
        "type": "dropdown",
        "maxAnswerCount": null,
        "isLocked": true,
        "autoAnswers": "area"
      },
      {
        "title": "Which age bracket do you fall into?",
        "subtitle": "",
        "surveyKey": "wp-two-one",
        "reportingKey": "questionThree",
        "answerId": "",
        "type": "dropdown",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "15-25",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "25-35",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "35-45",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "45-55",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "55-65",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "65 or older",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "What is your gender?",
        "subtitle": "",
        "surveyKey": "wp-two-one",
        "reportingKey": "questionFour",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Female",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Male",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Prefer not to say",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Do you have access to an internet connection?",
        "subtitle": "",
        "surveyKey": "wp-two-one",
        "reportingKey": "questionFive",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": "questions",
            "subViewRelated": true,
            "specifyAnswer": false,
            "questions": [
              {
                "title": "Where do you have internet access?",
                "surveyKey": "wp-two-one",
                "reportingKey": "questionFive-One",
                "answerId": "",
                "type": "dropdown",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Home",
                    "description": "Home (mobile phone/data)",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Work",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Community Centre/Hall",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Training Centre",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Library",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Religious facility",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "School",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "None of the above",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              }
            ]
          },
          {
            "title": "No",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "What is your highest level of education?",
        "subtitle": "",
        "surveyKey": "wp-two-one",
        "reportingKey": "questionSix",
        "answerId": "",
        "type": "dropdown",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "No Formal Schooling",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "NQF Level 1",
            "description": "NQF Level 1: Grade 9, ABET Level 4, or GET certificate (Primary School)",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "NQF Levels 2-4",
            "description": "NQF Levels 2-4: Grade 10 to 12 or equivalents (High School)",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "NQF Level 5",
            "description": "NQF Level 5: National Certificate (Matric)",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "NQF Level 6",
            "description": "NQF Level 6: Higher certificate (TVET/College)",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "NQF Level 7",
            "description": "NQF Level 7: Diploma & bachelor's degree (Diploma and Degrees)",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "NQF Level 8",
            "description": "NQF Level 8: Honours degree & professional certificates (Post Graduate)",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "NQF Level 9",
            "description": "NQF Level 9: Master's degree (Post Graduate)",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "NQF Level 10",
            "description": "Doctorate & post-doctoral qualifications (Post Graduate)",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Have you participated in any skills-related training?",
        "subtitle": "",
        "surveyKey": "wp-two-one",
        "reportingKey": "questionSeven",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": "questions",
            "subViewRelated": true,
            "specifyAnswer": false,
            "questions": [
              {
                "title": "What type of training did you participate in/receive skills in?",
                "subtitle": "Choose up to five (5)",
                "surveyKey": "wp-two-one",
                "reportingKey": "questionSeven-One",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": 5,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Job readiness skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Digital literacy skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Basic IT knowledge skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Computer software skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Technological/Technical training",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Coaching and mentorship",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Entrepreneurship and Innovation",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Business Management",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Internships",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Learnerships",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Adult Based Education and Training",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Communication skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Agricultural skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Financial skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Administrative skill",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Vocational skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Community Education and Training",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Waste management skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Land management skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Biodiversity management skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Decision-making skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Leadership skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Safety and risk management",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Safety compliance",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Machine operations",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Mine beneficiation",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Project management",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Interpersonal skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Problem-solving skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Writing skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Analytical skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Management skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Heavy equipment operation skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Maritime skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Future mining skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Supervisory development skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Entrepreneurial skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Networking skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Customer services",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Organisational skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Cultural awareness skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Language skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Site-management skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Interpretational skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Have you participated in any skills-related training in any of the following industries?",
                "subtitle": "Choose up to five (5)",
                "surveyKey": "wp-two-one",
                "reportingKey": "questionSeven-Two",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": 5,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Automotive",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Agriculture, regenerative agriculture, agro-processing and re-forestry",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Construction and building",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Creative and Design Industry",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Engineering",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Healthcare",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Mining and minerals",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Mine rehabilitation",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Mine waste beneficiation",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "e-Waste",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Renewable energy",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Small/light manufacturing",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Services and retail trade",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Textiles",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Tourism and hospitality (accomodation and catering)",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Oil and gas",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Recycling or Upcycling",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Waste management",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Catering",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Retail",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }, 
                  {
                    "title": "None of the above",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": true
                  }
                ]
              },
              {
                "title": "Which organisation provided the training you participated in?",
                "subtitle": "Choose up to two (2)",
                "surveyKey": "wp-two-one",
                "reportingKey": "questionSeven-Three",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": 2,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Business chamber",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Capacity building institution",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Educational institutions",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "NGO/NPO",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Mining company programme",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "None of the above",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "How have you used the training that you have received?",
                "subtitle": "",
                "surveyKey": "wp-two-one",
                "reportingKey": "questionSeven-Four",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Started a business",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Received full-time employment",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Received part time employment",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Provided services to the community",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Assisted/trained others",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "None of the above",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              }
            ]
          },
          {
            "title": "No",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "What style/process of learning do you prefer to learn through?",
        "subtitle": "Choose up to three (3)",
        "surveyKey": "wp-two-one",
        "reportingKey": "questionEight",
        "answerId": "",
        "imageUrl": "/resources/SMME%20Engagement%20Tool/2.1question8.jpeg",
        "type": "multi-select",
        "maxAnswerCount": 3,
        "isLocked": true,
        "answers": [
          {
            "title": "Visual learning (Watching)",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Auditory learning (Listening)",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Tactile/Kinesthetic learning (Learn material through touch)",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Sequential learning (learn step by step)",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Simultaneous learning (categorizing, mindmapping, looking at bigger picture)",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Verbal learning (Thinking aloud)",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Interactive learning (learning with others)",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Reflective/Logical learning (thinking/reflecting on information)",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Direct experience (learning through life experiences)",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Indirect experience (learn better through demonstrations)",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Rhythmic Melodic learning (learn better with rhythm and beats/music)",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "None of the above",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "What method of learning do you prefer to learn through?",
        "subtitle": "Choose up to three (3)",
        "surveyKey": "wp-two-one",
        "reportingKey": "questionNine",
        "answerId": "",
        "imageUrl": "/resources/SMME%20Engagement%20Tool/2.1question9.png",
        "type": "multi-select",
        "maxAnswerCount": 3,
        "isLocked": true,
        "answers": [
          {
            "title": "Collaboration (Learn with others)",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Discussion (Talk about and share ideas)",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Feedback reflection (Learn about my learning)",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Guided (Learn with an expert)",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Explicit (Learn from an expert)",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Demonstration (Present my learning)",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Experiential (Make, explore and investigate)",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Independent (Learn by myself)",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Unsure",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "None of the above",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "How would you rate your computer literacy level?",
        "subtitle": "",
        "surveyKey": "wp-two-one",
        "reportingKey": "questionTen",
        "answerId": "",
        "type": "multi-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Inadequate",
            "description": "Inadequate (I don't know much about working on a computer)",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Adequate",
            "description": "Adequate (I know how to do basic work on a computer)",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Good",
            "description": "Good (I am comfortable working on a computer)",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Excellent",
            "description": "Excellent (I am confident working on a computer)",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Choose the top three (3) portable/transferable skills according to skills that you are most interested in",
        "subtitle": "",
        "surveyKey": "wp-two-one",
        "reportingKey": "questionEleven",
        "answerId": "",
        "type": "multi-select",
        "maxAnswerCount": 3,
        "isLocked": true,
        "answers": [
          {
            "title": "Language proficiency",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Numeracy and literacy",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Job readiness skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Technological/Technical training",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Digital literacy",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Digital strategy skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Decision-making",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Communication skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Leadership skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Project management skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Interpersonal skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Problem-solving skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Writing skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Analytical skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Administrative skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Financial skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Management skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Business management skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Entrepreneurial skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Coaching and mentorship",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Networking skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Organisational skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Cultural awareness skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Computer literacy",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Computer software skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Electronic/computer (IT)",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Administrative/Clerical",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Which of the following skills are needed for local communities the most?",
        "subtitle": "Choose up to five (5)",
        "surveyKey": "wp-two-one",
        "reportingKey": "questionTwelve",
        "answerId": "",
        "type": "multi-select",
        "maxAnswerCount": 5,
        "isLocked": true,
        "answers": [
          {
            "title": "Language proficiency",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Numeracy and literacy",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Job readiness skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Technological/Technical training",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Digital literacy",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Digital strategy skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Decision-making",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Communication skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Leadership skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Project management skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Interpersonal skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Problem-solving skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Writing skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Analytical skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Administrative skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Financial skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Management skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Business management skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Entrepreneurial skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Coaching and mentorship",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Networking skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Organisational skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Cultural awareness skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Computer literacy",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Computer software skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Electronic/computer (IT)",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Administrative/Clerical",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "None of the above",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "What type of mine operates within or close to your community?",
        "subtitle": "",
        "surveyKey": "wp-two-one",
        "reportingKey": "questionThirteen",
        "answerId": "",
        "type": "multi-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Gold",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Platinum",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Multi-commodity",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Coal",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "None of the above",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Which of the following alternative economy sectors do you have the skills required to operate in?",
        "subtitle": "",
        "surveyKey": "wp-two-one",
        "reportingKey": "questionFourteen",
        "answerId": "",
        "type": "multi-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Mine waste beneficiation",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "e-Waste",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Recycling or Upcycling",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Regenerative agriculture, agro-processing and re-forestry",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Renewable energy",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Small/light manufacturing",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Tourism",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Mine rehabilitation",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "None",
            "description": "None of the above",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Choose the top three (3) industries in which you are interested in, outside of core mining operations",
        "subtitle": "",
        "surveyKey": "wp-two-one",
        "reportingKey": "questionFifteen",
        "answerId": "",
        "type": "multi-select",
        "maxAnswerCount": 3,
        "isLocked": true,
        "answers": [
          {
            "title": "Mine waste beneficiation",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "e-Waste",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Recycling or Upcycling",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Regenerative agriculture, agro-processing and re-forestry",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Renewable energy",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Small/light manufacturing",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Tourism and cultural attractions",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Mine rehabilitation",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Information and Communication Technology",
            "description": "ICT (Information and Communication Technology)",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "None of the above",
            "description": "None of the above",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Do you feel there are livelihood opportunities° in the area for you as a community member?",
        "subtitle": "°Opportunities for employment, starting a business, venturing into new industries, etc.",
        "surveyKey": "wp-two-one",
        "reportingKey": "questionSixteen",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": "questions",
            "subViewRelated": true,
            "specifyAnswer": false,
            "questions": [
              {
                "title": "How have these opportunities helped you?",
                "subtitle": "",
                "surveyKey": "wp-two-one",
                "reportingKey": "questionSixteen-One",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Started a business",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Received full-time employment",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Received part time employment",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Provided services to the community",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Venturing into new industries",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "None of the above",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              }
            ]
          },
          {
            "title": "No",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Not sure",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Are you a SMME/business owner?",
        "subtitle": "",
        "surveyKey": "wp-two-one",
        "reportingKey": "questionSeventeen",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": "questions",
            "subViewRelated": true,
            "specifyAnswer": false,
            "questions": [
              {
                "title": "How many employees do you currently have?",
                "subtitle": "",
                "surveyKey": "wp-two-one",
                "reportingKey": "questionSeventeenOne",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "No employees",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Less than 10",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Between 10-20",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Between 20-30",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Greater than 30",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "What type of services does your business offer?",
                "subtitle": "Choose up to five (5)",
                "surveyKey": "wp-three-one-pre",
                "reportingKey": "questionFive",
                "answerId": "",
                "type": "dropdown",
                "maxAnswerCount": 5,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Automotive",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Agriculture, regenerative agriculture, agro-processing and re-forestry",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Construction and building",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Creative and Design Industry",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Engineering",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Healthcare",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Mining and minerals",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Mine rehabilitation",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Mine waste beneficiation",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "e-Waste",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Renewable energy",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Small/light manufacturing",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Services and retail trade",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Textiles",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Tourism and hospitality",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Oil and gas",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Recycling or Upcycling",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Waste management",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Catering",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Retail",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "None of the above",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": true
                  }
                ]
              },
              {
                "title": "Are you a contractor of the mine?",
                "subtitle": "",
                "surveyKey": "wp-two-one",
                "reportingKey": "questionSeventeen-Three",
                "answerId": "",
                "type": "single-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Yes",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "No",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Choose the top three (3) skills according to how important they are for SMMEs",
                "subtitle": "",
                "surveyKey": "wp-two-one",
                "reportingKey": "questionSeventeen-Four",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": 3,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Finance",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Business planning",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Marketing",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Registration of business",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Tenders",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Vendor registration",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Health and safety",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Language proficiency",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Numeracy and literacy",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Job readiness skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Technological/Technical skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Digital literacy",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Digital strategy skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Decision-making",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Communication skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Leadership skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Project management skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Interpersonal skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Problem-solving skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Writing skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Analytical skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Administrative skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Financial skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Management skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Business management skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Entrepreneurial skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Coaching and mentorship",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Networking skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Organisational skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Cultural awareness skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Computer literacy",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Computer software skills",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Electronic/computer (IT)",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Administrative/Clerical",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Have you participated in training° that is related to your business?",
                "subtitle": "°That assist/improve how you provide your services",
                "surveyKey": "wp-two-one",
                "reportingKey": "questionSeventeen-Five",
                "answerId": "",
                "type": "single-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Yes",
                    "description": "",
                    "subView": "questions",
                    "subViewRelated": true,
                    "specifyAnswer": false,
                    "questions": [
                      {
                        "title": "Who provided the training?",
                        "subtitle": "",
                        "surveyKey": "wp-two-one",
                        "reportingKey": "questionSeventeen-Five-One",
                        "answerId": "",
                        "type": "multi-select",
                        "maxAnswerCount": null,
                        "isLocked": true,
                        "answers": [
                          {
                            "title": "Business chamber",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Capacity building institution",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "NGO/NPO",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Mining company programme",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "None of the above",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          }
                        ]
                      },
                      {
                        "title": "What type of training did you participate in?",
                        "subtitle": "Choose up to five (5)",
                        "surveyKey": "wp-two-one",
                        "reportingKey": "questionSeventeen-Five-Two",
                        "answerId": "",
                        "type": "multi-select",
                        "maxAnswerCount": 5,
                        "isLocked": true,
                        "answers": [
                          {
                            "title": "Finance",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Business planning",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Marketing",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Registration of business",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Tenders",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Vendor registration",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Health and safety",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Language proficiency",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Numeracy and literacy",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Job readiness skills",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Technological/Technical skills",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Digital literacy",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Digital strategy skills",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Decision-making",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Communication skills",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Leadership skills",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Project management skills",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Interpersonal skills",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Problem-solving skills",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Writing skills",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Analytical skills",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Administrative skills",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Financial skills",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Management skills",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Business management skills",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Entrepreneurial skills",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Coaching and mentorship",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Networking skills",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Organisational skills",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Cultural awareness skills",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Computer literacy",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Computer software skills",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Electronic/computer (IT)",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Administrative/Clerical",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "None of the above",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          }
                        ]
                      },
                      {
                        "title": "After receiving training, which bracket does your business fall in?",
                        "subtitle": "",
                        "surveyKey": "wp-two-one",
                        "reportingKey": "questionSeventeen-Five-Three",
                        "answerId": "",
                        "type": "multi-select",
                        "maxAnswerCount": null,
                        "isLocked": true,
                        "answers": [
                          {
                            "title": "Turnover between R0 - R500K",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Turnover between R500K - R1M",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Turnover between R1M - R10M",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Turnover between R10M - R50M",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Turnover greater than R50M",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Not Sure",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          }
                        ]
                      },
                      {
                        "title": "Select the opportunities that you have been able to access post training",
                        "subtitle": "",
                        "surveyKey": "wp-two-one",
                        "reportingKey": "questionSeventeen-Five-Four",
                        "answerId": "",
                        "type": "multi-select",
                        "maxAnswerCount": 3,
                        "isLocked": true,
                        "answers": [
                          {
                            "title": "I was able to submit a vendor application successfully",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "I was able to better comply with health and safety requirements",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "I was able to secure funding",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "I was able to provide goods/services in a new industry",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "I was able to expand my business",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "None of the above",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "title": "No",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Not sure",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "As an SMME, are you currently participating in any support schemes/initiatives from a mining company?",
                "subtitle": "",
                "surveyKey": "wp-two-one",
                "reportingKey": "questionSeventeenSix",
                "answerId": "",
                "type": "single-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Yes",
                    "description": "",
                    "subView": "questions",
                    "subViewRelated": true,
                    "specifyAnswer": false,
                    "questions": [
                      {
                        "title": "What type of support does the scheme/initiative provide?",
                        "subtitle": "Choose up to five (5)",
                        "surveyKey": "wp-two-one",
                        "reportingKey": "questionSeventeen-Six-One",
                        "answerId": "",
                        "type": "multi-select",
                        "maxAnswerCount": 5,
                        "isLocked": true,
                        "answers": [
                          {
                            "title": "Finance",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Business planning",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Marketing",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Registration of business",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Tenders",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Vendor registration",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Skills in latest technology",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Business Management",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Ethical business practice",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Digital literacy",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "Health and safety",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          },
                          {
                            "title": "None of the above",
                            "description": "",
                            "subView": null,
                            "subViewRelated": false,
                            "specifyAnswer": false
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "title": "No",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Not sure",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Have you participated in any training that has assisted you in accessing tender opportunities?",
                "subtitle": "",
                "surveyKey": "wp-two-one",
                "reportingKey": "questionSeventeenSeven",
                "answerId": "",
                "type": "single-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Yes",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "No",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Not sure",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Have you participated in vendor-related training?",
                "subtitle": "",
                "surveyKey": "wp-two-one",
                "reportingKey": "questionSeventeenEight",
                "answerId": "",
                "type": "single-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Yes",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "No",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Not sure",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Have you participated in training related to the health and safety requirements of mining companies?",
                "subtitle": "",
                "surveyKey": "wp-two-one",
                "reportingKey": "questionSeventeenNine",
                "answerId": "",
                "type": "single-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Yes",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "No",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Not sure",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              }
            ]
          },
          {
            "title": "No",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Are you an employee of the mine?",
        "subtitle": "",
        "surveyKey": "wp-two-one",
        "reportingKey": "questionEighteen",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": "questions",
            "subViewRelated": true,
            "specifyAnswer": false,
            "questions": [
              {
                "title": "Which skills are not necessary in the modernisation of the mine?",
                "subtitle": "The modernisation of mines involves using innovation to make mining operations safer, healthier, and more productive and sustainable through technological advancement",
                "surveyKey": "wp-two-one",
                "reportingKey": "questionEighteen-One",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answer": [
                  {
                    "title": "Digital literacy",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Mining refinery",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Technical equipment",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Safety and risk management",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Skills in operating heavy equipment",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Mineral prospecting",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Mineral development",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Mineral exploration",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "AR and VR (Augmented Reality and Virtual Reality)",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "None of the above",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              }
            ]
          },
          {
            "title": "No",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Choose the top three (3) soft skills according to which you would like to receive training in?",
        "subtitle": "",
        "surveyKey": "wp-two-one",
        "reportingKey": "questionNineteen",
        "answerId": "",
        "type": "multi-select",
        "maxAnswerCount": 3,
        "isLocked": true,
        "answers": [
          {
            "title": "Teamwork",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Problem-solving",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Time management",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Critical thinking",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Stress management",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Adaptability",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Finance",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Business planning",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Marketing",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Registration of business",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Tenders",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Vendor registration",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Health and safety",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Language proficiency",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Numeracy and literacy",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Job readiness skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Technological/Technical skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Digital literacy",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Digital strategy skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Decision-making",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Communication skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Leadership skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Project management skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Interpersonal skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Problem-solving skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Writing skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Analytical skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Administrative skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Financial skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Management skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Business management skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Entrepreneurial skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Coaching and mentorship",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Networking skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Organisational skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Cultural awareness skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Computer literacy",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Computer software skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Electronic/computer (IT)",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Administrative/Clerical",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Do you feel that there are opportunities for you as the mine modernises?",
        "subtitle": "",
        "surveyKey": "wp-two-one",
        "reportingKey": "questionTwenty",
        "answerId": "",
        "type": "single-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Yes",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "No",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Not sure",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "If the mine were to close, what technical skills would you consider most important for you to access other job opportunities?",
        "subtitle": "Choose up to five (5)",
        "surveyKey": "wp-two-one",
        "reportingKey": "questionTwentyOne",
        "answerId": "",
        "type": "multi-select",
        "maxAnswerCount": 5,
        "isLocked": true,
        "answers": [
          {
            "title": "Job readiness skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Digital literacy skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Technical training",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Business acumen",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Coaching and mentorship",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Ethical Business Practice",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Entrepreneurship and Innovation",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Business management",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Internships",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Learnerships",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Artisans skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Adult Based Education and Training",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Communication Skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Computer software skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Site management skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Customer service skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Future mining skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Biodiversity management skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Land management skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Water management skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Maritime skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Agricultural skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Project management skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Mine beneficiation",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Safety and risk management",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Waste management",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "None of the above",
            "description": "None of the above",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "If the mine were to close, what skills would you consider most important for you to start your own business?",
        "subtitle": "Choose up to five (5)",
        "surveyKey": "wp-two-one",
        "reportingKey": "questionTwentyTwo",
        "answerId": "",
        "type": "multi-select",
        "maxAnswerCount": 5,
        "isLocked": true,
        "answers": [
          {
            "title": "Finance skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Future mining skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Business Management and entrepreneurial skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Skills in latest technologies",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Professional skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Business acumen skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Digital literacy skills",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "None of the above",
            "description": "None of the above",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      }
    ]

    const wpTwoTwo = [
      {
        "title": "Which age bracket do you fall into?",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionOne",
        "answerId": "",
        "type": "dropdown",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "20-29",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "30-39",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "40-49",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "50-59",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "60-69",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "70-70",
            "description": "70 or older",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Which option generally describes your current job function?",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionTwo",
        "answerId": "",
        "type": "multi-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Operator",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Supervisor",
            "description": "",
            "subView": "questions",
            "subViewRelated": false,
            "specifyAnswer": false,
            "questions": [
              {
                "title": "How confident are you in the creation of Word Documents?",
                "subtitle": "",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionTwentyNine",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Hesitant",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Unconfident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Neutral",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Confident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Very Confident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "How confident are you in the creation of Digital Presentations?",
                "subtitle": "E.g. PowerPoint Presentation",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionThirty",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Hesitant",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Unconfident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Neutral",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Confident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Very Confident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "How confident are you when working with databases and spreadsheets?",
                "subtitle": "E.g. Access and Excel",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionThirtyOne",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Hesitant",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Unconfident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Neutral",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Confident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Very Confident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "How confident are you in setting up a Wi-Fi Network?",
                "subtitle": "",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionThirtyTwo",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Hesitant",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Unconfident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Neutral",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Confident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Very Confident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "How confident are you in using a Search Engine?",
                "subtitle": "E.g. Google",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionThirtyThree",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Hesitant",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Unconfident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Neutral",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Confident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Very Confident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "How confident are you in using digital communication",
                "subtitle": "E.g. via email correspondence",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionThirtyFour",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Hesitant",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Unconfident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Neutral",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Confident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Very Confident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "How proactively do you find and collect information from the internet to apply to your job role?",
                "subtitle": "(without instruction from superviors)",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionThirtyFive",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Never",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Rarely",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Occasionally",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Frequently",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Very Frequently",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Rate your interest in finding and applying new technologies and software to your job",
                "subtitle": "",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionThirtySix",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Very Low",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Low",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Neutral",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "High",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Very High",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "How do you respond to change within your organisation?",
                "subtitle": "Select the hypothetical response that most closely aligns with your response",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionThirtySeven",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "2 - I'm not sure what to do",
                    "description": `"I'm not sure what to do"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "1 - It's fine the way it is",
                    "description": `"It's fine the way it is"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "2 - No one is considering how this will impact me",
                    "description": `"No one is considering how this will impact me"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "1 - Haven't we tried this before and it didn't work",
                    "description": `"Haven't we tried this before and it didn't work"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "4 - I'm fine with it - but other people are not",
                    "description": `"I'm fine with it - but other people are not"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "0 - We don't have time for this",
                    "description": `"We don't have time for this"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "0 - This won't be permanent",
                    "description": `"This won't be permanent"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "5 - I'm willing to adapt",
                    "description": `"I'm willing to adapt"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "0 - No comment",
                    "description": `"No comment"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "0 - None of the above",
                    "description": `"None of the above"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              }
            ]
          },
          {
            "title": "Manager",
            "description": "",
            "subView": "questions",
            "subViewRelated": false,
            "specifyAnswer": false,
            "questions": [
              {
                "title": "How confident are you in the creation of Word Documents?",
                "subtitle": "",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionTwentyNine",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Hesitant",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Unconfident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Neutral",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Confident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Very Confident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "How confident are you in the creation of Digital Presentations?",
                "subtitle": "E.g. PowerPoint Presentation",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionThirty",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Hesitant",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Unconfident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Neutral",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Confident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Very Confident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "How confident are you when working with databases and spreadsheets?",
                "subtitle": "E.g. Access and Excel",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionThirtyOne",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Hesitant",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Unconfident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Neutral",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Confident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Very Confident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "How confident are you in setting up a Wi-Fi Network?",
                "subtitle": "",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionThirtyTwo",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Hesitant",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Unconfident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Neutral",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Confident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Very Confident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "How confident are you in using a Search Engine?",
                "subtitle": "E.g. Google",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionThirtyThree",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Hesitant",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Unconfident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Neutral",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Confident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Very Confident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "How confident are you in using digital communication",
                "subtitle": "E.g. via email correspondence",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionThirtyFour",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Hesitant",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Unconfident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Neutral",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Confident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Very Confident",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "How proactively do you find and collect information from the internet to apply to your job role?",
                "subtitle": "(without instruction from superviors)",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionThirtyFive",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Never",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Rarely",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Occasionally",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Frequently",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Very Frequently",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Rate your interest in finding and applying new technologies and software to your job",
                "subtitle": "",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionThirtySix",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Very Low",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Low",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Neutral",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "High",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Very High",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "How do you respond to change within your organisation?",
                "subtitle": "Select the hypothetical response that most closely aligns with your response",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionThirtySeven",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "2 - I'm not sure what to do",
                    "description": `"I'm not sure what to do"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "1 - It's fine the way it is",
                    "description": `"It's fine the way it is"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "2 - No one is considering how this will impact me",
                    "description": `"No one is considering how this will impact me"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "1 - Haven't we tried this before and it didn't work",
                    "description": `"Haven't we tried this before and it didn't work"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "4 - I'm fine with it - but other people are not",
                    "description": `"I'm fine with it - but other people are not"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "0 - We don't have time for this",
                    "description": `"We don't have time for this"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "0 - This won't be permanent",
                    "description": `"This won't be permanent"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "5 - I'm willing to adapt",
                    "description": `"I'm willing to adapt"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "0 - No comment",
                    "description": `"No comment"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "0 - None of the above",
                    "description": `"None of the above"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Rate your level of understanding of the impact of digital transformation within your organisation",
                "subtitle": "",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionThirtyEight",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Very Low",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Low",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Neutral",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "High",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Very High",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "I am capable of sound judgement through analysis of digital and non-digital information",
                "subtitle": "",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionThirtyNine",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Strongly Disagree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Disagree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Neutral",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Agree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Strongly Agree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "How often do you solve problems using the digital assets at your disposal?",
                "subtitle": "",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionForty",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Never",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Bi-monthly",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Monthly",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Weekly",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Daily",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "I use digital information to monitor new developments in my industry",
                "subtitle": "",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionFortyOne",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Strongly Disagree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Disagree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Neutral",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Agree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Strongly Agree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "I am aware of the security risks involved with the use of digital assets",
                "subtitle": "",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionFortyTwo",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Strongly Disagree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Disagree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Neutral",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Agree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Strongly Agree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "How often do you use digital assets° for innovation within your job role?",
                "subtitle": "°E.g. Microsoft Teams, Zoom, Microsoft Office Suit, Spreadsheet Software",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionFortyThree",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Never",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Bi-monthly",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Monthly",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Weekly",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Daily",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "How often do you set targets for your team with monitoring and evaluating metrics using digital assets?",
                "subtitle": "",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionFortyFour",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Never",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Bi-monthly",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Monthly",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Weekly",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Daily",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "I understand my organisation's business model",
                "subtitle": "",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionFortyFive",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Strongly Disagree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Disagree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Neutral",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Agree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Strongly Agree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "I am aware of the strategic direction, objectives, and Key Performance Indictors (KPIs) of the organisation",
                "subtitle": "",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionFortySix",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Strongly Disagree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Disagree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Neutral",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Agree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Strongly Agree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "How often do you collaborate using a digital asset?",
                "subtitle": "E.g. Microsoft Teams, Zoom, Microsoft Office Suit, Spreadsheet Software",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionFortySeven",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Never",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Bi-monthly",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Monthly",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Weekly",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Daily",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "How often do you identify talent in the workforce and encourage personal development?",
                "subtitle": "",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionFortyEight",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Never",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Bi-monthly",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Monthly",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Weekly",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Daily",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Rate your ability to act-on/implement/execute on the strategic intent of the organisation",
                "subtitle": "",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionFortyNine",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Very Low",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Low",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Neutral",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "High",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Very High",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "Rate your ability to influence others through digital channels",
                "subtitle": "",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionFifty",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Very Low",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Low",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Neutral",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "High",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Very High",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "I am a mentor/coach to others for the adoption and use of digital assets",
                "subtitle": "",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionFiftyOne",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Strongly Disagree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Disagree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Neutral",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Agree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Strongly Agree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "I have an understanding of some of the measures that need to put in place to ensure that digital transformation is encouraged in my company",
                "subtitle": "",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionFiftyTwo",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Strongly Disagree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Disagree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Neutral",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Agree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Strongly Agree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "How often do you use digital tools to reach consensus, find alignment, or promote decision making?",
                "subtitle": "",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionFiftyThree",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Never",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Bi-monthly",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Monthly",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Weekly",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Daily",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "How often do you encourage the use of digital assets within your organisation?",
                "subtitle": "",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionFiftyFour",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Never",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Bi-monthly",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Monthly",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Weekly",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Daily",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "I am curious about alternative digital assets that can improve my ability to lead",
                "subtitle": "",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionFiftyFive",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Strongly Disagree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Disagree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Neutral",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Agree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Strongly Agree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "I consider myself as someone who has the desire to constantly be right",
                "subtitle": "",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionFiftySix",
                "answerId": "",
                "type": "number-rating",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "Strongly Disagree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Disagree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Neutral",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Agree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "Strongly Agree",
                    "description": "",
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              },
              {
                "title": "What do you think about pivotting from legacy technology that cannot meet the current needs of your organisation?",
                "subtitle": "Select the hypothetical response that most closely aligns with your response",
                "surveyKey": "wp-two-two",
                "reportingKey": "questionFiftySeven",
                "answerId": "",
                "type": "multi-select",
                "maxAnswerCount": null,
                "isLocked": true,
                "answers": [
                  {
                    "title": "2 - I'm not sure what to do",
                    "description": `"I'm not sure what to do"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "1 - It's fine the way it is",
                    "description": `"It's fine the way it is"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "2 - No one is considering how this will impact me",
                    "description": `"No one is considering how this will impact me"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "1 - Haven't we tried this before and it didn't work",
                    "description": `"Haven't we tried this before and it didn't work"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "4 - I'm fine with it - but other people are not",
                    "description": `"I'm fine with it - but other people are not"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "0 - We don't have time for this",
                    "description": `"We don't have time for this"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "0 - This won't be permanent",
                    "description": `"This won't be permanent"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "5 - I'm willing to adapt",
                    "description": `"I'm willing to adapt"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "0 - No comment",
                    "description": `"No comment"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  },
                  {
                    "title": "0 - None of the above",
                    "description": `"None of the above"`,
                    "subView": null,
                    "subViewRelated": false,
                    "specifyAnswer": false
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "title": "How long have you been employed within that role?",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionThree",
        "answerId": "",
        "type": "multi-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Less than 1 year",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "1 - 3 years",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "3 - 5 years",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "5 - 8 years",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "8 - 10 years",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "More than 10 years",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Please select which type of mine you believe you work in",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionFour",
        "answerId": "",
        "type": "multi-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Traditional (not very modern)",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Hybrid (mixture of modern technology)",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Modern (highly integrated with modern technology)",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "What is your highest level of education?",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionFive",
        "answerId": "",
        "type": "dropdown",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Primary School",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "High School",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Technical College",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Vocational Training",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Online Short Courses",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "University",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "None of the above",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Rate your level of comfort using a cellphone",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionSix-One",
        "answerId": "",
        "type": "number-rating",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Very Low",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Low",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Neutral",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "High",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Very High",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Rate your level of comfort using a desktop computer or laptop",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionSix-Two",
        "answerId": "",
        "type": "number-rating",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Very Low",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Low",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Neutral",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "High",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Very High",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Rate your level of comfort using a touchscreen device (e.g. tablet)",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionSix-Three",
        "answerId": "",
        "type": "number-rating",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Very Low",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Low",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Neutral",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "High",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Very High",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Rate your ability to type on a cellphone",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionSeven-One",
        "answerId": "",
        "type": "number-rating",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Very Low",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Low",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Neutral",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "High",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Very High",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Rate your ability to type on a desktop computer/laptop",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionSeven-Two",
        "answerId": "",
        "type": "number-rating",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Very Low",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Low",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Neutral",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "High",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Very High",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Rate your ability to type on a touchscreen device (e.g. tablet)",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionSeven-Three",
        "answerId": "",
        "type": "number-rating",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Very Low",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Low",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Neutral",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "High",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Very High",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "How often do you use a cellphone for learning purposes?",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionEight-One",
        "answerId": "",
        "type": "number-rating",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Never",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Bi-monthly",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Monthly",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Weekly",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Daily",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "How often do you use a desktop computer or laptop for learning purposes?",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionEight-Two",
        "answerId": "",
        "type": "number-rating",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Never",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Bi-monthly",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Monthly",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Weekly",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Daily",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "How often do you use a tablet for learning purposes?",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionEight-Three",
        "answerId": "",
        "type": "number-rating",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Never",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Bi-monthly",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Monthly",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Weekly",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Daily",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Which of the following is a digital literacy skill?",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionNine",
        "answerId": "",
        "type": "multi-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "1-correct",
            "description": "Being able to find sources of electronic information",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "2-incorrect",
            "description": "Being able to take electronic photographs",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "3-incorrect",
            "description": "Being able to find paper-based information",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "What is the fraudulent attempt to acquire sensitive information such as passwords and credit card details in an electronic communication?",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionTen",
        "answerId": "",
        "type": "multi-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "1-correct",
            "description": "Streaming",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "2-incorrect",
            "description": "Crowdsourcing",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "3-incorrect",
            "description": "Phishing",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Which emotion do you feel when you think about changing how you perform your job?",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionEleven",
        "answerId": "",
        "type": "multi-select",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "0 - Anger",
            "description": "Anger",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "3 - Anticipation",
            "description": "Anticipation",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "5 - Joy",
            "description": "Joy",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "4 - Trust",
            "description": "Trust",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "0 - Fear",
            "description": "Fear",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "2 - Surprise",
            "description": "Surprise",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "1 - Sadness",
            "description": "Sadness",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "0 - Disgust",
            "description": "Disgust",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "0 - No comment",
            "description": "Prefer not to say",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "0 - None of the above",
            "description": "None of the above",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "How often do you use Microsoft°?",
        "subtitle": "°Word, Excel, PowerPoint etc.",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionTwelve",
        "answerId": "",
        "type": "number-rating",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Never",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Bi-monthly",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Monthly",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Weekly",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Daily",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "How often do you use email?",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionThirteen",
        "answerId": "",
        "type": "number-rating",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Never",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Bi-monthly",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Monthly",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Weekly",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Daily",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "How often do you access the Internet?",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionFourteen",
        "answerId": "",
        "type": "number-rating",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Never",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Bi-monthly",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Monthly",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Weekly",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Daily",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "How often do you use Spreadsheet Software°?",
        "subtitle": "°For data organisation",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionFifteen",
        "answerId": "",
        "type": "number-rating",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Never",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Bi-monthly",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Monthly",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Weekly",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Daily",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "How often do you use learning software?",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionSixteen",
        "answerId": "",
        "type": "number-rating",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Never",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Bi-monthly",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Monthly",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Weekly",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Daily",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "How often do you use video conferencing software?",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionSeventeen",
        "answerId": "",
        "type": "number-rating",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Never",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Bi-monthly",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Monthly",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Weekly",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Daily",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "How many hours a day do you spend using a digital device°?",
        "subtitle": "°Smartphone, desktop computer, laptop, tablet etc.",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionEighteen",
        "answerId": "",
        "type": "number-rating",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Never",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "0 - 1 hour",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "1 - 5 hours",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "5 - 10 hours",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "10+ hours",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "How many hours a day do you check or link your schedule to an online calendar?",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionNineteen",
        "answerId": "",
        "type": "number-rating",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Never",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "0 - 1 hour",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "1 - 5 hours",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "5 - 10 hours",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "10+ hours",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "How many hours a day do you spend learning how to use the digital device/s that you personally own or have possession of?",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionTwenty",
        "answerId": "",
        "type": "number-rating",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Never",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "0 - 1 hour",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "1 - 5 hours",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "5 - 10 hours",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "10+ hours",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Rate your willingness to use digital assets to perform activities",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionTwentyOne",
        "answerId": "",
        "type": "number-rating",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Very Low",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Low",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Neutral",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "High",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Very High",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Rate your ability to use web and mobile applications",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionTwentyTwo",
        "answerId": "",
        "type": "number-rating",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Very Low",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Low",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Neutral",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "High",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Very High",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Rate your ability to use online platforms° to communicate with others",
        "subtitle": "°Facebook, WhatsApp, Instagram, Telegram, WeChat, TikTok etc.",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionTwentyThree",
        "answerId": "",
        "type": "number-rating",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Very Low",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Low",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Neutral",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "High",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Very High",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Rate your ability to use the internet to obtain information",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionTwentyFour",
        "answerId": "",
        "type": "number-rating",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Very Low",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Low",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Neutral",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "High",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Very High",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Rate your ability to use specialised computing software° for your job activities",
        "subtitle": "°Microsoft Teams, Adobe Acrobat Reader, Microsoft Office Suite etc.",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionTwentyFive",
        "answerId": "",
        "type": "number-rating",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Very Low",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Low",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Neutral",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "High",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Very High",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Rate your ability to understand, interpret, analyse data obtained through digital assets°",
        "subtitle": "°Microsoft Teams, Zoom, Microsoft Office Suite, Spreadsheet Software etc.",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionTwentySix",
        "answerId": "",
        "type": "number-rating",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Very Low",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Low",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Neutral",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "High",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Very High",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "I am trusted by others whilst performing my job function",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionTwentySeven",
        "answerId": "",
        "type": "number-rating",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Strongly Disagree",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Disagree",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Neutral",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Agree",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Strongly Agree",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "Others rely on me to get the job done right",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionTwentySeven-One",
        "answerId": "",
        "type": "number-rating",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Strongly Disagree",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Disagree",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Neutral",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Agree",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Strongly Agree",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "I often provide support when others struggle performing a task",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionTwentySeven-Two",
        "answerId": "",
        "type": "number-rating",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Strongly Disagree",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Disagree",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Neutral",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Agree",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Strongly Agree",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      },
      {
        "title": "I have the will to take responsibility for my actions",
        "subtitle": "",
        "surveyKey": "wp-two-two",
        "reportingKey": "questionTwentyEight",
        "answerId": "",
        "type": "number-rating",
        "maxAnswerCount": null,
        "isLocked": true,
        "answers": [
          {
            "title": "Strongly Disagree",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Disagree",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Neutral",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Agree",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          },
          {
            "title": "Strongly Agree",
            "description": "",
            "subView": null,
            "subViewRelated": false,
            "specifyAnswer": false
          }
        ]
      }
    ]

    await addQuestions(wpThreeOnePre)
    await addQuestions(wpThreeOnePost)
    await addQuestions(wpThreeOnePostResponse)
    await addQuestions(wpThreeTwo)
    await addQuestions(wpTwoOne)
    await addQuestions(wpTwoTwo)

    await batch.commit()

    res.send('Default questions successfully imported to your project')
    res.end()
  }
})

exports.importPackages = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET')
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    res.set('Access-Control-Max-Age', '3600')
    res.status(204).send('')
    res.end()
  } else {
    // Training Needs Assessment Survey Tool
    const wpTwoOne = {
      docId: 'ye0erjENgXMIgAMbsufs',
      name: 'Training Needs Assessment Survey Tool',
      scopes: ['home','survey','information'],
      survey: {
        title: 'Training Needs Assessment Survey Tool',
        key: 'wp-two-one',
        shortDescription: 'Welcome to the Training Needs Assessment Survey Tool',
        description: 'Thank you for taking the time to complete this assessment.&NewLine;&NewLine; The Training Needs Assessment Tool focuses on understanding the current and future training/skills needs of the community and SMMEs in mining communities.&NewLine;&NewLine; The assessment should take approximately 30 minutes to complete.&NewLine;&NewLine; Enjoy!',
        customAnswers: [
          {
            key: 'area',
            label: 'Area options',
            description: 'Type in the specific area/s (geographical location) that will reflect on the tool for the responder to select'
          }
        ]
      }
    }

    // Digital Leadership Competency Assessment Tool
    const wpTwoTwo = {
      docId: 'w8jONMPpUov16uTFJT4G',
      name: 'Digital Leadership Competency Assessment Tool',
      scopes: ['home','survey','information'],
      survey: {
        title: 'Digital Leadership Competency Assessment Tool',
        orderLocked: true,
        key: 'wp-two-two',
        shortDescription: 'Welcome to the Digital Leadership Competency Assessment Tool',
        description: 'Thank you for taking the time to complete this assessment.&NewLine;&NewLine; The focus of the digital leadership competency gap assessment illuminates how digitisation will have an impact on current versus future mining activities across the workforce. In doing so, the assessment acts as a mechanism to understand the current digital capabilities of the workforce vs. the future digital capabilities.&NewLine;&NewLine; The assessment should take approximately 30 minutes to complete.&NewLine;&NewLine; Enjoy!',
      }
    }

    // SMME Engagement Tool
    const wpThreeOne = {
      docId: 'ckCa1z7bexNKBI8Ufk0z',
      name: 'SMME Engagement Tool',
      scopes: ['home','survey','information','queries'],
      survey: {
        title: 'SMME Engagement Tool',
        key: 'wp-three-one',
        shortDescription: 'Welcome to the SMME Engagement Tool',
        surveys: [
          {
            color: '#2a3989',
            description: 'Use this checklist to make sure you are ready to apply for a procurement opportunity',
            faqUrl: `/resources/SMME%20Engagement%20Tool/zUgYHGVmd2-FAQ's Pre-Application.pdf`,
            key: 'wp-three-one-pre',
            title: 'Pre-Application Checklist',
          },
          {
            color: '#fcb31c',
            description: 'Use this checklist to help you find out what to do while you wait for a response to your application',
            faqUrl: `/resources/SMME%20Engagement%20Tool/FAQ's Post-Application.pdf`,
            key: 'wp-three-one-post',
            title: 'Post-Application Checklist',
          },
          {
            color: '#33825c',
            description: 'Let us know how your procurement experience went and what can be done to improve',
            faqUrl: `/resources/SMME%20Engagement%20Tool/p4Tne9qPCI-FAQ's Post-Response.pdf`,
            key: 'wp-three-one-post-response',
            title: 'Post-Response Checklist',
          }
        ]
      },
      extraInformation: '<p>This tool is made up of 4 sections namely:</p>             <ul>               <li>A Checklist section to help you at different stages of the procurement process. Within the checklist section, there are also a set of FAQs to answer general questions from SMMEs.</li>               <li>A Notice Board section where mines will post information to SMMEs.</li>               <li>A Resource Library that contains useful business development information.</li>               <li>A Query Submission section where you can submit questions to the mine related to procurement.</li>             </ul>             <p>The tool can be navigated by clicking on the section that you wish to access.</p>             <p>This tool is not a vendor portal where you submit applications but will help assist you in becoming compliant and accessing resources and opportunities.</p><p>Please note, external links contained in the supporting documents will not be maintained and actively updated and are there to serve as direction for the SMME</p>'
    }

    // Community Needs Assessment Survey Tool
    const wpThreeTwo = {
      docId: 'zM4Z6N9H82ks1xiNLKen',
      name: 'Community Needs Assessment Survey Tool',
      scopes: ['home','survey','information'],
      survey: {
        title: 'Community Needs Assessment Survey Tool',
        key: 'wp-three-two',
        shortDescription: 'Welcome to the Community Needs Assessment Survey Tool',
        description: 'Thank you for taking the time to complete this assessment.&NewLine;&NewLine; The Community Needs Assessment Survey Tool - focuses on obtaining local mining communities "real" needs, for support towards shared value creation.&NewLine;&NewLine; The assessment should take approximately 30 minutes to complete.&NewLine;&NewLine; Thank you!',
        customAnswers: [
          {
            key: 'area',
            label: 'Area options',
            description: 'Type in the specific area/s (geographical location) that will reflect on the tool for the responder to select'
          }
        ]
      }
    }

    await admin.firestore().collection('packages').doc('ye0erjENgXMIgAMbsufs').set(wpTwoOne);
    await admin.firestore().collection('packages').doc('w8jONMPpUov16uTFJT4G').set(wpTwoTwo);
    await admin.firestore().collection('packages').doc('ckCa1z7bexNKBI8Ufk0z').set(wpThreeOne);
    await admin.firestore().collection('packages').doc('zM4Z6N9H82ks1xiNLKen').set(wpThreeTwo);

    res.send('Default packages successfully imported to your project')
    res.end()
  }
})

exports.getDataFromFirestore = functions.https.onRequest(async (request, response) => {
  try {
    const firestore = admin.firestore();
    const responses = [];
    const questions = {};
    // Replace 'your_collection_name' with the actual Firestore collection you want to access

    const snapshot = await firestore.collectionGroup('responses').get();
    snapshot.forEach(async (doc) => {
      const data = doc.data()
      for (const key in data) {
        if (key.indexOf('question-') > -1) {
          if (!questions[data.surveyKey]) {
            questions[data.surveyKey] = {}
            const quesSnap = await firestore.collection('questions').where('surveyKey', '==', data.surveyKey).get();
            quesSnap.forEach((doc) => {
              questions[data.surveyKey]['question-'+doc.id] = doc.data().reportingKey
            })
          }
          if (questions[data.surveyKey][key]) {
            data[questions[data.surveyKey][key]] = data[key]
            delete data[key]
          }
        }
      }

      responses.push(data);
    });
 
    response.json(responses);
  } catch (error) {
    response.status(500).json({ error: 'Something went wrong!' });
  }
});


exports.getLocationsFromFirestore = functions.https.onRequest(async (request, response) => {
  try {

    const firestore = admin.firestore();

    const links = [];
    const linksSnapshot = await firestore.collectionGroup('links').get();
    linksSnapshot.forEach((doc) => {
      links.push(doc.data());
    }); 
    
    const locations = [];
    const snapshot = await firestore.collectionGroup('locations').get();
    snapshot.forEach((doc) => {
      locations.push({
        ...doc.data(),
        locationId: doc.id,
      });
    });


   const returnData = links.map(link => {
    return {
      linkId: link?.linkId,
      createdAt: link?.createdAt,
      locationDocId: link?.locationDocId,
      locationName: locations?.find(x => x.locationId === link.locationDocId).name ?? ''
    }
   }) 

    response.json(returnData);
  } catch (error) {
    response.status(500).json({ error: 'Something went wrong!' });
  }
});