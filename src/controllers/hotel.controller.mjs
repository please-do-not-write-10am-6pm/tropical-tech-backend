import axios from 'axios'
import { createHash } from 'crypto'
import dotenv from 'dotenv'
import haversine from 'haversine'

dotenv.config()

const publicKey = process.env.hotelApi_PUBLICKEY
const privateKey = process.env.hotelApi_PRIVATEKEY

axios.interceptors.request.use(
  (config) => {
    if (publicKey && privateKey) {
      config.headers['Api-key'] = publicKey
      config.headers['secret'] = privateKey
      const utcDate = Math.floor(new Date().getTime() / 1000)
      const assemble = publicKey + privateKey + utcDate
      const hash = createHash('sha256').update(assemble).digest('hex')
      config.headers['X-Signature'] = hash
    }
    return config
  },
  (err) => {
    return Promise.reject(err)
  }
)

export const getAll = async (req, res) => {
  const url = `${process.env.hotelBookingApi_ENDPOINT}hotels`
  let query = {}

  const isOld = new Date(req.body.stay.checkIn).getTime() >= new Date().getTime() ? true : false

  const stay = {
    checkIn: isOld ? req.body.stay.checkIn : new Date().toISOString().split('T')[0],
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
          : 0,
      paxes:
        req.body && req.body.occupancies && req.body.occupancies[0].paxes
          ? req.body.occupancies[0].paxes
          : []
    }
  ]
  query.occupancies = occupancies

  const rooms = req.body.rooms
  query.rooms = rooms

  if (
    req.body.destination.destination !== 'Everywhere' &&
    req.body.destination.destination !== 'MostPopular' &&
    req.body.destination.destination !== 'BestDeal'
  ) {
    let geolocation = {}
    try {
      const params = {
        access_key: process.env.geoApiKey,
        query: req.body.destination.destination ? req.body.destination.destination : ''
      }

      const { data } = await axios.get('http://api.positionstack.com/v1/forward', { params })
      geolocation.longitude = data.data[0].longitude
      geolocation.latitude = data.data[0].latitude
      geolocation.radius = 20
      geolocation.unit = 'km'

      geolocation.longitude && (query.geolocation = geolocation)

      const filter = {
        maxHotels: 50
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
    } catch (error) {
      console.log('err', error)
    }
  } else {
    if (req.body.destination.destination === 'Everywhere') {
      let arr = []
      while (arr.length < 300) {
        let r = Math.floor(Math.random() * 10000) + 1
        if (arr.indexOf(r) === -1) arr.push(r)
      }
      const hotels = {
        hotel: arr
      }
      query.hotels = hotels

      const filter = {
        maxHotels: 50
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
    }
    if (req.body.destination.destination === 'MostPopular') {
      let arr = []
      while (arr.length < 300) {
        let r = Math.floor(Math.random() * 10000) + 1
        if (arr.indexOf(r) === -1) arr.push(r)
      }
      const hotels = {
        hotel: arr
      }
      query.hotels = hotels

      const filter = {
        maxHotels: 50
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
    }
    if (req.body.destination.destination === 'BestDeal') {
      let arr = []
      while (arr.length < 300) {
        let r = Math.floor(Math.random() * 10000) + 1
        if (arr.indexOf(r) === -1) arr.push(r)
      }
      const hotels = {
        hotel: arr
      }
      query.hotels = hotels

      const filter = {
        maxHotels: 50,
        maxRate: 300
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
    }
  }

  const start = query.geolocation
    ? {
        latitude: Number(query.geolocation.latitude),
        longitude: Number(query.geolocation.longitude)
      }
    : { latitude: 38.722252, longitude: -9.139337 }

  try {
    console.log('req.body', req.body, 'query', query)
    const { data } = await axios.post(url, query)
    let searchedHotelData = data
    if (searchedHotelData.hotels.total === 0) {
      return res.json([])
    }
    const response = []
    let page = req.body.page || 0
    let limit = req.body.limit || 7
    let length =
      limit * (page + 1) > searchedHotelData.hotels.hotels.length
        ? searchedHotelData.hotels.hotels.length
        : limit * (page + 1)

    for (let i = limit * page; i < length; i++) {
      if (limit * page > searchedHotelData.hotels.hotels.length) {
        break
      }
      const contentUrl = `${process.env.hotelContentApi_ENDPOINT}hotels/${searchedHotelData.hotels.hotels[i].code}/details`
      const { data } = await axios.get(contentUrl)
      const item = {}
      const end = {
        latitude: Number(data.hotel.coordinates.latitude),
        longitude: Number(data.hotel.coordinates.longitude)
      }

      item.code = searchedHotelData.hotels.hotels[i].code
      item.name = searchedHotelData.hotels.hotels[i].name
      item.ratings = searchedHotelData.hotels.hotels[i].reviews[0].rate
      item.currency = searchedHotelData.hotels.hotels[i].currency
      item.reviewsCount = searchedHotelData.hotels.hotels[i].reviews[0].reviewCount
      item.image = data.hotel.images.filter(
        (item) => item.type.description.content === 'Room'
      )[0].path
      item.country = data.hotel.country.description.content
      item.address = data.hotel.address.content
      item.coordinates = data.hotel.coordinates
      item.city = data.hotel.state.name
      item.from = searchedHotelData.hotels.checkIn
      item.to = searchedHotelData.hotels.checkOut
      item.distance = haversine(start, end, { unit: 'km' })

      item.rateKey = searchedHotelData.hotels.hotels[i].rooms[0].rates[0].rateKey
      item.rateType = searchedHotelData.hotels.hotels[i].rooms[0].rates[0].rateType
      item.taxes =
        searchedHotelData.hotels.hotels[i].rooms[0].rates[0].taxes &&
        searchedHotelData.hotels.hotels[i].rooms[0].rates[0].taxes.taxes &&
        searchedHotelData.hotels.hotels[i].rooms[0].rates[0].taxes.taxes[0].amount
      item.cancellationPolicies = searchedHotelData.hotels.hotels[i].rooms[0].rates[0]
        .cancellationPolicies
        ? searchedHotelData.hotels.hotels[i].rooms[0].rates[0].cancellationPolicies[0]
        : {
            amount: '0',
            from: 'Anytime'
          }
      item.roomType = searchedHotelData.hotels.hotels[i].rooms[0].name
      item.bedType = searchedHotelData.hotels.hotels[i].rooms[0].rates[0].boardName
      item.freeCancellation =
        searchedHotelData.hotels.hotels[i].rooms[0].rates[0].rateClass === 'NOR' ? true : false
      item.price = searchedHotelData.hotels.hotels[i].rooms[0].rates[0].net
      item.noprepaymentneeded =
        searchedHotelData.hotels.hotels[i].rooms[0].rates[0].paymentType === 'AT_WEB' ? false : true
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

export const getRecentSearchedHotels = async (req, res) => {
  const url = `${process.env.hotelBookingApi_ENDPOINT}hotels`
  let query = {}

  let currentDate = new Date(new Date().getTime() + 24 * 3600 * 1000)
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
    maxHotels: 4
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

  // let geolocation = {}
  // try {
  //   const params = {
  //     access_key: process.env.geoApiKey,
  //     query: 'Lisbon'
  //   }
  //   const { data } = await axios.get('http://api.positionstack.com/v1/forward', { params })
  //   geolocation.longitude = data.data[0].longitude
  //   geolocation.latitude = data.data[0].latitude
  //   geolocation.radius = 100
  //   geolocation.unit = 'km'
  // } catch (error) {
  //   console.log('error', error)
  // }
  // geolocation.longitude && (query.geolocation = geolocation)

  const hotels = {
    hotel: [142665, 87344, 161053, 161485]
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
      item.code = searchedHotelData.hotels.hotels[i].code
      item.image = data.hotel.images.filter(
        (item) => item.type.description.content === 'Room'
      )[0]?.path
      item.country = data.hotel.country.description.content
      item.city = data.hotel.state.name
      item.currency = searchedHotelData.hotels.hotels[i].currency
      item.cancellationPolicies = searchedHotelData.hotels.hotels[i].rooms[0].rates[0]
        .cancellationPolicies
        ? searchedHotelData.hotels.hotels[i].rooms[0].rates[0].cancellationPolicies[0]
        : {
            amount: '0',
            from: 'Anytime'
          }
      item.price = searchedHotelData.hotels.hotels[i].rooms[0].rates[0].net
      item.ratings = searchedHotelData.hotels.hotels[i].reviews[0].rate
      item.reviewsCount = searchedHotelData.hotels.hotels[i].reviews[0].reviewCount
      item.rateKey = searchedHotelData.hotels.hotels[i].rooms[0].rates[0].rateKey
      item.rateType = searchedHotelData.hotels.hotels[i].rooms[0].rates[0].rateType
      item.taxes =
        searchedHotelData.hotels.hotels[i].rooms[0].rates[0].taxes &&
        searchedHotelData.hotels.hotels[i].rooms[0].rates[0].taxes.taxes &&
        searchedHotelData.hotels.hotels[i].rooms[0].rates[0].taxes.taxes[0].amount
      item.coordinates = data.hotel.coordinates
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
    maxHotels: 8
  }
  query.filter = filter

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

  // let geolocation = {}
  // try {
  //   const params = {
  //     access_key: process.env.geoApiKey,
  //     query: 'Tokyo'
  //   }

  //   const { data } = await axios.get('http://api.positionstack.com/v1/forward', { params })
  //   geolocation.longitude = data.data[0].longitude
  //   geolocation.latitude = data.data[0].latitude
  //   geolocation.radius = 100
  //   geolocation.unit = 'km'
  // } catch (error) {
  //   console.log('error', error)
  // }
  // console.log('geolocation', geolocation)
  // geolocation.longitude && (query.geolocation = geolocation)

  const hotels = {
    hotel: [161485, 180447, 409666, 138002, 83726, 162315, 3319, 109425]
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
      item.code = searchedHotelData.hotels.hotels[i].code
      item.price = searchedHotelData.hotels.hotels[i].rooms[0].rates[0].net
      item.ratings = searchedHotelData.hotels.hotels[i].reviews[0].rate
      item.reviewsCount = searchedHotelData.hotels.hotels[i].reviews[0].reviewCount
      item.image = data.hotel.images.filter(
        (item) => item.type.description.content === 'Room'
      )[0]?.path
      item.country = data.hotel.country.description.content
      item.cancellationPolicies = searchedHotelData.hotels.hotels[i].rooms[0].rates[0]
        .cancellationPolicies
        ? searchedHotelData.hotels.hotels[i].rooms[0].rates[0].cancellationPolicies[0]
        : {
            amount: '0',
            from: 'Anytime'
          }
      item.city = data.hotel.state.name
      item.currency = searchedHotelData.hotels.hotels[i].currency
      item.rateKey = searchedHotelData.hotels.hotels[i].rooms[0].rates[0].rateKey
      item.rateType = searchedHotelData.hotels.hotels[i].rooms[0].rates[0].rateType
      item.taxes =
        searchedHotelData.hotels.hotels[i].rooms[0].rates[0].taxes &&
        searchedHotelData.hotels.hotels[i].rooms[0].rates[0].taxes.taxes &&
        searchedHotelData.hotels.hotels[i].rooms[0].rates[0].taxes.taxes[0].amount
      item.coordinates = data.hotel.coordinates
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
    maxRate: 10000
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

  // let geolocation = {}
  // try {
  //   const params = {
  //     access_key: process.env.geoApiKey,
  //     query: 'New York'
  //   }

  //   const { data } = await axios.get('http://api.positionstack.com/v1/forward', { params })
  //   geolocation.latitude = data.data[0].latitude
  //   geolocation.longitude = data.data[0].longitude
  //   geolocation.radius = 200
  //   geolocation.unit = 'km'
  // } catch (error) {
  //   console.log('error', error)
  // }

  // geolocation.longitude && (query.geolocation = geolocation)

  const hotels = {
    hotel: [6605, 142665, 6638, 35527, 151634]
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
      item.code = searchedHotelData.hotels.hotels[i].code
      item.image = data.hotel.images.filter(
        (item) => item.type.description.content === 'Room'
      )[0]?.path
      item.country = data.hotel.country.description.content
      item.city = data.hotel.state.name
      item.currency = searchedHotelData.hotels.hotels[i].currency
      item.cancellationPolicies = searchedHotelData.hotels.hotels[i].rooms[0].rates[0]
        .cancellationPolicies
        ? searchedHotelData.hotels.hotels[i].rooms[0].rates[0].cancellationPolicies[0]
        : {
            amount: '0',
            from: 'Anytime'
          }
      item.price = searchedHotelData.hotels.hotels[i].rooms[0].rates[0].net
      item.ratings = searchedHotelData.hotels.hotels[i].reviews[0].rate
      item.reviewsCount = searchedHotelData.hotels.hotels[i].reviews[0].reviewCount
      item.rateKey = searchedHotelData.hotels.hotels[i].rooms[0].rates[0].rateKey
      item.rateType = searchedHotelData.hotels.hotels[i].rooms[0].rates[0].rateType
      item.taxes =
        searchedHotelData.hotels.hotels[i].rooms[0].rates[0].taxes &&
        searchedHotelData.hotels.hotels[i].rooms[0].rates[0].taxes.taxes &&
        searchedHotelData.hotels.hotels[i].rooms[0].rates[0].taxes.taxes[0].amount
      item.coordinates = data.hotel.coordinates
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
    maxRate: 200
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

  // let geolocation = {}
  // try {
  //   const params = {
  //     access_key: process.env.geoApiKey,
  //     query: 'London'
  //   }

  //   const { data } = await axios.get('http://api.positionstack.com/v1/forward', { params })
  //   geolocation.latitude = data.data[0].latitude
  //   geolocation.longitude = data.data[0].longitude
  //   geolocation.radius = 20
  //   geolocation.unit = 'km'
  // } catch (error) {
  //   console.log('error', error)
  // }
  // geolocation.longitude && (query.geolocation = geolocation)

  const hotels = {
    hotel: [376663, 85265, 105915, 417480]
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
      item.code = searchedHotelData.hotels.hotels[i].code
      item.image = data.hotel.images.filter(
        (item) => item.type.description.content === 'Room'
      )[0]?.path
      item.country = data.hotel.country.description.content
      item.city = data.hotel.state.name
      item.cancellationPolicies = searchedHotelData.hotels.hotels[i].rooms[0].rates[0]
        .cancellationPolicies
        ? searchedHotelData.hotels.hotels[i].rooms[0].rates[0].cancellationPolicies[0]
        : {
            amount: '0',
            from: 'Anytime'
          }
      item.price = searchedHotelData.hotels.hotels[i].rooms[0].rates[0].net
      item.ratings = searchedHotelData.hotels.hotels[i].reviews[0].rate
      item.reviewsCount = searchedHotelData.hotels.hotels[i].reviews[0].reviewCount
      item.currency = searchedHotelData.hotels.hotels[i].currency
      item.rateKey = searchedHotelData.hotels.hotels[i].rooms[0].rates[0].rateKey
      item.rateType = searchedHotelData.hotels.hotels[i].rooms[0].rates[0].rateType
      item.taxes =
        searchedHotelData.hotels.hotels[i].rooms[0].rates[0].taxes &&
        searchedHotelData.hotels.hotels[i].rooms[0].rates[0].taxes.taxes &&
        searchedHotelData.hotels.hotels[i].rooms[0].rates[0].taxes.taxes[0].amount
      item.coordinates = data.hotel.coordinates
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

export const isBookable = async (req, res) => {
  const { rateKey } = req.body
  const rooms = []
  rooms.push({ rateKey: rateKey })
  let url = `${process.env.hotelBookingApi_ENDPOINT}checkrates`
  try {
    const { data } = await axios.post(url, rooms)
    return res.json(data)
  } catch (error) {
    res.json({ error: error.message })
  }
}

export const booking = async (req, res) => {
  const { holder, rateKey, clientReference } = req.body
  let url = `${process.env.hotelBookingApi_ENDPOINT}bookings`
  const query = {}
  query.holder = holder
  query.rooms = [
    {
      rateKey: rateKey
    }
  ]
  query.clientReference = clientReference
  try {
    const { data } = await axios.post(url, query)
    return res.json(data)
  } catch (error) {
    res.json({ error: error.message })
  }
}
