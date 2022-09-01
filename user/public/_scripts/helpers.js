import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-storage.js'
import { nanoid } from 'https://cdn.jsdelivr.net/npm/nanoid/nanoid.js'

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

const uploadFile = async function (file, directory = 'uploads/') {
  const storage = getStorage()
  const storageRef = ref(storage, `${directory+nanoid(4)}_${file.name}`)
  await uploadBytes(storageRef, file)
  return await getDownloadURL(storageRef)
}

export {
  setQueryParams,
  requestHandler,
  uploadFile
}