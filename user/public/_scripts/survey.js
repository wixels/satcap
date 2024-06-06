import { collection, query, where, orderBy, getDocs } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js'
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
        const questionsKey = document.createElement('input')
        questionsKey.setAttribute('type', 'hidden')
        questionsKey.setAttribute('name', 'questionsKey')
        questionsKey.setAttribute('value', suveryKey)

        consent.appendChild(questionsKey)
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
  const questionsKey = document.createElement('input')
  questionsKey.setAttribute('type', 'hidden')
  questionsKey.setAttribute('name', 'questionsKey')
  questionsKey.setAttribute('value', subKey)

  consent.appendChild(questionsKey)
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

const giveConsent = async function (e) {
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

      await setQuestions(consent.querySelector('input[name="questionsKey"]')?.value || link.package.survey.key, form)
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

const parseData = function (form) {
  const formData = new window.FormData(form)
  let body = {}
  for (const pair of formData.entries()) {
    if (pair[1].length) {
      if (!body[pair[0]]) {
        body[pair[0]] = pair[1]
      } else if (Array.isArray(body[pair[0]])) {
        body[pair[0]].push(pair[1])
      } else {
        body[pair[0]] = [body[pair[0]], pair[1]]
      }
    }
  }
  return body
}

const submitSurvey = async function (e) {
  e.preventDefault()
  const form = e.currentTarget
  try {
    form.querySelector('button[type="submit"]').textContent = 'Submitting your responses...'
    let body = parseData(form)
              
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
      localSubmissions.push(body.linkId)
      window.location.href = `./complete?linkId=${link.linkId}&key=${body.survey}`
    } else {
      throw new Error('An error occured whilst processing your request, please try again')
    }
  } catch (error) {
    form.querySelector('button[type="submit"]').textContent = 'Submit'
    console.error(error)
  }
}

