import { uploadFile, requestHandler } from './helpers.js'

const submit = async function (e) {
  e.preventDefault()
  const form = e.currentTarget
  try {
    form.querySelector('button[type="submit"]').textContent = 'Submitting your query...'
    let body = new window.FormData(form)
    for (const pair of body.entries()) {
      if (typeof pair[1] !== 'string' && pair[1].type.includes('image')) {
        console.log('Im here')
        body.set('imageUrl', await uploadFile(pair[1], `mines/${body.get('mineDocId')}/queries/`))
        body.delete(pair[0])
      }
    }
  
    const res = await requestHandler(form.action, form.method, body)
    form.querySelector('button[type="submit"]').textContent = 'Submit query'
    if (res.ok) {
      form.reset()
      document.querySelector('.modal').remove()
    } else {
      console.error(res)
    }
  } catch (error) {
    form.querySelector('button[type="submit"]').textContent = 'Submit query'
    console.error(error)
  }
}

export {
  submit
}