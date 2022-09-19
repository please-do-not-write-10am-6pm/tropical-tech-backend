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

hotelRouter.get('/hotels', getAll)
hotelRouter.get('/hotel/details/:id', getHotelById)
hotelRouter.get('/hotel/rate/:id', getHotelRateById)
hotelRouter.get('/hotels/facilities/:id', getHotelFacilitiesById)
hotelRouter.get('/hotels/test/:id', getHotelTestById)
hotelRouter.get('/hotels/mostpopular', getMostPopularHotels)
hotelRouter.get('/hotels/upcoming', getUpcomingHotels)
