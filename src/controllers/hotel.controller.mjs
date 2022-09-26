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
  console.log('req.body', req.body)

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

  const rooms = req.body.rooms
  query.rooms = rooms

  let geolocation = {}
  try {
    const params = {
      access_key: process.env.geoApiKey,
      query: req.body.destination.destination ? req.body.destination.destination : ''
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

  const filter = {
    maxHotels: 18
  }
  query.filter = filter

  const start = req.body.currentLocation
    ? req.body.currentLocation
    : { latitude: 38.722252, longitude: -9.139337 }

  const reviews = [
    {
      type: 'HOTELBEDS',
      maxRate: 5,
      minRate: 1,
      minReviewCount: 3
    },
    {
      type: 'TRIPADVISOR',
      maxRate: 5,
      minRate: 1,
      minReviewCount: 3
    }
  ]
  query.reviews = reviews
  try {
    console.log('searchquery', query)
    const { data } = await axios.post(url, query)
    let searchedHotelData = data
    console.log('searchedHotelData', searchedHotelData)
    const response = []

    for (let i = 0; i < searchedHotelData.hotels.hotels.length; i++) {
      const contentUrl = `${process.env.hotelContentApi_ENDPOINT}hotels/${searchedHotelData.hotels.hotels[i].code}/details`
      const { data } = await axios.get(contentUrl)
      const item = {}

      item.name = searchedHotelData.hotels.hotels[i].name
      item.ratings = searchedHotelData.hotels.hotels[i].reviews[0].rate
      item.currency = searchedHotelData.hotels.hotels[i].currency

      item.reviewsCount = searchedHotelData.hotels.hotels[i].reviews[0].reviewCount
      item.image = data.hotel.images.filter(
        (item) => item.type.description.content === 'Room'
      )[0].path
      item.country = data.hotel.country.description.content
      item.city = data.hotel.state.name
      item.address = data.hotel.address.content
      item.coordinates = data.hotel.coordinates
      item.cancellationPolicies = searchedHotelData.hotels.hotels[i].rooms[0].rates[0]
        .cancellationPolicies
        ? searchedHotelData.hotels.hotels[i].rooms[0].rates[0].cancellationPolicies[0]
        : {
            amount: '0',
            from: 'Anytime'
          }
      item.code = searchedHotelData.hotels.hotels[i].code
      item.roomType = searchedHotelData.hotels.hotels[i].rooms[0].name
      item.freeCancellation =
        searchedHotelData.hotels.hotels[i].rooms[0].rates[0].rateClass === 'NOR' ? true : false
      item.price = searchedHotelData.hotels.hotels[i].rooms[0].rates[0].net
      item.noprepaymentneeded =
        searchedHotelData.hotels.hotels[i].rooms[0].rates[0].paymentType === 'AT_WEB' ? false : true
      item.bedType = data.hotel.rooms[0].type.description.content
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
    const response = {}
    response.hotelName = data.hotel.name.content
    response.hotelImg = data.hotel.images[0].path
    response.city = data.hotel.state.name
    response.country = data.hotel.country.description.content
    response.description = data.hotel.description.content
    response.lastUpdate = data.hotel.lastUpdate
    const gallery = []
    for (let i = 0; i < data.hotel.images.length; i++) {
      gallery.push(data.hotel.images[i].path)
    }
    response.gallery = gallery
    return res.json(response)
  } catch (error) {
    res.json({ error: error.message })
  }
}

export const getHotelRateById = async (req, res) => {
  console.log('rate params', req.params)
  const { id } = req.params
  const url = `${process.env.hotelContentApi_ENDPOINT}types/ratecommentdetails?date=2022-09-24&code=${id}`
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
  let nextDate = new Date(new Date().getTime() + 72 * 3600 * 1000)
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
    maxHotels: 6
  }
  query.filter = filter

  const reviews = [
    {
      type: 'HOTELBEDS',
      maxRate: 5,
      minRate: 3,
      minReviewCount: 4
    },
    {
      type: 'TRIPADVISOR',
      maxRate: 5,
      minRate: 4,
      minReviewCount: 4
    }
  ]
  query.reviews = reviews

  let geolocation = {}
  try {
    const params = {
      access_key: process.env.geoApiKey,
      query: 'London'
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

  // let numArr = []
  // for (let i = 0; i < 50; i++) {
  //   let num = Math.floor(Math.random() * 12000) + 1
  //   if (numArr.indexOf(num) === -1) numArr.push(num)
  // }

  // const hotels = {
  //   hotel: numArr
  // }
  // query.hotels = hotels

  try {
    const { data } = await axios.post(url, query)
    console.log('most query', query)
    console.log('most hotel data', data)
    let searchedHotelData = data
    const response = []

    for (let i = 0; i < searchedHotelData.hotels.hotels.length; i++) {
      const contentUrl = `${process.env.hotelContentApi_ENDPOINT}hotels/${searchedHotelData.hotels.hotels[i].code}/details`
      const { data } = await axios.get(contentUrl)
      const item = {}

      item.name = searchedHotelData.hotels.hotels[i].name
      item.code = searchedHotelData.hotels.hotels[i].code
      item.price = searchedHotelData.hotels.hotels[i].rooms[0].rates[0].net
      item.ratings = searchedHotelData.hotels.hotels[i].reviews[0].rate
      item.reviewsCount = searchedHotelData.hotels.hotels[i].reviews[0].reviewCount
      item.image = data.hotel.images.filter(
        (item) => item.type.description.content === 'Room'
      )[0].path
      item.country = data.hotel.country.description.content
      item.cancellationPolicies =
        searchedHotelData.hotels.hotels[i].rooms[0].rates[0].cancellationPolicies[0]
      item.city = data.hotel.state.name
      item.currency = searchedHotelData.hotels.hotels[i].currency
      item.from = searchedHotelData.hotels.checkIn
      item.to = searchedHotelData.hotels.checkOut
      response.push(item)
    }
    console.log('most hotel respones', response)
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
  let nextDate = new Date(new Date().getTime() + 48 * 3600 * 1000)
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
      minRate: 1,
      minReviewCount: 3
    }
  ]
  query.reviews = reviews

  let geolocation = {}
  try {
    const params = {
      access_key: process.env.geoApiKey,
      query: 'London'
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

  // let numArr = []
  // for (let i = 1; i < 50; i++) {
  //   let num = Math.floor(Math.random() * 7890) + 1
  //   if (numArr.indexOf(num) === -1) numArr.push(num)
  // }

  // const hotels = {
  //   hotel: numArr
  // }
  // query.hotels = hotels

  try {
    const { data } = await axios.post(url, query)
    let searchedHotelData = data
    const response = []

    for (let i = 0; i < searchedHotelData.hotels.hotels.length; i++) {
      const contentUrl = `${process.env.hotelContentApi_ENDPOINT}hotels/${searchedHotelData.hotels.hotels[i].code}/details`
      const { data } = await axios.get(contentUrl)
      const item = {}

      item.name = searchedHotelData.hotels.hotels[i].name
      item.image = data.hotel.images.filter(
        (item) => item.type.description.content === 'Room'
      )[0].path
      item.country = data.hotel.country.description.content
      item.city = data.hotel.state.name
      item.price = searchedHotelData.hotels.hotels[i].rooms[0].rates[0].net
      item.ratings = searchedHotelData.hotels.hotels[i].reviews[0].rate
      item.reviewsCount = searchedHotelData.hotels.hotels[i].reviews[0].reviewCount
      item.code = searchedHotelData.hotels.hotels[i].code
      item.currency = searchedHotelData.hotels.hotels[i].currency
      item.from = searchedHotelData.hotels.checkIn
      item.cancellationPolicies =
        searchedHotelData.hotels.hotels[i].rooms[0].rates[0].cancellationPolicies[0]
      item.to = searchedHotelData.hotels.checkOut
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
  let nextDate = new Date(new Date().getTime() + 48 * 3600 * 1000)
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
    maxHotels: 4,
    minRate: 2000,
    maxRate: 5000
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

  let geolocation = {}
  try {
    const params = {
      access_key: process.env.geoApiKey,
      query: 'London'
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

  // let numArr = []
  // for (let i = 0; i < 50; i++) {
  //   let num = Math.floor(Math.random() * 13000) + 1
  //   if (numArr.indexOf(num) === -1) numArr.push(num)
  // }

  // const hotels = {
  //   hotel: numArr
  // }
  // query.hotels = hotels

  try {
    const { data } = await axios.post(url, query)
    let searchedHotelData = data
    const response = []

    for (let i = 0; i < searchedHotelData.hotels.hotels.length; i++) {
      const contentUrl = `${process.env.hotelContentApi_ENDPOINT}hotels/${searchedHotelData.hotels.hotels[i].code}/details`
      const { data } = await axios.get(contentUrl)
      const item = {}

      item.name = searchedHotelData.hotels.hotels[i].name
      item.code = searchedHotelData.hotels.hotels[i].code
      item.image = data.hotel.images.filter(
        (item) => item.type.description.content === 'Room'
      )[0].path
      item.country = data.hotel.country.description.content
      item.city = data.hotel.state.name
      item.currency = searchedHotelData.hotels.hotels[i].currency
      item.cancellationPolicies =
        searchedHotelData.hotels.hotels[i].rooms[0].rates[0].cancellationPolicies[0]
      item.price = searchedHotelData.hotels.hotels[i].rooms[0].rates[0].net
      item.ratings = searchedHotelData.hotels.hotels[i].reviews[0].rate
      item.reviewsCount = searchedHotelData.hotels.hotels[i].reviews[0].reviewCount
      item.from = searchedHotelData.hotels.checkIn
      item.to = searchedHotelData.hotels.checkOut
      response.push(item)
    }
    console.log('destination hotel response', response)
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
  let nextDate = new Date(new Date().getTime() + 48 * 3600 * 1000)
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
    maxHotels: 4,
    maxRate: 150
  }
  query.filter = filter

  const reviews = [
    {
      type: 'HOTELBEDS',
      maxRate: 5,
      minRate: 1,
      minReviewCount: 5
    }
  ]
  query.reviews = reviews

  let geolocation = {}
  try {
    const params = {
      access_key: process.env.geoApiKey,
      query: 'Barcelona'
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

  // let numArr = []
  // for (let i = 0; i < 50; i++) {
  //   let num = Math.floor(Math.random() * 10000) + 1
  //   if (numArr.indexOf(num) === -1) numArr.push(num)
  // }

  // const hotels = {
  //   hotel: numArr
  // }
  // query.hotels = hotels

  try {
    const { data } = await axios.post(url, query)
    let searchedHotelData = data
    const response = []

    for (let i = 0; i < searchedHotelData.hotels.hotels.length; i++) {
      const contentUrl = `${process.env.hotelContentApi_ENDPOINT}hotels/${searchedHotelData.hotels.hotels[i].code}/details`
      const { data } = await axios.get(contentUrl)
      const item = {}

      item.name = searchedHotelData.hotels.hotels[i].name
      item.code = searchedHotelData.hotels.hotels[i].code
      item.image = data.hotel.images.filter(
        (item) => item.type.description.content === 'Room'
      )[0].path
      item.country = data.hotel.country.description.content
      item.city = data.hotel.state.name
      item.cancellationPolicies =
        searchedHotelData.hotels.hotels[i].rooms[0].rates[0].cancellationPolicies[0]
      item.price = searchedHotelData.hotels.hotels[i].rooms[0].rates[0].net
      item.ratings = searchedHotelData.hotels.hotels[i].reviews[0].rate
      item.reviewsCount = searchedHotelData.hotels.hotels[i].reviews[0].reviewCount
      item.currency = searchedHotelData.hotels.hotels[i].currency
      item.from = searchedHotelData.hotels.checkIn
      item.to = searchedHotelData.hotels.checkOut
      response.push(item)
    }
    return res.json(response)
  } catch (error) {
    const status = error.response && error.response.status ? error.response.status : 500
    res.status(status).json({ error: error.message })
  }
}
