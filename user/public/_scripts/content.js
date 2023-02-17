import { collection, query, where, limit, orderBy, getDocs, getDoc, doc } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js'
import { db } from './init.js?v=1'
import { requestHandler } from './helpers.js'

const resources = {
  'Community Needs Survey': [
    {
      docId: 'static-cns-1',
      type: 'resources',
      title: 'Infographic',
      description: 'This is how all the SATCAP tools work together.',
      featureImageUrl: '/resources/Community Needs Survey/Infographic.png',
      url: '/resources/Community Needs Survey/SATCAP_Infographic.pdf'
    },
    {
      docId: 'static-cns-2',
      type: 'resources',
      title: 'Community Needs Assessment Tool',
      description: null,
      featureImageUrl: '/resources/Community Needs Survey/Tool.png',
      url: '/resources/Community Needs Survey/SATCAP_Infographic.pdf'
    }
  ],
  'Digital Competency Assessment': [
    {
      docId: 'static-dca-1',
      type: 'resources',
      title: 'Harvard Digital Transformation',
      description: null,
      featureImageUrl: '/resources/Digital Competency Assessment/tg0tmqJK6A-Screenshot 2022-09-15 at 09.38.27-2.png',
      url: '/resources/Digital Competency Assessment/m7YoBOsj9W-Harvard Business Review_Digital Transformation Refocused.pdf'
    },
    {
      docId: 'static-dca-2',
      type: 'resources',
      title: 'SABPP Leadership Standard 2017',
      description: null,
      featureImageUrl: '/resources/Digital Competency Assessment/qT9Dt16OXH-Screenshot 2022-09-15 at 09.37.24.png',
      url: '/resources/Digital Competency Assessment/Iy6MBhIKaL-SABPP_Leadership Standards 2017.pdf'
    },
    {
      docId: 'static-dca-3',
      type: 'resources',
      title: 'PWC Global Trends Challenges By African Realities',
      description: null,
      featureImageUrl: '/resources/Digital Competency Assessment/iABJFG7B2h-Screenshot 2022-09-15 at 09.37.13.png',
      url: '/resources/Digital Competency Assessment/iABJFG7B2h-PWC_Global Trends Challenges By African Realities.pdf'
    },
    {
      docId: 'static-dca-4',
      type: 'resources',
      title: 'PWC: Ten Insights into 4IR',
      description: null,
      featureImageUrl: '/resources/Digital Competency Assessment/LAsVvtHIux-Screenshot 2022-11-16 at 11.00.13.png',
      url: '/resources/Digital Competency Assessment/LAsVvtHIux-PWC_Ten Insights Into 4IR.pdf'
    },
    {
      docId: 'static-dca-5',
      type: 'resources',
      title: 'WEF Future Skills Article',
      description: null,
      featureImageUrl: '/resources/Digital Competency Assessment/p3B1fNRNa9-Screenshot 2022-09-15 at 09.58.14.png',
      url: 'https://www.weforum.org/agenda/2020/10/top-10-work-skills-of-tomorrow-how-long-it-takes-to-learn-them/'
    },
    {
      docId: 'static-dca-6',
      type: 'resources',
      title: 'PWC Workforce Of The Future 2030',
      description: null,
      featureImageUrl: '/resources/Digital Competency Assessment/e7fjhgYO51-Screenshot 2022-09-15 at 09.37.34.png',
      url: '/resources/Digital Competency Assessment/e7fjhgYO51-PWC_Workforce Of The Future 2030_2018.pdf'
    },
    {
      docId: 'static-dca-7',
      type: 'resources',
      title: 'SATCAP Digital Reference Material',
      description: null,
      featureImageUrl: '/resources/Digital Competency Assessment/s85PxtIFlE-Screenshot 2022-09-20 at 15.53.55.png',
      url: '/resources/Digital Competency Assessment/s85PxtIFlE-SATCAP REFERENCE TO SUPPORTING MATERIAL V3.pdf'
    }
  ],
  'SMME Engagement Tool': [
    {
      docId: 'static-set-1',
      type: 'resources',
      title: 'Pre-Application Cheat Sheet',
      description: null,
      featureImageUrl: '/resources/SMME Engagement Tool/Banners5.png',
      url: '/resources/SMME Engagement Tool/Pre-Application Cheat Sheet.pdf'
    },
    {
      docId: 'static-set-2',
      type: 'resources',
      title: 'FAQ\'s Post-Application',
      description: null,
      featureImageUrl: '/resources/SMME Engagement Tool/Banners.png',
      url: '/resources/SMME Engagement Tool/FAQ\'s Post-Application.pdf'
    },
    {
      docId: 'static-set-3',
      type: 'resources',
      title: 'Post-Application Cheat Sheet',
      description: null,
      featureImageUrl: '/resources/SMME Engagement Tool/Bz376PxTgi-Banners3.png',
      url: '/resources/SMME Engagement Tool/Bz376PxTgi-Post-Application Cheat Sheet.pdf'
    },
    {
      docId: 'static-set-4',
      type: 'resources',
      title: 'Procurement Glossary of Terms',
      description: null,
      featureImageUrl: '/resources/SMME Engagement Tool/ProcBanner.png',
      url: '/resources/SMME Engagement Tool/Procurement Terms.pdf'
    },
    {
      docId: 'static-set-5',
      type: 'resources',
      title: 'Helpful Links',
      description: null,
      featureImageUrl: '/resources/SMME Engagement Tool/9jegtJShRr-Banners2.png',
      url: '/resources/SMME Engagement Tool/9jegtJShRr-Helpful Links.pdf'
    },
    {
      docId: 'static-set-6',
      type: 'resources',
      title: 'FAQ\'s Pre-Application',
      description: null,
      featureImageUrl: '/resources/SMME Engagement Tool/zUgYHGVmd2-Banners6.png',
      url: '/resources/SMME Engagement Tool/zUgYHGVmd2-FAQ\'s Pre-Application.pdf'
    },
    {
      docId: 'static-set-7',
      type: 'resources',
      title: 'Video Tutorials',
      description: null,
      featureImageUrl: '/resources/SMME Engagement Tool/e2NZv3HyMl-Screenshot 2022-09-06 at 11.47.29.png',
      url: '/resources/SMME Engagement Tool/e2NZv3HyMl-Video Tutorials.pdf'
    },
    {
      docId: 'static-set-8',
      type: 'resources',
      title: 'FAQ\'s Post-Response',
      description: null,
      featureImageUrl: '/resources/SMME Engagement Tool/Screenshot 2022-09-06 at 11.46.21.png',
      url: '/resources/SMME Engagement Tool/p4Tne9qPCI-FAQ\'s Post-Response.pdf'
    }
  ],
  'Training Needs Assessment Tool': [
    {
      docId: 'static-tnat-1',
      type: 'resources',
      title: 'Infographic',
      description: 'This is how all the SATCAP tools work together.',
      featureImageUrl: '/resources/Training Needs Assessment Tool/whatissatcap.png',
      url: '/resources/Training Needs Assessment Tool/MDKWYrBxaM-SATCAP_Infographic_V7-2.pdf'
    },
    {
      docId: 'static-tnat-2',
      type: 'resources',
      title: 'Training Needs Assessment Tool',
      description: null,
      featureImageUrl: '/resources/SMME Engagement Tool/Banners5.png',
      url: '/resources/Training Needs Assessment Tool/88VQUCLpq2-Training Needs Assessment Tool.pdf'
    },
    {
      docId: 'static-tnat-3',
      type: 'resources',
      title: 'Alternative Economies',
      description: null,
      featureImageUrl: '/resources/Training Needs Assessment Tool/0ibYqimp5t-Screenshot 2022-11-24 at 12.14.57.png',
      url: '/resources/Training Needs Assessment Tool/eADPa1egOS-Alternative economy sheet v3 (002).pdf'
    }
  ]
}

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
  if (Array.isArray(survey.surveys)) {
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
  if (docId.includes('static-')) {
    const docIdAsArray = docId.split('-')
    let key
    switch (docIdAsArray[1]) {
      case 'cns':
        key = 'Community Needs Survey'
        break
      case 'dca':
        key = 'Digital Competency Assessment'
        break
      case 'set':
        key = 'SMME Engagement Tool'
        break
      case 'tnat':
        key = 'Training Needs Assessment Tool'
        break
      default:
        return
    }

    return resources[key].find((res) => res.docId === docId)
  } else {
    const docRef = doc(db, collection, docId)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      return
    } return {
      type,
      ...docSnap.data()
    }
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
  const params = new URLSearchParams(window.location.search)
  btn.addEventListener('click', (e) => window.location = `/information?linkId=${params.get('linkId')}&type=${params.get('type')}`)
  
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

  let data = []
  let key
  if (type === 'resources') {
    switch (packageId) {
      case 'ye0erjENgXMIgAMbsufs':
        key = 'Training Needs Assessment Tool'
        break;
      case 'w8jONMPpUov16uTFJT4G':
        key = 'Digital Competency Assessment'
        break;
      case 'zM4Z6N9H82ks1xiNLKen':
        key = 'Community Needs Survey'
        break;
      case 'ckCa1z7bexNKBI8Ufk0z':
        key = 'SMME Engagement Tool'
        break;
      default:
        break;
    }
    data = resources[key]
  }

  const snapshot = await getDocs(query(collection(db, `mines/${mineId}/${type}`), orderBy('createdAt', 'desc'), where('packageDocId', '==', packageId), where('visibility', 'array-contains', locationId)))
  if (!snapshot.size) return []

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