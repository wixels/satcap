import { collection, query, where, limit, orderBy, getDocs } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js'
import { db } from './init.js'

const setCard = function (item) {
  const template = document.getElementById('templateContent')
  const content = template.content.cloneNode(true)
  const card = content.querySelector('.card')
  const title = content.querySelector('h3')
  const link = content.querySelector('a')
  let ribbon

  if (item.date) {
    ribbon = document.createElement('div')
    ribbon.classList.add('ribbon')
    ribbon.textContent = dayjs(item.date).format('DD MMM, YYYY')
    card.insertBefore(ribbon, card.firstChild)
    card.classList.add('hasRibbon')
  }

  title.textContent = item.title

  const params = new URLSearchParams(location.search)
  params.set('docId', item.docId)
  params.set('type', item.type)
  link.setAttribute('href', '/information?'+params.toString())
  if (item.featureImageUrl) {
    const card = content.querySelector('.card')
    card.style.setProperty('--feature-image', `url('${item.featureImageUrl}')`)
  }
  return content
}

const setQuery = function (item) {
  return
}

const insertListContent = function (parent, data) {
  const list = document.querySelector(`.${parent} .list`)
  if (list) {
    if (data.length) {
      data.forEach(item => {
        list.appendChild(setCard(item))
      })
    } else {
      list.innerHTML = '<p class="empty">Nothing found...</p>'
    }
    
    document.querySelector(`.${parent}`).classList.remove('hidden')
  }
}

const insertQueryContent = function (parent, data) {
  const list = document.querySelector(`.${parent} .list`)
  if (list) {
    if (data.length) {
      data.forEach(item => {
        list.appendChild(setQuery(item))
      })
    } else {
      list.innerHTML = '<p class="empty">Nothing found...</p>'
    }
    
    list.classList.remove('hidden')
  }
}

const insertSurvey = function (linkId, survey) {
  const content = document.querySelector('.survey')
  const localSubmissions = JSON.parse(window.localStorage.getItem('submissions')) || []
  content.querySelector('h3').textContent = survey.title
  const link = content.querySelector('a')
  link.setAttribute('href', `/survey/${survey.key}?linkId=${linkId}`)

  if (survey.allowMultipleResponses || !localSubmissions.includes(linkId)) {
    content.classList.remove('hidden')
    if (localSubmissions.includes(linkId)) {
      link.textContent = 'Retake survey'
    }
  } 
}

const getRecentContent = async function (type, mineId, locationId, packageId) {
  if (!type || !mineId) return

  const snapshot = await getDocs(query(collection(db, `mines/${mineId}/${type}`), limit(5), orderBy('createdAt', 'desc'), where('packageDocId', '==', packageId), where('visibility', 'array-contains', locationId)))
  if (!snapshot.size) return []

  const data = []
  snapshot.forEach((doc) => {
    data.push({
      type,
      docId: doc.id,
      ...doc.data()
    })
  })
  return data
}

const getAllContent = async function (type, mineId, locationId, packageId) {
  if (!type || !mineId) return []

  const snapshot = await getDocs(query(collection(db, `mines/${mineId}/${type}`), orderBy('createdAt', 'desc'), where('packageDocId', '==', packageId), where('visibility', 'array-contains', locationId)))
  if (!snapshot.size) return []

  const data = []
  snapshot.forEach((doc) => {
    data.push({
      type,
      docId: doc.id,
      ...doc.data()
    })
  })
  return data
}

const getAllQueries = function (mineId) {
  const userRef = window.localStorage.getItem('userRef')
  if (!userRef) return
  return []
}

const setContentModal = function () {
  const urls = document.querySelectorAll('[data-embed-src]')
  urls.forEach((urlEl) => {
    urlEl.addEventListener('click', (e) => {  
      const template = document.getElementById('modal')
      const content = template.content.cloneNode(true)
      const embedder = content.querySelector('iframe')
      const closers = content.querySelectorAll('.close')
      embedder.addEventListener('click', (e) => {
        e.stopPropagation()
      })
      embedder.setAttribute('title', e.currentTarget.dataset.embedTitle)
      embedder.setAttribute('src', e.currentTarget.dataset.embedSrc)
      closers.forEach((close) => {
        close.addEventListener('click', (e) => {
          e.stopPropagation()
          document.querySelector('.modal').remove()
        })
      })
      document.body.appendChild(content)
    })
  })
} 

export { 
  insertListContent,
  insertQueryContent,
  insertSurvey,
  getRecentContent,
  getAllContent,
  getAllQueries,
  setContentModal
}