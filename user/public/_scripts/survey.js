import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js'
import { logEvent } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-analytics.js'
import { requestHandler } from './helpers.js'
import { analytics, db, initMenu } from './init.js?v=1'

const initialise = async function (suveryKey, localSubmissions) {
  const link = JSON.parse(window.localStorage.getItem('link'))
  if (link && link.package.survey.key === suveryKey) {
    const linkOpenSnapShot = await getDocs(query(collection(db, `mines/${link.mineDocId}/links/`), where('acceptResponses', '==', true), where('linkId', '==', link.linkId)))
    if (linkOpenSnapShot.size && (!localSubmissions.includes(link.linkId) || link.package.survey.allowMultipleResponses)) {
      const exitLink = document.querySelector('[href="./exit"]')
      if (link.package.survey.subSurveys || link.package.survey.surveys) {
        if (exitLink) {
          exitLink.classList.add('hidden')
        }
        const surveys = link.package.survey.subSurveys || link.package.survey.surveys
        for (const survey of surveys) {
          const template = document.getElementById('surveyItem')
          const content = template.content.cloneNode(true)
          const title = content.querySelector('h3')
          const description = content.querySelector('p')
          const btn = content.querySelector('button')
          const faqLink = content.querySelector('a')

          content.querySelector('.listItem .line').style.backgroundColor = survey.color
          title.textContent = survey.title
          description.textContent = survey.description
          btn.dataset.key = survey.key
          btn.dataset.surveyKey = link.package.survey.key
          btn.dataset.title = survey.title
          btn.addEventListener('click', (e) => {
            e.preventDefault()
            startSurvey(e.currentTarget.dataset.surveyKey, e.currentTarget.dataset.key, e.currentTarget.dataset.title)
          })
          if (survey.faqUrl && faqLink) {
            faqLink.classList.remove('hidden')
            faqLink.setAttribute('href', survey.faqUrl)
          }
          document.querySelector('#surveyList').appendChild(content)
        }
        if (link.package.scopes?.length) {
          initMenu(link.linkId, link.package.scopes)
        }
      } else {
        if (exitLink) {
          exitLink.setAttribute('href', `./exit?linkId=${link.linkId}`)
        }
        const consent = document.querySelector('.consent')
        consent.querySelector('form').addEventListener('submit', giveConsent)
        document.getElementById('surveyDescription').innerHTML = link.package.survey.description
        consent.classList.remove('hidden')
      }
      const loader = document.querySelector('.init')
      if (loader) loader.remove()
    } else {
      console.log(link.package.survey)
      // window.location.href = `./closed?title=${link.package.survey.title}&linkId=${link.linkId}`
    }
  }
}

const startSurvey = async function (surveyKey, subKey, title) {
  const link = JSON.parse(window.localStorage.getItem('link'))
  const template = document.getElementById(subKey)
  const content = template.content.cloneNode(true)

  const consent = content.querySelector('.consent')
  consent.querySelector('form').addEventListener('submit', giveConsent)
  content.querySelector('#surveyDescription').innerHTML = link.package.survey.description
  consent.classList.remove('hidden')
  document.querySelector('#surveyList').classList.add('hidden')
  document.querySelector('main').appendChild(content)
  const exitLink = document.querySelector('[href="./exit"]')
  if (exitLink) {
    exitLink.classList.remove('hidden')
    exitLink.setAttribute('href', `/survey/${surveyKey}?linkId=${link.linkId}`)
  }
  const header = document.querySelector('header h1')
  header.textContent = title
  const menu = document.querySelector('footer ul')
  if (menu) {
    menu.classList.add('hidden')
  }
}

const giveConsent = function (e) {
  e.preventDefault()
  const link = JSON.parse(window.localStorage.getItem('link'))
  const checked = document.querySelector('[name="giveConsent"]:checked')
  if (checked) {
    const consent = document.querySelector('.consent')
    const form = document.querySelector('.survey')
    if (form) {
      form.addEventListener('submit', submitSurvey)
      consent.classList.add('hidden')
      form.classList.remove('hidden')
      form.querySelector('input[name="mineDocId"]').setAttribute('value', link.mineDocId)
      form.querySelector('input[name="linkDocId"]').setAttribute('value', link.docId)
      form.querySelector('input[name="linkId"]').setAttribute('value', link.linkId)
      setOnChange(form)
      setProgressTracker()
      setEmbeddables()
      setCustomAnswers()
      logEvent(analytics, 'survey_start', {
        name: `${link.package.name} - ${link.package.survey.key}`,
        user_ref: window.localStorage.getItem('userRef'),
        link_id: link.linkId,
        package_id: link.package.docId,
        time_stamp: dayjs().format('YYYY-MM-DD HH:mm:ssZ')
      });
    }
  }
}

