import axios from 'axios'
import { createHash } from 'crypto'
import dotenv from 'dotenv'
import haversine from 'haversine'

dotenv.config()

const utcDate = Math.floor(new Date().getTime() / 1000)
const publicKey = process.env.hotelApi_PUBLICKEY
const privateKey = process.env.hotelApi_PRIVATEKEY
const assemble = publicKey + privateKey + utcDate
const hash = createHash('sha256').update(assemble).digest('hex')

axios.interceptors.request.use(
  (config) => {
    if (publicKey && privateKey && hash) {
      config.headers['Api-key'] = publicKey
      config.headers['secret'] = privateKey
      config.headers['X-Signature'] = hash
    }
    console.log(config.headers)
    return config
  },
  (err) => {
    return Promise.reject(err)
  }
)

export const getAll = async (req, res) => {
  const ipInfo = await axios.get('http://ipinfo.io/json')
  const ipInfoData = ipInfo.data
  const start = {
    latitude: Number(ipInfoData.loc.split(',')[0]),
    longitude: Number(ipInfoData.loc.split(',')[1])
  }
  console.log('start', start)

  const url = `${process.env.hotelBookingApi_ENDPOINT}hotels`
  let query = {}

  const stay = {
    checkIn: req.body.stay.checkIn,
    checkOut: req.body.stay.checkOut
  }
  query.stay = stay

  const occupancies = [
    {
      rooms:
        req.body && req.body.occupancies && req.body.occupancies[0].rooms
          ? req.body.occupancies[0].rooms
          : 1,
      adults:
        req.body && req.body.occupancies && req.body.occupancies[0].adults
          ? req.body.occupancies[0].adults
          : 1,
      children:
        req.body && req.body.occupancies && req.body.occupancies[0].children
          ? req.body.occupancies[0].children
          : 0
    }
  ]
  query.occupancies = occupancies

  let geolocation = {}
  try {
    const params = {
      access_key: process.env.geoApiKey,
      query: req.body.destination ? req.body.destination : ''
    }

    const { data } = await axios.get('http://api.positionstack.com/v1/forward', { params })
    geolocation.longitude = data.data[0].longitude
    geolocation.latitude = data.data[0].latitude
    geolocation.radius = 100
    geolocation.unit = 'km'
  } catch (error) {
    console.log('error', error)
  }
  geolocation.longitude && (query.geolocation = geolocation)
  const end = { latitude: Number(geolocation.latitude), longitude: Number(geolocation.longitude) }
  console.log('end', end)

  const filter = {
    maxHotels: 12
  }
  query.filter = filter

  const reviews = [
    {
      type:
        req.data && req.data.reviews && req.data.reviews[0].type
          ? req.data.reviews[0].type
          : 'HOTELBEDS',
      maxRate:
        req.data && req.data.reviews && req.data.reviews[0].maxRate
          ? req.data.reviews[0].maxRate
          : 5,
      minRate:
        req.data && req.data.reviews && req.data.reviews[0].minRate
          ? req.data.reviews[0].minRate
          : 1,
      minReviewCount:
        req.data && req.data.reviews && req.data.reviews[0].minReviewCount
          ? req.data.reviews[0].minReviewCount
          : 3
    },
    {
      type:
        req.data && req.data.reviews && req.data.reviews[0].type
          ? req.data.reviews[0].type
          : 'TRIPADVISOR',
      maxRate:
        req.data && req.data.reviews && req.data.reviews[0].maxRate
          ? req.data.reviews[0].maxRate
          : 5,
      minRate:
        req.data && req.data.reviews && req.data.reviews[0].minRate
          ? req.data.reviews[0].minRate
          : 1,
      minReviewCount:
        req.data && req.data.reviews && req.data.reviews[0].minReviewCount
          ? req.data.reviews[0].minReviewCount
          : 3
    }
  ]
  query.reviews = reviews

  try {
    const { data } = await axios.post(url, query)
    let searchedHotelData = data
    const response = []

    for (let i = 0; i < searchedHotelData.hotels.hotels.length; i++) {
      const contentUrl = `${process.env.hotelContentApi_ENDPOINT}hotels/${searchedHotelData.hotels.hotels[i].code}/details`
      const { data } = await axios.get(contentUrl)
      const item = {}

      item.name = searchedHotelData.hotels.hotels[i].name
      item.ratings = searchedHotelData.hotels.hotels[i].reviews[0].rate
      item.reviewsCount = searchedHotelData.hotels.hotels[i].reviews[0].reviewCount
      item.image = data.hotel.images[0].path
      item.country = data.hotel.country.description.content
      item.city = data.hotel.state.name
      item.address = data.hotel.address.content
      item.coordinates = data.hotel.coordinates
      item.roomType = searchedHotelData.hotels.hotels[i].rooms[0].name
      item.freeCancellation =
        searchedHotelData.hotels.hotels[i].rooms[0].rates[0].cancellationPolicies[0].amount ===
        searchedHotelData.hotels.hotels[i].rooms[0].rates[0].net
          ? true
          : false
      item.price = searchedHotelData.hotels.hotels[i].rooms[0].rates[0].net
      item.noprepaymentneeded =
        searchedHotelData.hotels.hotels[i].rooms[0].rates[0].paymentType === 'AT_WEB' ? false : true
      // item.cashback
      item.bedType = data.hotel.rooms[0].roomStays[0].roomStayFacilities[0].description.content
      item.from = searchedHotelData.hotels.checkIn
      item.to = searchedHotelData.hotels.checkOut
      item.distance = haversine(start, end, { unit: 'mile' })
      response.push(item)
    }
    return res.json(response)
  } catch (error) {
    const status = error.response && error.response.status ? error.response.status : 500
    res.status(status).json({ error: error.message })
  }
}

