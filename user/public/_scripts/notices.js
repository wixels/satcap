import { collection, query, where, limit, orderBy, getDocs } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js'
import { db } from './init.js?v=1'

const getRecentNotices = async function (mineId, locationId, packageId) {
  if (!mineId) return []

  const snapshot = await getDocs(query(collection(db, `mines/${mineId}/notices`), limit(3), orderBy('createdAt', 'desc'), where('packageDocId', '==', packageId), where('visibility', 'array-contains', locationId)))
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

const getAllNotices = async function (mineId, locationId, packageId) {
  if (!mineId) return []
}

export { getRecentNotices, getAllNotices }
