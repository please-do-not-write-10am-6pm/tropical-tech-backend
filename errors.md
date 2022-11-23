# Error report

## Description

### There is two way to search hotels, One is to select the hotel numbers and the other is to select the hotel area. However, if you select hotel numbers, a response returns, but if you select a hotel area, 500 is returned. When searching by hotel area, keep in mind that you must convert the longitude and latitude, not send the area name as it is. So, as a service to convert longitude and latitude, I used the positionstack[http://api.positionstack.com/v1/forward]. It works well. But the strange thing is that we can search for hotels in New York City. Specific queries and responses are listed below.

- when hotel numbers query is selected, it's working.

ex:
request query: {
"stay": { "checkIn": '2022-11-22', "checkOut": '2022-11-24' },
"occupancies": [ { "rooms": 1, "adults": 1, "children": 0 } ],
"filter": { "maxHotels": 4, "minRate": 2000, "maxRate": 10000 },
"reviews": [ { "type": 'HOTELBEDS', "maxRate": 5, "minRate": 1, "minReviewCount": 3 } ],
"hotels": { "hotel": [ 6605, 142665, 6638, 35527, 151634 ] } // when the hotels query is selected
}

response: [
{
"name": "YOTEL New York",
"code": 142665,
"image": "14/142665/142665a_hb_ro_040.jpg",
"country": "United States",
"city": "NEW YORK",
"currency": "EUR",
"cancellationPolicies": {
"amount": "1038.24",
"from": "2022-11-21T23:59:00-05:00"
},
"price": "2113.53",
"ratings": 4.28,
"reviewsCount": 131,
"rateKey": "20221122|20221124|W|254|142665|SUI.GD-SU|BAR FLEX|RO||1~1~0||N@06~~213991~-936145440~N~~~NOR~32D613E8FA1E4BC166912939477600AAUK00000040001000106235841",
"rateType": "BOOKABLE",
"taxes": "166.38",
"coordinates": {
"longitude": -73.99545610000001,
"latitude": 40.7591568
},
"from": "2022-11-22",
"to": "2022-11-24"
},
{
"name": "Amazonia Estoril Hotel",
"code": 35527,
"image": "03/035527/035527a_hb_ro_031.jpg",
"country": "Portugal",
"city": "LISBOA Y SETUBAL",
"currency": "EUR",
"cancellationPolicies": {
"amount": "2068.50",
"from": "2022-11-21T23:59:00Z"
},
"price": "2068.50",
"ratings": 4.14,
"reviewsCount": 5,
"rateKey": "20221122|20221124|W|59|35527|DBT.ST|CGW-NET-BB|BB||1~1~0||N@06~~24b8c7~-2106098456~N~~~NOR~32D613E8FA1E4BC166912939477600AAUK00000040001000106232814",
"rateType": "BOOKABLE",
"taxes": "4.00",
"coordinates": {
"longitude": -9.40029636025429,
"latitude": 38.707540276168
},
"from": "2022-11-22",
"to": "2022-11-24"
},
{
"name": "The Langham London",
"code": 6638,
"image": "00/006638/006638a_hb_ro_030.jpg",
"country": "United Kingdom",
"city": "UNITED KINGDOM",
"currency": "EUR",
"cancellationPolicies": {
"amount": "2142.72",
"from": "2022-11-21T23:59:00Z"
},
"price": "2142.72",
"ratings": 4.73,
"reviewsCount": 7,
"rateKey": "20221122|20221124|W|164|6638|DBL.EJ|BAR-NRF|RO||1~1~0||N@06~~2049a0~1987070164~N~~~NRF~32D613E8FA1E4BC166912939477600AAUK0000004000100010624885e",
"rateType": "BOOKABLE",
"coordinates": {
"longitude": -0.143878,
"latitude": 51.517796
},
"from": "2022-11-22",
"to": "2022-11-24"
},
{
"name": "Royal Lancaster London",
"code": 6605,
"image": "00/006605/006605a_hb_ro_159.jpg",
"country": "United Kingdom",
"city": "UNITED KINGDOM",
"currency": "EUR",
"cancellationPolicies": {
"amount": "1054.06",
"from": "2022-11-21T23:59:00Z"
},
"price": "2121.05",
"ratings": 4.35,
"reviewsCount": 26,
"rateKey": "20221122|20221124|W|164|6605|SUI.ST|BAR BB|BB||1~1~0||N@06~~23a9b4~2047552799~N~~~NOR~32D613E8FA1E4BC166912939477600AAUK00000040001000106205849",
"rateType": "BOOKABLE",
"coordinates": {
"longitude": -0.174996703863144,
"latitude": 51.5123911907502
},
"from": "2022-11-22",
"to": "2022-11-24"
}
]

- but when the hotel area is selected, it's not working.

request query: {
stay: { checkIn: '2022-11-22', checkOut: '2022-11-24' },
occupancies: [ { rooms: 1, adults: 1, children: 0 } ],
filter: { maxHotels: 4, minRate: 2000, maxRate: 10000 },
reviews: [ { type: 'HOTELBEDS', maxRate: 5, minRate: 1, minReviewCount: 3 } ],
geolocation: { latitude: 25.12148, longitude: 55.297615, radius: 200, unit: 'km' }
}

response: 500 error.
