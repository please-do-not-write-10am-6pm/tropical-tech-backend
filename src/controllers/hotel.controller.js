import axios from 'axios'
import { createHash } from 'crypto'

const utcDate = Math.floor(new Date().getTime() / 1000)
const publicKey = process.env.hotelApi_PUBLICKEY
const privateKey = process.env.hotelApi_PRIVATEKEY
const assemble = publicKey + privateKey + utcDate
const hash = createHash('sha256').update(assemble).digest('hex')

const options = {
  headers: {
    'Api-key': publicKey,
    secret: privateKey,
    'X-Signature': hash
  }
}

const mostPopular = {
  method: 'POST',
  headers: {
    'Api-key': publicKey,
    secret: privateKey,
    'X-Signature': hash
  },
  body: {
    stay: {
      checkIn: '2022-09-18',
      checkOut: '2022-09-19'
    },
    occupancies: [
      {
        rooms: 1,
        adults: 1,
        children: 0
      }
    ],

    reviews: [
      {
        type: 'HOTELBEDS',
        maxRate: 5,
        minRate: 1,
        minReviewCount: 3
      }
    ]
  }
}

export const getAll = async (req, res) => {
  const url = `${process.env.hotelApi_ENDPOINT}hotels`
  try {
    const { data } = await axios.get(url, options)
    return res.json(data)
  } catch (error) {
    res.json({ error: error.message })
  }
}

export const getHotelById = async (req, res) => {
  const { id } = req.params
  const url = `${process.env.hotelApi_ENDPOINT}hotels/${id}/details`
  try {
    const { data } = await axios.get(url, options)
    return res.json(data)
  } catch (error) {
    res.json({ error: error.message })
  }
}

export const getHotelRateById = async (req, res) => {
  const { id } = req.params
  const url = `${process.env.hotelApi_ENDPOINT}hotel-content-api/1.0/types/ratecommentdetails?date=2022-01-01&code=${id}`
  try {
    const { data } = await axios.get(url, options)
    return res.json(data)
  } catch (error) {
    res.json({ error: error.message })
  }
}

export const getHotelFacilitiesById = async (req, res) => {
  const { id } = req.params
  let url = `${process.env.hotelApi_ENDPOINT}hotels?code=${id}`
  try {
    const { data } = await axios.get(url, options)
    return res.json(data)
  } catch (error) {
    res.json({ error: error.message })
  }
}

export const getHotelTestById = async (req, res) => {
  const { id } = req.params
  let url = `${process.env.hotelApi_ENDPOINT}hotels/${id}/details`
  try {
    const { data } = await axios.get(url, options)
    return res.json(data)
  } catch (error) {
    res.json({ error: error.message })
  }
}

export const getMostPopularHotels = async (req, res) => {
  let url = `${process.env.hotelApi_ENDPOINT}hotels`
  try {
    const { data } = await axios.get(url, mostPopular)
    return res.json(data)
  } catch (error) {
    res.json({ error: error.message })
  }
}

export const getUpcomingHotels = async (req, res) => {
  let url = `${process.env.hotelApi_ENDPOINT}hotels`
  try {
    const { data } = await axios.get(url, options)
    return res.json(data)
  } catch (error) {
    res.json({ error: error.message })
  }
}