export const getHotelById = async (req, res) => {
  const { id } = req.params
  const url = `${process.env.hotelContentApi_ENDPOINT}hotels/${id}/details`
  try {
    const { data } = await axios.get(url)
    return res.json(data)
  } catch (error) {
    res.json({ error: error.message })
  }
}

export const getHotelRateById = async (req, res) => {
  const { id } = req.params
  const url = `${process.env.hotelContentApi_ENDPOINT}types/ratecommentdetails?date=2022-09-20&code=${id}`
  try {
    const { data } = await axios.get(url)
    return res.json(data)
  } catch (error) {
    res.json({ error: error.message })
  }
}

export const getHotelFacilitiesById = async (req, res) => {
  const { id } = req.params
  let url = `${process.env.hotelContentApi_ENDPOINT}hotels?code=${id}`
  try {
    const { data } = await axios.get(url)
    return res.json(data)
  } catch (error) {
    res.json({ error: error.message })
  }
}

export const getHotelTestById = async (req, res) => {
  const { id } = req.params
  let url = `${process.env.hotelContentApi_ENDPOINT}hotels/${id}/details`
  try {
    const { data } = await axios.get(url)
    return res.json(data)
  } catch (error) {
    res.json({ error: error.message })
  }
}

export const getMostPopularHotels = async (req, res) => {
  const url = `${process.env.hotelBookingApi_ENDPOINT}hotels`
  let query = {}

  let currentDate = new Date()
  let nextDate = new Date(new Date().getTime() + 24 * 3600 * 1000)
  const stay = {
    checkIn: currentDate.toISOString().split('T')[0],
    checkOut: nextDate.toISOString().split('T')[0]
  }
  query.stay = stay

  const occupancies = [
    {
      rooms: 1,
      adults: 1,
      children: 0
    }
  ]
  query.occupancies = occupancies

  const filter = {
    maxHotels: 10
  }
  query.filter = filter

  const reviews = [
    {
      type: 'HOTELBEDS',
      maxRate: 5,
      minRate: 4,
      minReviewCount: 5
    }
  ]
  query.reviews = reviews

  let numArr = []
  for (let i = 0; i < 50; i++) {
    let num = Math.floor(Math.random() * 50) + 1
    if (numArr.indexOf(num) === -1) numArr.push(num)
  }

  const hotels = {
    hotel: numArr
  }
  query.hotels = hotels

  try {
    const { data } = await axios.post(url, query)
    let searchedHotelData = data
    const response = []

    for (let i = 0; i < searchedHotelData.hotels.hotels.length; i++) {
      const contentUrl = `${process.env.hotelContentApi_ENDPOINT}hotels/${searchedHotelData.hotels.hotels[i].code}/details`
      const { data } = await axios.get(contentUrl)
      const item = {}

      item.name = searchedHotelData.hotels.hotels[i].name
      item.image = data.hotel.images[1].path
      item.country = data.hotel.country.description.content
      item.city = data.hotel.state.name
      response.push(item)
    }
    return res.json(response)
  } catch (error) {
    const status = error.response && error.response.status ? error.response.status : 500
    res.status(status).json({ error: error.message })
  }
}