const submitSurvey = async function (e) {
  e.preventDefault()
  const form = e.currentTarget
  try {
    form.querySelector('button[type="submit"]').textContent = 'Submitting your responses...'
    let body = new window.FormData(form)
              
    const res = await requestHandler(form.action, form.method, body)
    form.querySelector('button[type="submit"]').textContent = 'Submit'
    if (res.ok) {
      const link = JSON.parse(window.localStorage.getItem('link'))
      logEvent(analytics, 'survey_complete', { 
        name: `${link.package.name} - ${link.package.survey.key}`,
        user_ref: window.localStorage.getItem('userRef'),
        link_id: link.linkId,
        package_id: link.package.docId,
        time_stamp: dayjs().format('YYYY-MM-DD HH:mm:ssZ')
      })
      // const resBody = await res.json()
      const localSubmissions = JSON.parse(window.localStorage.getItem('submissions')) || []
      localSubmissions.push(body.get('linkId'))
      window.location.href = `./complete?linkId=${link.linkId}&key=${body.get('survey')}`
    } else {
      throw new Error('An error occured whilst processing your request, please try again')
    }
  } catch (error) {
    form.querySelector('button[type="submit"]').textContent = 'Submit'
    console.error(error)
  }
}

const setCustomAnswers = function () {
  const link = JSON.parse(window.localStorage.getItem('link'))
  const questions = document.querySelectorAll('[data-answers]')
  questions.forEach((el) => {
    const answers = link.package.survey?.customAnswers?.[el.dataset.answers]
    if (Array.isArray(answers) && answers.length) {
      const optionsHtml = ['<option value="">Select an option</option>']
      answers.forEach((option) => {
        optionsHtml.push(`
          <option value="${option}">${option}</option>
        `)
      })
      el.innerHTML = optionsHtml.join('')
    }
  })
}

