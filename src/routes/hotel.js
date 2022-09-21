import { Router } from 'express'

import {
  getAll,
  getHotelById,
  getHotelRateById,
  getHotelFacilitiesById,
  getHotelTestById,
  getMostPopularHotels,
  getUpcomingHotels
} from '../controllers/hotel.controller'

const hotelRouter = Router()

hotelRouter.post('/', getAll)
hotelRouter.get('/:id/details', getHotelById)
hotelRouter.get('/:id/rate', getHotelRateById)
hotelRouter.get('/:id/facilities', getHotelFacilitiesById)
hotelRouter.get('/:id/test', getHotelTestById)
hotelRouter.get('/mostpopular', getMostPopularHotels)
hotelRouter.get('/upcoming', getUpcomingHotels)

export default hotelRouter