export const getRecentSearchedHotels = async (req, res) => {
  const url = `${process.env.hotelBookingApi_ENDPOINT}hotels`
  let query = {}

  let currentDate = new Date()
  let nextDate = new Date(new Date().getTime() + 24 * 3600 * 1000)
  const stay = {
    checkIn: currentDate.toISOString().split('T')[0],
    checkOut: nextDate.toISOString().split('T')[0]
  }
  query.stay = stay

  const occupancies = [
    {
      rooms: 1,
      adults: 1,
      children: 0
    }
  ]
  query.occupancies = occupancies

  const filter = {
    maxHotels: 18
  }
  query.filter = filter

  const reviews = [
    {
      type: 'HOTELBEDS',
      maxRate: 5,
      minRate: 4,
      minReviewCount: 3
    }
  ]
  query.reviews = reviews

  let numArr = []
  for (let i = 1; i < 50; i++) {
    let num = Math.floor(Math.random() * 70) + 1
    if (numArr.indexOf(num) === -1) numArr.push(num)
  }

  const hotels = {
    hotel: numArr
  }
  query.hotels = hotels

  try {
    const { data } = await axios.post(url, query)
    let searchedHotelData = data
    const response = []

    for (let i = 0; i < searchedHotelData.hotels.hotels.length; i++) {
      const contentUrl = `${process.env.hotelContentApi_ENDPOINT}hotels/${searchedHotelData.hotels.hotels[i].code}/details`
      const { data } = await axios.get(contentUrl)
      const item = {}

      item.name = searchedHotelData.hotels.hotels[i].name
      item.image = data.hotel.images[2].path
      item.country = data.hotel.country.description.content
      item.city = data.hotel.state.name
      item.from = currentDate.toISOString().split('T')[0]
      item.to = nextDate.toISOString().split('T')[0]
      response.push(item)
    }
    console.log('recent hotel response', response)
    return res.json(response)
  } catch (error) {
    const status = error.response && error.response.status ? error.response.status : 500
    res.status(status).json({ error: error.message })
  }
}

export const getDestinationIdeaHotels = async (req, res) => {
  const url = `${process.env.hotelBookingApi_ENDPOINT}hotels`
  let query = {}

  let currentDate = new Date()
  let nextDate = new Date(new Date().getTime() + 24 * 3600 * 1000)
  const stay = {
    checkIn: currentDate.toISOString().split('T')[0],
    checkOut: nextDate.toISOString().split('T')[0]
  }
  query.stay = stay

  const occupancies = [
    {
      rooms: 1,
      adults: 1,
      children: 0
    }
  ]
  query.occupancies = occupancies

  const filter = {
    maxHotels: 4
  }
  query.filter = filter

  const reviews = [
    {
      type: 'HOTELBEDS',
      maxRate: 5,
      minRate: 4,
      minReviewCount: 5
    }
  ]
  query.reviews = reviews

  let numArr = []
  for (let i = 951; i < 1000; i++) {
    let num = Math.floor(Math.random() * 50) + 1
    if (numArr.indexOf(num) === -1) numArr.push(num)
  }

  const hotels = {
    hotel: numArr
  }
  query.hotels = hotels

  try {
    const { data } = await axios.post(url, query)
    let searchedHotelData = data
    const response = []

    for (let i = 0; i < searchedHotelData.hotels.hotels.length; i++) {
      const contentUrl = `${process.env.hotelContentApi_ENDPOINT}hotels/${searchedHotelData.hotels.hotels[i].code}/details`
      const { data } = await axios.get(contentUrl)
      const item = {}

      item.name = searchedHotelData.hotels.hotels[i].name
      item.image = data.hotel.images[1].path
      item.country = data.hotel.country.description.content
      item.city = data.hotel.state.name
      response.push(item)
    }
    return res.json(response)
  } catch (error) {
    const status = error.response && error.response.status ? error.response.status : 500
    res.status(status).json({ error: error.message })
  }
}

export const getBestDealHotels = async (req, res) => {
  const url = `${process.env.hotelBookingApi_ENDPOINT}hotels`
  let query = {}

  let currentDate = new Date()
  let nextDate = new Date(new Date().getTime() + 24 * 3600 * 1000)
  const stay = {
    checkIn: currentDate.toISOString().split('T')[0],
    checkOut: nextDate.toISOString().split('T')[0]
  }
  query.stay = stay

  const occupancies = [
    {
      rooms: 1,
      adults: 1,
      children: 0
    }
  ]
  query.occupancies = occupancies

  const filter = {
    maxHotels: 4
  }
  query.filter = filter

  const reviews = [
    {
      type: 'HOTELBEDS',
      maxRate: 5,
      minRate: 4,
      minReviewCount: 5
    }
  ]
  query.reviews = reviews

  let numArr = []
  for (let i = 2501; i < 2550; i++) {
    let num = Math.floor(Math.random() * 50) + 1
    if (numArr.indexOf(num) === -1) numArr.push(num)
  }

  const hotels = {
    hotel: numArr
  }
  query.hotels = hotels

  try {
    const { data } = await axios.post(url, query)
    let searchedHotelData = data
    const response = []

    for (let i = 0; i < searchedHotelData.hotels.hotels.length; i++) {
      const contentUrl = `${process.env.hotelContentApi_ENDPOINT}hotels/${searchedHotelData.hotels.hotels[i].code}/details`
      const { data } = await axios.get(contentUrl)
      const item = {}

      item.name = searchedHotelData.hotels.hotels[i].name
      item.image = data.hotel.images[1].path
      item.country = data.hotel.country.description.content
      item.city = data.hotel.state.name
      response.push(item)
    }
    return res.json(response)
  } catch (error) {
    const status = error.response && error.response.status ? error.response.status : 500
    res.status(status).json({ error: error.message })
  }
}
