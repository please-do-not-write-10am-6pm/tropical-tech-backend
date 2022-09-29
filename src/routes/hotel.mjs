import { Router } from 'express'

import {
  getAll,
  getHotelById,
  getHotelRateById,
  getHotelFacilitiesById,
  getHotelTestById,
  getMostPopularHotels,
  getRecentSearchedHotels,
  getDestinationIdeaHotels,
  getBestDealHotels,
  isBookable,
  booking
} from '../controllers/hotel.controller.mjs'

const hotelRouter = Router()

hotelRouter.post('/', getAll)
hotelRouter.get('/:id/details', getHotelById)
hotelRouter.get('/:id/rate', getHotelRateById)
hotelRouter.get('/:id/facilities', getHotelFacilitiesById)
hotelRouter.get('/:id/test', getHotelTestById)
hotelRouter.get('/mostpopular', getMostPopularHotels)
hotelRouter.get('/recentsearch', getRecentSearchedHotels)
hotelRouter.get('/destinationideas', getDestinationIdeaHotels)
hotelRouter.get('/bestdeal', getBestDealHotels)
hotelRouter.post('/isBookable', isBookable)
hotelRouter.post('/bookings', booking)

export default hotelRouter
