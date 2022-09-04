const functions = require('firebase-functions')
const admin = require('firebase-admin')
const dayjs = require('dayjs')

admin.initializeApp()

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