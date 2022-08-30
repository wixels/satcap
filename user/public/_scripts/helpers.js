/* eslint-disable no-undef, no-var, no-unused-vars */

function setQueryParams (params) {
  return Object.keys(params).map(key => key + '=' + params[key]).join('&')
}

function serializeFormData (formData) {
  var obj = {}
  for (var key of formData.keys()) {
    obj[key] = formData.get(key)
  }
  return obj
};

async function requestHandler (url, method, data, requiresAuth) {
  const opts = {
    method: method.toUpperCase()
  }
  if (data instanceof window.FormData) {
    data = serializeFormData(data)
  }
  opts.headers = {
    'Content-Type': 'application/json'
  }
  if (data) {
    switch (method.toLowerCase()) {
      case 'get':
        // set query params on url
        url = url + '?' + setQueryParams(data)
        break
      default:
        // body object
        opts.body = JSON.stringify(data)
        break
    }
  }
  if (requiresAuth) {
    opts.credentials = 'include'
  }
  return await window.fetch(url, opts)
}

export {
  setQueryParams,
  requestHandler
}