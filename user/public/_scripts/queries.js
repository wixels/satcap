import { uploadFile } from './helpers.js'
const submit = async function (e) {
  e.preventDefault()
  const form = e.currentTarget
  try {
    form.querySelector('button[type="submit"]').textContent = 'Submitting your query...'
    let body = new window.FormData(form)
    for (const pair of body.entries()) {
      if (typeof pair[1] !== 'string' && pair[1].type.includes('image')) {
        body.set('imageUrl', await uploadFile(pair[1], `mines/${body.get('mineDocId')}/queries/`))
        body.delete(pair[0])
      }
    }

    for (const pair of body.entries()) {
      console.log(`${pair[0]}, ${pair[1]}`)
    }

              
    // const res = await requestHandler(form.action, form.method, body)
    // form.querySelector('button[type="submit"]').textContent = 'Submit query'
    // if (res.ok) {
    //   const link = JSON.parse(window.localStorage.getItem('link'))
    //   logEvent(analytics, 'survey_complete', { 
    //     name: `${link.package.name} - ${link.package.survey.title}`,
    //     user_ref: window.localStorage.getItem('userRef'),
    //     link_id: link.linkId,
    //     package_id: link.package.docId,
    //     time_stamp: dayjs().format('YYYY-MM-DD HH:mm:ssZ')
    //   })
    //   // const resBody = await res.json()
    //   const localSubmissions = JSON.parse(window.localStorage.getItem('submissions')) || []
    //   localSubmissions.push(body.get('linkId'))
    //   window.location.href = `./complete?linkId=${link.linkId}`
    // } else {
    //   window.location.href = `./complete?linkId=${link.linkId}`
    //   // throw new Error('An error occured whilst processing your request, please try again')
    // }
  } catch (error) {
    form.querySelector('button[type="submit"]').textContent = 'Submit query'
    console.error(error)
  }
}

export {
  submit
}