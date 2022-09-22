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
  getBestDealHotels
} from '../controllers/hotel.controller'

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

export default hotelRouter