const setQuestionContent = async function (questions, form, container, surveyKey, parentOrder) {
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i].data()
    const questionTemplate = document.getElementById(`question-type-${question.type}`)
    const questionContent = questionTemplate.content.cloneNode(true)

    questionContent.querySelector('.question').dataset.questionId = question.id
    questionContent.querySelector('.question').dataset.reportingKey = question.reportingKey
    questionContent.querySelector('.question-number').textContent = `Question ${(parentOrder) ? `${parentOrder}.` : ''}${i + 1}`
    questionContent.querySelector('.question-title').textContent = question.title
    questionContent.querySelector('.question-subtitle').textContent = question.subtitle
    const img = questionContent.querySelector('img')
    if (question.imageUrl) {
      img.setAttribute('src', question.imageUrl)
    } else {
      img.remove()
    }

    if (question.type === 'dropdown') {
      const select = questionContent.querySelector('select')
      select.name = `question-${question.id}`
      if (question.autoAnswers && !question.answers?.length) {
        select.dataset.answers = question.autoAnswers
      } else if (question.answers.length) {
        for (const answer of question.answers) {
          const option = document.createElement('option')
          option.textContent = (answer.description?.length) ? answer.description : answer.title
          option.value = answer.title
          if (answer.specifyAnswer) {
            select.dataset.onChange = 'free-text'
            option.dataset.freeText = 'true'
          }
          select.appendChild(option)
        }
      }
    } else if (question.type === 'number-rating') {
      const inputs = questionContent.querySelectorAll('input')
      for (let i = 0; i < inputs.length; i++) {
        let num = i + 1
        const label = questionContent.querySelector(`label[for="${num}"]`)
        inputs[i].setAttribute('id', `${question.id}-${num}`)
        inputs[i].setAttribute('name', question.id)
        label.setAttribute('for', `${question.id}-${num}`)
        label.textContent = question.answers[i].title
      }
    } else if (question.type === 'date') {
      const input = questionContent.querySelector('input')
      input.setAttribute('name', question.id)
    } else if (question.type === 'open-text') {
      const input = questionContent.querySelector('textarea')
      input.setAttribute('name', question.id)
    } else {
      for (const answer of question.answers) {
        const answerTemplate = questionContent.querySelector('#answer')
        const answerContent = answerTemplate.content.cloneNode(true)
        const input = answerContent.querySelector('input')
        answerContent.querySelector('span').textContent = (answer.description?.length) ? answer.description : answer.title
        input.name = `question-${question.id}`
        input.value = answer.title
        input.dataset.answerId = answer.id
        questionContent.querySelector('.answers').appendChild(answerContent)      
      }

      const subQuestions = question.answers.filter((answer) => answer.subView === 'questions')
      const subLinks = question.answers.filter((answer) => answer.subView === 'link' && answer.link?.title?.length)

      if (subQuestions.length) {
        for (const answer of subQuestions) {
          const inputs = questionContent.querySelectorAll('.answers input')
          for (const input of inputs) {
            input.dataset.onChange = "conditionalPath"
            input.dataset.conditionalPath = (input.dataset.conditionalPath) ? input.dataset.conditionalPath + `-${question.id}-${answer.id}` : `${question.id}-${answer.id}`
          }

          let parentIndex = (parentOrder) ? parentOrder + '.' : ''
          if (answer.subViewRelated) parentIndex = parentIndex + (i + 1)
          const subQuestionContent = await setSubQuestions(form, surveyKey, answer.id, (parentIndex.length) ? parentIndex : null)

          const temp = document.createElement('template')
          temp.dataset.choice = `${question.id}-${answer.id}`
          temp.appendChild(subQuestionContent)

          if (answer.subViewRelated) {
            questionContent.appendChild(temp)
          } else {
            form.querySelector('.unrelatedSubViews').appendChild(temp)
          } 
        }
      }

      if (subLinks.length) {
        for (const answer of subLinks) {
          const inputs = questionContent.querySelectorAll('.answers input')
          for (const input of inputs) {
            input.dataset.onChange = "conditionalPath"
            input.dataset.conditionalPath = (input.dataset.conditionalPath) ? input.dataset.conditionalPath + `-${question.id}-${answer.id}` : `${question.id}-${answer.id}`
          }
          const linkTemplate = document.getElementById('answer-subView-link')
          const linkContent = linkTemplate.content.cloneNode(true)

          linkContent.querySelector('p').textContent = answer.link.title

          if (!answer.link.url) {
            linkContent.querySelector('a').remove()
          } else {
            linkContent.querySelector('a').textContent = answer.link.name
            linkContent.querySelector('a').setAttribute('href', answer.link.url)
          }
          
          const temp = document.createElement('template')
          temp.dataset.choice = `${question.id}-${answer.id}`
          temp.appendChild(linkContent)
          questionContent.appendChild(temp)
        }
      }

      if (question.maxAnswerCount) {
        const inputs = questionContent.querySelectorAll('.answers input')
        for (const input of inputs) {
          input.dataset.onChange = "maxCount"
          input.dataset.maxCount = question.maxAnswerCount
        }
      }
    }
    container.appendChild(questionContent)
  }
}

const setSubQuestions = async function (form, surveyKey, answerId, parentOrder) {
  const subQuestionContent = document.createElement('div')
  subQuestionContent.classList.add('subQuestion')

  const questionsSnap = await getDocs(query(collection(db, 'questions'), where('surveyKey', '==', surveyKey), where('answerId', '==', answerId), orderBy('order')))

  if (!questionsSnap.size) return subQuestionContent

  await setQuestionContent(questionsSnap.docs, form, subQuestionContent, surveyKey, parentOrder)
  
  return subQuestionContent
}

