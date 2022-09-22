import { collection, query, where, limit, orderBy, getDocs, getDoc, doc } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js'
import { db } from './init.js?v=1'
import { requestHandler } from './helpers.js'

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
  const template = document.getElementById('templateContent')
  const content = template.content.cloneNode(true)
  const title = content.querySelector('h3')
  const description = content.querySelector('p')
  const img = content.querySelector('img')
  const btn = content.querySelector('button')

  const query = content.querySelector('.query')
  query.classList.add(item.status)
  query.id = item.docId
  title.textContent = item.title
  description.textContent = item.description

  if (item.image) {
    img.setAttribute('src', item.image)
    img.setAttribute('alt', item.title)
  } else {
    img.remove()
  }
  btn.dataset.queryDocId = item.docId
  btn.addEventListener('click', async (e) => {
    const id = e.currentTarget.dataset.queryDocId
    const link = JSON.parse(window.localStorage.getItem('link'))
    e.currentTarget.textContent = 'Deleting...'
    const res = await requestHandler('https://satcap-research.web.app/api/query/delete', 'DELETE', { mineDocId: link.mineDocId , queryDocId: id })
    if (res.ok) {
      document.getElementById(id).remove()
    }
    e.currentTarget.textContent = 'Delete'
  })

  return content
}

const insertListContent = function (parent, data) {
  const list = document.querySelector(`.${parent} .list`)
  if (list) {
    if (data.length) {
      data.forEach(item => {
        list.appendChild(setCard(item))
      })
    } else {
      list.classList.remove('inline')
      list.innerHTML = '<p class="empty">Nothing found...</p>'
    }
    
    document.querySelector(`.${parent}`).classList.remove('hidden')
  }
}

const insertQueryContent = function (parent, data) {
  const list = document.querySelector(`.${parent} .list`)
  if (list) {
    list.innerHTML = ''
    if (data.length) {
      data.forEach(item => {
        list.appendChild(setQuery(item))
      })
    } else {
      list.classList.remove('inline')
      list.innerHTML = '<p class="empty">Nothing found...</p>'
    }
    
    list.classList.remove('hidden')
  }
}

const insertSurvey = function (linkId, survey) {
  const content = document.querySelector('.survey')
  const localSubmissions = JSON.parse(window.localStorage.getItem('submissions')) || []
  content.querySelector('h3').textContent = survey.title
  content.querySelector('p').textContent = survey.shortDescription || ''
  const link = content.querySelector('a')
  link.setAttribute('href', `/survey/${survey.key}?linkId=${linkId}`)

  if (survey.allowMultipleResponses || !localSubmissions.includes(linkId)) {
    content.classList.remove('hidden')
    if (localSubmissions.includes(linkId)) {
      link.textContent = 'Retake survey'
    }
  }
  if (survey.title === 'Checklists') {
    link.textContent = 'Begin checklists'
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

const getSingleContent = async function (collection, docId, type) {
  console.log(collection)
  const docRef = doc(db, collection, docId)
  const docSnap = await getDoc(docRef)
  
  if (!docSnap.exists()) {
    return
  } return {
    type,
    ...docSnap.data()
  }
}

const canBeIFramed = function (fileName) {
  const validFile = ['.pdf', '.mp4']
   
  return fileName.includes('https://') && validFile.some(item => fileName.includes(item))
}

const viewItem = function (item) {
  const template = document.getElementById('templateItem')
  const content = template.content.cloneNode(true)
  const subTemplate = document.getElementById(`template-${item.type}`)
  const subContent = subTemplate.content.cloneNode(true)

  const feature = content.querySelector('.feature')
  feature.style.backgroundImage = `url('${item.featureImageUrl}')`
  const btn = content.querySelector('button')
  btn.addEventListener('click', (e) => {
    window.history.back()
  })
  const title = subContent.querySelector('h3')
  title.textContent = item.title
  if (item.type === 'notices') {
    const month = subContent.querySelector('.month')
    const day = subContent.querySelector('.day')
    month.textContent = dayjs(item.createdAt).format('MMM')
    day.textContent = dayjs(item.createdAt).format('DD')
  } else {
    const date = subContent.querySelector('.date')
    date.textContent = dayjs(item.createdAt).format('DD MMMM YYYY')
  }
  const description = subContent.querySelector('p.description')
  description.textContent = item.description

  const link = subContent.querySelector('a')
  if (link && item.url) {
    link.setAttribute('href', item.url)
    link.classList.remove('hidden')
  }
  const preview = subContent.querySelector('iframe')
  if (preview && item.url && canBeIFramed(item.url)) {
    preview.setAttribute('title', item.title)
    preview.setAttribute('src', item.url)
    preview.classList.remove('hidden')
  }

  content.querySelector('.item').appendChild(subContent)
  const existing = document.getElementById('view-information')
  if (existing) existing.remove()
  document.body.prepend(content)
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

const getAllQueries = async function (mineId) {
  const userRef = window.localStorage.getItem('userRef')
  if (!userRef) return []
  const snapshot = await getDocs(query(collection(db, `mines/${mineId}/queries`), orderBy('createdAt', 'desc'), where('userRef', '==', userRef)))
  console.log(snapshot)
  if (!snapshot.size) return []

  const data = []
  snapshot.forEach((doc) => {
    data.push({
      docId: doc.id,
      ...doc.data()
    })
  })
  return data
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
  setContentModal,
  getSingleContent,
  viewItem
}