const setEmbeddables = function () {
  const urls = document.querySelectorAll('[data-embed-src]')
  urls.forEach((urlEl) => {
    urlEl.addEventListener('click', (e) => {  
      const template = document.getElementById('modal')
      const content = template.content.cloneNode(true)
      const embedder = content.querySelector('embed')
      const closers = content.querySelectorAll('.close')
      embedder.addEventListener('click', (e) => {
        e.stopPropagation()
      })
      embedder.setAttribute('title', e.currentTarget.textContent)
      embedder.setAttribute('type', e.currentTarget.dataset.embedType)
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

const setOnChange = function (containerElement) {
  const inputChange = (e) => {
    const el = e.currentTarget
    const container = el.parentNode.parentNode.parentNode
    const item = el.dataset[e.currentTarget.dataset.onChange]
    if (item) {
      if (e.currentTarget.dataset.onChange === 'maxCount') {
        const checked = document.querySelectorAll(`input[name="${e.currentTarget.name}"]:checked`)
        if (checked.length > Number(item)) {
          e.currentTarget.checked = false
        }
      } else {
        const itemAsArray = item.split('-')
        if (el.value.toLowerCase() === itemAsArray[1].toLowerCase()) {
          const template = document.querySelector(`[data-choice="${itemAsArray[0]}-${el.value.toLowerCase()}"]`)
          const questionContainer = template.parentNode
          const content = template.content.cloneNode(true)
          for (let i = 0; i < content.children.length; i++) {
            content.children[i].classList.add(itemAsArray[0]+'-'+itemAsArray[1].toLowerCase())
          }
          if (itemAsArray.length > 2) {
            const existing = questionContainer.querySelectorAll(`.${itemAsArray[0]}-${itemAsArray[3]?.toLowerCase()}`)
            if (existing.length) {
              existing.forEach((node) => {
                node.remove()
              })
            }
          }
          
          questionContainer.insertBefore(content, questionContainer.querySelector('button[type="submit"]'))
          setOnChange(questionContainer.querySelector(`.${itemAsArray[0]}-${itemAsArray[1].toLowerCase()}`))
        } else if (itemAsArray.length > 2 && el.value.toLowerCase() === itemAsArray[3]?.toLowerCase()) {
          const template = document.querySelector(`[data-choice="${itemAsArray[0]}-${el.value.toLowerCase()}"]`)
          const questionContainer = template.parentNode
          const content = template.content.cloneNode(true)
          for (let i = 0; i < content.children.length; i++) {
            content.children[i].classList.add(itemAsArray[0]+'-'+itemAsArray[3].toLowerCase())
          }

          const existing = questionContainer.querySelectorAll(`.${itemAsArray[0]}-${itemAsArray[1]?.toLowerCase()}`)
          if (existing.length) {
            existing.forEach((node) => {
              node.remove()
            })
          }
          questionContainer.insertBefore(content, questionContainer.querySelector('button[type="submit"]'))
          setOnChange(questionContainer.querySelector(`.${itemAsArray[0]}-${itemAsArray[3].toLowerCase()}`))
        } else {
          const existing = document.querySelectorAll(`.${itemAsArray[0]}-${itemAsArray[1].toLowerCase()}`)
          if (existing.length) {
            existing.forEach((node) => {
              node.remove()
            })
          }
          if (itemAsArray.length > 2) {
            const existingTwo = document.querySelectorAll(`.${itemAsArray[0]}-${itemAsArray[3].toLowerCase()}`)
            if (existingTwo.length) {
              existingTwo.forEach((node) => {
                node.remove()
              })
            }
          }
        }  
      }
    } else if (e.currentTarget.dataset.onChange === 'free-text') {
      const elAllowedToShow = container.querySelector(`[data-${e.currentTarget.dataset.onChange}="true"]`)
      if (elAllowedToShow.value === el.value) {
        const template = document.getElementById('selectFreeText')
        const content = template.content.cloneNode(true)
        content.querySelector('input[type="text"]').setAttribute('name', `${el.name}Description`)
        elAllowedToShow.parentNode.parentNode.parentNode.appendChild(content)
      } else {
        const label = container.querySelector('label.free-text')
        if (label) label.remove()
      }
    }
    setProgressTracker()
  }

  const listeners = containerElement.querySelectorAll('[data-on-change]')
  listeners.forEach((listener) => {
    listener.addEventListener('input', inputChange)
  })

  const inputs = containerElement.querySelectorAll('input')
  inputs.forEach((input) => {
    input.addEventListener('input', (e) => {
      setProgressTracker()
    })
  })
  const selects = containerElement.querySelectorAll('select')
  selects.forEach((select) => {
    select.addEventListener('input', (e) => {
      setProgressTracker()
    })
  })
}

const setProgressTracker = function () {
  const questions = document.querySelectorAll('.question')
  const form = document.forms.survey
  const answers = new window.FormData(form)
  const total = questions.length
  let completed = 0
  let keysChecked = []

  for (const key of answers.keys()) {
    if (!keysChecked.includes(key)) {
      let isComplete = false
      if (key.toLowerCase().includes('question')) {
        const els = document.getElementsByName(key)
        for (const el of els) {
          if (!isComplete) {
            switch (el.type) {
              case 'text':
              case 'select-one':
              case 'date':
                if (answers.get(key).length > 3) {
                  isComplete = true
                }
                break
              case 'radio':
              case 'checkbox':
                if (el.checked) {
                  isComplete = true
                }
            }
          }
        }
        if (isComplete) completed++
      }
      keysChecked.push(key)
    }
  }
  if (completed < total) {
    document.querySelector('form.survey button[type="submit"]').setAttribute('disabled', true)
  } else {
    document.querySelector('form.survey button[type="submit"]').removeAttribute('disabled')
  }
  document.querySelector('label[for="progress"]').textContent = `${completed} of ${total} answered`
  document.getElementById('progress').setAttribute('value', (completed / total) * 100)
  document.querySelector('.progress').classList.remove('hidden')
}

export {
  initialise,
  submitSurvey,
  setOnChange,
  setEmbeddables,
  setProgressTracker
}