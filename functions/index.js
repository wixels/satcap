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
        image: req.body.imageUrl,
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