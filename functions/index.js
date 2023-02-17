const functions = require('firebase-functions')
const admin = require('firebase-admin')
const dayjs = require('dayjs')
const generator = require('generate-password')

if (admin.apps.length === 0) {
  admin.initializeApp()
}

exports.createAuthentication = functions.firestore
  .document('mines/{mineId}/users/{userId}')
  .onCreate(async (snap, context) => {
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
        text: `Hi ${user.name}. Welcome to SATCAP Admin. Please sign in (https://admin-satcap-research.web.app) using the following password: ${password}`,
        html: `
          <div style="padding: 20px; background-color: rgb(247, 247, 247);border-radius:10px;max-width:640px;margin:0 auto;">
            <img src="https://satcap-research.web.app/_style/images/emailheader.jpg" style="width:100%;object-fit:cover;max-height:150px;border-radius:10px;"/>
            <h2 style="font-size: 2em;">Welcome ${user.name}</h2>
            <br>
            <p style="font-size: 1.2em;">You've just been added to the SATCAP Admin Platform; Happy to have you onboard!</p>
            <p style="font-size: 1.2em;">Your Password is:  <strong style="font-size: 1.3em;">${password}</strong></p>
            <br>
            <p style="font-size: 1.2em;">Click below to get started:</p>
            <a style="font-size: 1.2em;" href="https://admin-satcap-research.web.app">SATCAP Admin</a><br>
            <br/><br/><br/>
            <div style="text-align:center;width:100%;margin:0 auto;">
              <img src="https://satcap-research.web.app/_style/images/logo.png" style="width:30px;" alt="SATCAP Logo" />
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
      name: req.query.name || 'Enter your mine name here',
      description: 'Enter your mine description here',
      address: 'Enter your mine location here',
      packages: ['ye0erjENgXMIgAMbsufs', 'zM4Z6N9H82ks1xiNLKen', 'ckCa1z7bexNKBI8Ufk0z', 'w8jONMPpUov16uTFJT4G'],
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
    })

    res.send('Mine successfully added to your project')
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
            faqUrl: `https://firebasestorage.googleapis.com/v0/b/satcap-research.appspot.com/o/public%2FFAQ's%20Pre-Application.pdf?alt=media&token=d7b14be7-eb98-4727-a3b4-d8d1f5ffd34c`,
            key: 'wp-three-one-pre',
            title: 'Pre-Application Checklist',
          },
          {
            color: '#fcb31c',
            description: 'Use this checklist to help you find out what to do while you wait for a response to your application',
            faqUrl: `https://firebasestorage.googleapis.com/v0/b/satcap-research.appspot.com/o/public%2FFAQ's%20Post-Application.pdf?alt=media&token=35658549-9bd9-47f6-90fd-df542850f95a`,
            key: 'wp-three-one-post',
            title: 'Post-Application Checklist',
          },
          {
            color: '#33825c',
            description: 'Let us know how your procurement experience went and what can be done to improve',
            faqUrl: `https://firebasestorage.googleapis.com/v0/b/satcap-research.appspot.com/o/public%2FFAQ's%20Post-Response.pdf?alt=media&token=ca13b985-2401-4695-aae6-d1ee600e1d75`,
            key: 'wp-three-one-post-response',
            title: 'Post-Response Checklist',
          }
        ]
      },
      extraInformation: '<p>This tool is made up of 4 sections namely:</p>             <ul>               <li>A Checklist section to help you at different stages of the procurement process. Within the checklist section, there are also a set of FAQs to answer general questions from SMMEs.</li>               <li>A Notice Board section where mines will post information to SMMEs.</li>               <li>A Resource Library that contains useful business development information.</li>               <li>A Query Submission section where you can submit questions to the mine related to procurement.</li>             </ul>             <p>The tool can be navigated by clicking on the section that you wish to access.</p>             <p>This tool is not a vendor portal where you submit applications but will help assist you in becoming compliant and accessing resources and opportunities.</p>'
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
        description: 'Thank you for taking the time to complete this assessment.&NewLine;&NewLine; The Community social-needs assessment tool - focuses on obtaining local mining communities "real" needs, for support towards shared value creation.&NewLine;&NewLine; The assessment should take approximately 30 minutes to complete.&NewLine;&NewLine; Thank you!',
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