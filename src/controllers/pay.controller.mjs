import Stripe from 'stripe'
import { createHash } from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

const stripe = Stripe(process.env.stripeApi_PUBLICKEY)
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

export const pay = async (req, res) => {
  let charge = await stripe.charges.retrieve('ch_3KpaQ4DMJvdygIVH0w1VFTsP', {
    apiKey: process.env.stripeApi_SECRETKEY
  })

  const paymentMethod = await stripe.paymentMethods.create({
    type: 'card',
    card: {
      number: '4242424242424242',
      exp_month: 4,
      exp_year: 2023,
      cvc: '314'
    }
  })

  const customer = await stripe.customers.create({
    description: 'My First Test Customer 123'
  })

  const paymentIntent = await stripe.paymentIntents.create({
    customer: '{{CUSTOMER_ID}}',
    currency: 'brl',
    amount: 150,
    payment_method_types: ['card'],
    setup_future_usage: 'on_session'
  })

  const { id } = req.params

  const url = `https://demoapi.domain.com`

  try {
    const { data } = await axios.get(url, options)
    return res.json(data)
  } catch (error) {
    res.json({ error: error.message })
  }
}