const setQuestions = async function (surveyKey, form) {
  const questionsSnap = await getDocs(query(collection(db, 'questions'), where('surveyKey', '==', surveyKey), where('answerId', '==', null), orderBy('order')))
  if (questionsSnap.size) {
    await setQuestionContent(questionsSnap.docs, form, form.querySelector('.questions'), surveyKey)

    form.querySelector('#preQuestion').classList.add('hidden')
    form.querySelector('.questions').classList.remove('hidden')
    
  } else {
    form.querySelector('#preQuestion p').textContent = 'No questions found for survey'
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

const setAppendableLinks = function () {
  const link = JSON.parse(window.localStorage.getItem('link'))
  const appendableLinks = document.querySelectorAll('[data-append-link="true"]')
  if (appendableLinks.length) {
    for (const anchor of appendableLinks) {
      const currentHref = anchor.getAttribute('href')
      anchor.setAttribute('href', currentHref + `&linkId=${link.linkId}`)
    }
  }
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
      console.log('ITEM: ', item)
      console.log('el.dataset.answerId: ', el.dataset.answerId)
      if (e.currentTarget.dataset.onChange === 'maxCount') {
        const checked = document.querySelectorAll(`input[name="${e.currentTarget.name}"]:checked`)
        if (checked.length > Number(item)) {
          e.currentTarget.checked = false
        }
      } else if (e.currentTarget.dataset.onChange === 'free-text') {
        const elAllowedToShow = container.querySelector(`[data-${e.currentTarget.dataset.onChange}="true"]`)
        if (elAllowedToShow.value === el.value) {
          const template = document.getElementById('selectFreeText')
          const content = template.content.cloneNode(true)
          content.querySelector('input[type="text"]').setAttribute('name', `${el.name}-Description`)
          elAllowedToShow.parentNode.parentNode.parentNode.appendChild(content)
        } else {
          const label = container.querySelector('label.free-text')
          if (label) label.remove()
        }
      } else {
        const itemAsArray = item.split('-')
        if (el.dataset.answerId === itemAsArray[1]) {
          const template = document.querySelector(`[data-choice="${item}"]`)
          const questionContainer = document.querySelector('.questions')
          const content = template.content.cloneNode(true)
          for (let i = 0; i < content.children.length; i++) {
            content.children[i].classList.add(itemAsArray[0])
            content.children[i].classList.add(item)
          }
          if (itemAsArray.length > 2) {
            const existing = questionContainer.querySelectorAll(`.${itemAsArray[0]}`)
            if (existing.length) {
              existing.forEach((node) => {
                node.remove()
              })
            }
          }
          
          questionContainer.appendChild(content)
          // questionContainer.insertBefore(content, questionContainer.querySelector('button[type="submit"]'))
          setOnChange(questionContainer.querySelector(`.${item}`))
        } else if (itemAsArray.length > 2 && el.value === itemAsArray[3]) {
          const template = document.querySelector(`[data-choice="${itemAsArray[0]}-${el.value}"]`)
          const questionContainer = template.parentNode
          const content = template.content.cloneNode(true)
          for (let i = 0; i < content.children.length; i++) {
            content.children[i].classList.add(itemAsArray[0]+'-'+itemAsArray[3])
          }

          const existing = questionContainer.querySelectorAll(`.${itemAsArray[0]}-${itemAsArray[1]}`)
          if (existing.length) {
            existing.forEach((node) => {
              node.remove()
            })
          }
          questionContainer.insertBefore(content, questionContainer.querySelector('button[type="submit"]'))
          setOnChange(questionContainer.querySelector(`.${itemAsArray[0]}-${itemAsArray[3]}`))
        } else {
          const existing = document.querySelectorAll(`.${itemAsArray[0]}-${itemAsArray[1]}`)
          if (existing.length) {
            existing.forEach((node) => {
              node.remove()
            })
          }
          if (itemAsArray.length > 2) {
            const existingTwo = document.querySelectorAll(`.${itemAsArray[0]}-${itemAsArray[3]}`)
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
        content.querySelector('input[type="text"]').setAttribute('name', `${el.name}-Description`)
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
  const textareas = containerElement.querySelectorAll('textarea')
  textareas.forEach((textarea) => {
    textarea.addEventListener('input', (e) => {
      setProgressTracker()
    })
  })
  const selects = containerElement.querySelectorAll('select')
  selects.forEach((select) => {
    select.addEventListener('input', (e) => {
      setProgressTracker()
    })
  })

  setAppendableLinks()
}

const setProgressTracker = function () {
  const questions = document.querySelectorAll('.question')
  const form = document.forms.survey
  const answers = new window.FormData(form)
  const total = questions.length
  const validShortAnswer = ['n/a','na','no','yes','-']
  let completed = 0
  let keysChecked = []

  for (const key of answers.keys()) {
    console.log(key)
    if (!keysChecked.includes(key)) {
      let isComplete = false
      if (key.includes('question')) {
        const els = document.getElementsByName(key)
        for (const el of els) {
          if (!isComplete) {
            switch (el.type) {
              case 'text':
              case 'textarea':
              case 'select-one':
              case 'date':
                if (validShortAnswer.includes(answers.get(key)) || answers.get(key).length > 3) {
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