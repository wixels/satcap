import { uploadFile, requestHandler } from './helpers.js'
import { getAllQueries, insertQueryContent } from './content.js'

const showSuccess = function (form) {
  const success = document.querySelector('.form-success')
  if (success) {
    form.style.display = 'none'
    success.style.display = 'block'
  }
}

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
  
    const res = await requestHandler(window.location.origin+form.action, form.method, body)
    form.querySelector('button[type="submit"]').textContent = 'Submit query'
    if (res.ok) {
      form.reset()

      showSuccess(form)
      
      const queries = await getAllQueries(body.get('mineDocId'))
      insertQueryContent('queries', queries)
      
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