import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-app.js'
import { getAnalytics, logEvent } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-analytics.js'
import { getFirestore, getDocs, query, collectionGroup, where } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js'
import { nanoid } from 'https://cdn.jsdelivr.net/npm/nanoid/nanoid.js'

const firebaseConfig = {
  apiKey: "AIzaSyAh2eCT0djKwvkvVbT_jMK7OuZcNX05jHQ",
  authDomain: "satcap-research.firebaseapp.com",
  projectId: "satcap-research",
  storageBucket: "satcap-research.appspot.com",
  messagingSenderId: "16504149634",
  appId: "1:16504149634:web:74802b5a7a9a6cf5d6469b",
  measurementId: "G-N3W0HEY5R1"
}

const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
const db = getFirestore(app)

const getLink = async function () {
  try {
    const params = new URLSearchParams(window.location.search)
    if (!params.has('linkId')) {
      throw new Error('no-link')
    }

    // const localLink = JSON.parse(window.localStorage.getItem('link'))
    // if (localLink && params.get('linkId') === localLink.linkId) {
    //   return localLink
    // }

    const linksSnapshot = await getDocs(query(collectionGroup(db, 'links'), where('linkId', '==', params.get('linkId')), where('deletedAt', '==', null)))
    if (!linksSnapshot.size) {
      throw new Error('linkDeletedOrNonExistant')
    }

    let userRef = window.localStorage.getItem('userRef')
    
    const dbLink = { mineDocId: linksSnapshot.docs[0].ref.parent.parent.id, docId: linksSnapshot.docs[0].id, ...linksSnapshot.docs[0].data() }
    
    if (!userRef) {
      userRef = nanoid()
      window.localStorage.setItem('userRef', userRef)
      logEvent(analytics, 'device_first_visit', { 
        user_ref: userRef,
        link_id: dbLink.linkId,
        package_id: dbLink.package.docId,
        time_stamp: dayjs().format('YYYY-MM-DD HH:mm:ssZ')
      })
    }

    window.localStorage.setItem('link', JSON.stringify(dbLink))
    
    return dbLink
  } catch (error) {
    location.href = `/error?code=${error.message}`
    return
  }
}

const initMenu = function (linkId, items) {
  if (items.length === 1 && items[0] === 'survey') {
    return
  }
  const ul = document.createElement('ul')
  items.forEach((item) => {
    const selected = (window.location.pathname.includes(item) || (item === 'home' && window.location.pathname === '/'))
    const href = (item === 'home') ? `/?linkId=${linkId}` : `/${item}?linkId=${linkId}`
    const li = document.createElement('li')
    const link = document.createElement('a')
    const icon = document.createElement('img')

    if (selected) li.classList.add('current')
    icon.setAttribute('alt', item)
    icon.setAttribute('src', `../_style/icons/${item}${(selected) ? '_selected' : ''}.svg`)
    link.setAttribute('href', href)
    link.appendChild(icon)
    li.appendChild(link)
    ul.appendChild(li)
  })
  document.querySelector('footer').appendChild(ul)
}

export { app, analytics, db, getLink, initMenu }
