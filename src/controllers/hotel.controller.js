import axios from 'axios'
import { createHash } from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

const utcDate = Math.floor(new Date().getTime() / 1000)
const publicKey = process.env.hotelApi_PUBLICKEY
const privateKey = process.env.hotelApi_PRIVATEKEY
const assemble = publicKey + privateKey + utcDate
const hash = createHash('sha256').update(assemble).digest('hex')

axios.interceptors.request.use(
  (config) => {
    if (publicKey && privateKey && hash) {
      // config.headers['Content-Type'] = 'application/json'
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
  const url = `${process.env.hotelBookingApi_ENDPOINT}hotels`
  let query = {}

  const stay = {
    checkIn: '2022-09-22',
    checkOut: '2022-09-23'
  }
  query.stay = stay

  const occupancies = [
    {
      rooms: 1,
      adults: 2,
      children: 0
    }
  ]
  query.occupancies = occupancies

  const hotels = { hotel: [1, 2, 3, 4, 5, 6, 78, 9, 7, 8, 10, 11, 77, 168, 264, 100, 113, 393] }
  query.hotels = hotels

  const rooms = {
    included: true,
    room: ['DBT.ST']
  }
  query.rooms = rooms

  const reviews = [
    {
      type: 'HOTELBEDS',
      maxRate: 5,
      minRate: 1,
      minReviewCount: 3
    }
  ]
  query.reviews = reviews

  const filter = {
    // minRate: 10,
    // maxRate: 1700,
    // minCategory: 3,
    // maxCategory: 5,
    maxRooms: 3,
    maxRatesPerRoom: 3
    // packaging: true,
    // hotelPackage: 'YES'
    // contract: 'CG-FIT B2B'
  }
  query.filter = filter

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
      item.from = searchedHotelData.hotels.hotels[i].checkIn
      item.to = searchedHotelData.hotels.hotels[i].checkOut
      response.push(item)
      // item.ratings =  // get from hotel database
      // item.reviews = // get from hotel database
      // item.location = { lat: data.hotels.hotels[i].latitude, lon: data.hotels.hotels[i].longitude }
      // item.beds = data.hotels.hotels[i].rooms.length
      // item.value = data.hotels.hotels[i].rooms[1].rates[1].net
      // item.taxesAndChargesInclude = data.hotels.hotels[i].rooms[1].rates[1].taxes.allIncluded
      // item.freeCancellation =
      //   data.hotels.hotels[i].rooms[1].rates[1].cancellationPolicies[1].amount ===
      //   data.hotels.hotels[i].rooms[1].rates[1].net
      //     ? true
      //     : false
      // item.noPrepaymentNeeded =
      //   data.hotels.hotels[i].rooms[1].rate[1].paymentType === 'AT_WEB' ? false : true
      // item.currency = data.hotels.hotels[i].currency
      // item.description = data.hotels[i].description
    }

    return res.json(response)
  } catch (error) {
    // console.error('catch', error)
    res.json({ error: error.message })
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
  let url = `${process.env.hotelContentApi_ENDPOINT}hotels`
  try {
    const { data } = await axios.get(url)
    const response = []

    for (let i = 0; i < 10; i++) {
      const item = {}
      item.name = data.hotels[i].name.content
      item.image = data.hotels[i].images[1].path
      // item.ratings =  // get from Rating database
      // item.reviews = // get from hotel database
      item.location = data.hotels[i].coordinates
      item.beds = data.hotels[i].rooms.length
      // item.value =  // get from
      // item.taxesAndChargesInclude = data[i].
      // item.freeCancellation = data[i].
      // item.noPrepaymentNeeded = data[i].
      item.city = data.hotels[i].city.content
      item.country = data.hotels[i].address.street
      // item.from =
      // item.to =
      item.description = data.hotels[i].description
      response.push(item)
    }

    return res.json(response)
  } catch (error) {
    res.json({ error: error.message })
  }
}

export const getUpcomingHotels = async (req, res) => {
  let url = `${process.env.hotelContentApi_ENDPOINT}hotels`
  try {
    const { data } = await axios.get(url)
    return res.json(data)
  } catch (error) {
    res.json({ error: error.message })
  }
}
