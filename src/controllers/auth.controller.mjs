import bcrypt from 'bcryptjs'
const { compareSync, hashSync } = bcrypt
import { unlinkSync } from 'fs'
import { createTransport, getTestMessageUrl } from 'nodemailer'

import User from '../schemas/User.mjs'
import Answer from '../schemas/Answer.mjs'
import Document from '../schemas/Document.mjs'

import uploader from '../utils/imageUpload.mjs'
import { smtp } from '../config/config.mjs'

const saltRounds = 10

export const login = async (req, res) => {
  let response = await User.findOne({
    where: {
      email: req.body.email
    }
  })
  if (response !== null) {
    let password = compareSync(req.body.password, response.password)
    if (password === false) {
      res.json('error')
    } else {
      res.json(response)
    }
  } else {
    res.json('error')
  }
}

export const signup = async (req, res) => {
  let response = await User.findOne({
    where: {
      email: req.body.email
    }
  })
  if (response != null) {
    return res.json({
      success: false,
      message: 'This email is already in use, try sign-in'
    })
  } else {
    let password = req.body.password
    if (password.length > 8) {
      const hash = hashSync(req.body.password, saltRounds)
      if (req.body.password === req.body.confirmPassword) {
        let userData = await User.create({
          username: req.body.username,
          email: req.body.email,
          password: hash
        })
        return res.json({
          success: true,
          message: '',
          id: userData.id
        })
      } else {
        return res.json({
          success: false,
          message: 'Passwords field do not match!'
        })
      }
    } else {
      return res.json({
        success: false,
        message: 'Password field lenght is less than 8 characters!'
      })
    }
  }
}

export const uploadProfile = async (req, res) => {
  let response = await uploader.upload(req.file.path, {
    public_id: 'avatar_' + req.body.userId,
    folder: 'avatar',
    width: 500,
    height: 500,
    crop: 'fill'
  })
  unlinkSync(req.file.path)
  if (response === null) {
    return res.json({
      success: false,
      message: 'Error: Try to upload image again'
    })
  } else {
    await User.updateOne(
      {
        avatar_url: response.secure_url,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        birthDay: req.body.birthDay,
        phone: req.body.phone
      },
      {
        where: {
          id: req.body.userId
        }
      }
    )
    return res.json({
      success: true,
      message: '',
      avatar_url: response.secure_url
    })
  }
}

export const step1 = async (req, res) => {
  let response = await User.updateOne(
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      birthDay: req.body.birthDay,
      phone: req.body.phone
    },
    {
      where: {
        id: req.body.userId
      }
    }
  )
  if (response === null) {
    return res.json({
      success: false,
      message: 'Error: Try again'
    })
  } else {
    return res.json({
      success: true,
      message: ''
    })
  }
}

export const uploadDocuement = async (req, res) => {
  let response = await uploader.upload(req.file.path, {
    public_id: 'document_' + req.body.id,
    folder: 'documents',
    width: 500,
    height: 500,
    crop: 'fill'
  })
  unlinkSync(req.file.path)
  if (response === null) {
    return res.json({
      success: false,
      message: 'Error: Try to upload image again'
    })
  } else {
    await User.updateOne(
      {
        addressL1: req.body.addressL1,
        addressL2: req.body.addressL1,
        state: req.body.state,
        city: req.body.city,
        postal: req.body.postal,
        documentUrl: response.secure_url
      },
      {
        where: {
          id: req.body.id
        }
      }
    )
    return res.json({
      success: true,
      message: ''
    })
  }
}

export const step2 = async (req, res) => {
  let response = await User.updateOne(
    {
      addressL1: req.body.addressL1,
      addressL2: req.body.addressL2,
      state: req.body.state,
      city: req.body.city,
      postal: req.body.postal
    },
    {
      where: {
        id: req.body.id
      }
    }
  )
  if (response === null) {
    return res.json({
      success: false,
      message: 'Error: Try again'
    })
  } else {
    return res.json({
      success: true,
      message: ''
    })
  }
}

export const step3 = async (req, res) => {
  let response = await Answer.create({
    question1: req.body.question1,
    answer1: req.body.answer1,
    question2: req.body.question2,
    answer2: req.body.answer2,
    userId: req.body.id
  })
  if (response === null) {
    return res.json({
      success: false,
      message: 'Error: Try again'
    })
  } else {
    return res.json({
      success: true,
      message: ''
    })
  }
}

export const step4 = async (req, res) => {
  let resp = await Document.findOne({
    where: { userId: req.body.id }
  })

  let response = null

  if (resp === null) {
    response = await document.create({
      userId: req.body.id,
      typeOfId: req.body.typeOfId,
      countryOfIssue: req.body.countryOfIssue,
      issueDate: req.body.issueDate,
      expireDate: req.body.expireDate,
      number: req.body.number
    })
  } else {
    response = await Document.updateOne({
      typeOfId: req.body.typeOfId,
      countryOfIssue: req.body.countryOfIssue,
      issueDate: req.body.issueDate,
      expireDate: req.body.expireDate,
      number: req.body.number,
      where: {
        userId: req.body.id
      }
    })
  }
  if (response === null) {
    return res.json({
      success: false,
      message: 'Error: Try again'
    })
  } else {
    return res.json({
      success: true,
      message: ''
    })
  }
}

export const step4UploadId = async (req, res) => {
  let response = await uploader.upload(req.file.path, {
    public_id: 'id_' + req.body.id,
    folder: 'documents',
    width: 500,
    height: 500,
    crop: 'fill'
  })
  unlinkSync(req.file.path)
  if (response === null) {
    return res.json({
      success: false,
      message: 'Error: Try to upload image again'
    })
  } else {
    let resp = await Document.findOne({
      where: { userId: req.body.id }
    })
    if (resp != null) {
      await Document.updateOne(
        {
          typeOfId: req.body.typeOfId,
          countryOfIssue: req.body.countryOfIssue,
          issueDate: req.body.issueDate,
          expireDate: req.body.expireDate,
          number: req.body.number,
          url: response.secure_url
        },
        {
          where: {
            userId: req.body.id
          }
        }
      )
    } else {
      await document.create({
        userId: req.body.id,
        typeOfId: req.body.typeOfId,
        countryOfIssue: req.body.countryOfIssue,
        issueDate: req.body.issueDate,
        expireDate: req.body.expireDate,
        number: req.body.number,
        url: response.secure_url
      })
    }
    return res.json({
      success: true,
      message: ''
    })
  }
}

async function sendEmail(to, subject, text, html) {
  let transporter = createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure, // true for 465, false for other ports
    auth: {
      user: smtp.user, // generated ethereal user
      pass: smtp.pass // generated ethereal password
    }
  })

  // send mail with defined transport object
  let info = transporter.sendMail({
    from: 'support@mazag.com.br', // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    text: text,
    html: html
  })
  console.log('Message sent: %s', info.messageId)
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log('Preview URL: %s', getTestMessageUrl(info))
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...*/
}

export const generateCode = async (req, res) => {
  let max = 9999
  let min = 1000
  let code = Math.floor(Math.random() * (max - min)) + min
  let response = await User.updateOne(
    {
      code: code
    },
    { where: { id: req.body.id } }
  )
  let resp = await User.findOne({
    where: { id: req.body.id }
  })
  let subject = 'UHR - Activation Code'
  let text =
    'Thank you for joining UHR! Your verification code is: ' +
    code +
    '. Find out more about how UHR app works by visiting our website www.uhrewards.com. If you have any questions, suggestions or comments, please send us an email at support@uhrewards.com'
  let html =
    '<div style="text-align: center;"><h1 style="color: #1B4298;font-weight: bold;text-align: center;font-size: 30px;">Success</h1><br><img style="text-align: center;" src="https://res.cloudinary.com/uhr-app/image/upload/v1648859792/logo.png"/><p style="color: #1B4298;text-align: center;font-size: 16px;">Thank you for joining UHR!<br>Your verification code is: <br><span style="color: #1B4298;font-weight: bold;text-align: center;font-size: 18px;">' +
    code +
    '</span></p><p style="color: #1B4298;text-align: center;font-size: 16px;">Find out more about how UHR app <br>works by visiting our website<br><a style="font-weight: bold;" href="https://www.uhrewards.com" target="_blank">www.uhrewards.com</a></p><p style="color: #1B4298;text-align: center;font-size: 16px;">If you have any questions, suggestions <br>or comments, please send us an email at <br><span style="font-weight: bold;">support@uhrewards.com</span></p></div>'

  sendEmail(resp.email, subject, text, html)
  return res.json({
    success: true,
    message: 'A code was sent successfully. Please, check your code.'
  })
}

export const verifyCode = async (req, res) => {
  let id = req.body.id
  let response = await User.findOne({
    where: { id: id, code: req.body.code }
  })
  if (response != null) {
    await User.updateOne(
      {
        actived: 1
      },
      {
        where: {
          id: id
        }
      }
    )
    return res.json({
      success: true,
      message: ''
    })
  } else {
    return res.json({
      success: false,
      message: 'Invalid Code!'
    })
  }
}

export const forgotPassword = async (req, res) => {
  let resp = await User.findOne({
    where: { email: req.body.email }
  })

  if (resp != null) {
    let id = resp.id
    let max = 999999
    let min = 100000
    let newPass = Math.floor(Math.random() * (max - min)) + min
    const hash = hashSync(newPass.toString(), saltRounds)

    let response = await User.updateOne(
      {
        password: hash
      },
      { where: { id: id } }
    )

    let to = resp.email // list of receivers
    let subject = 'UHR - Password Recovery' // Subject line
    let text =
      'Your New password is: ' +
      newPass +
      '. Find out more about how UHR app works by visiting our website www.uhrewards.com. If you have any questions, suggestions or comments, please send us an email at support@uhrewards.com' // plain text body
    let html =
      '<div style="text-align: center;"><h1 style="color: #1B4298;font-weight: bold;text-align: center;font-size: 30px;">Password recovery</h1><br><img style="text-align: center;" src="https://res.cloudinary.com/uhr-app/image/upload/v1648859792/logo.png"/><p style="color: #1B4298;text-align: center;font-size: 16px;">Thank you for joining UHR!<br>Your new password is: <br><span style="color: #1B4298;font-weight: bold;text-align: center;font-size: 18px;">' +
      newPass +
      '</span></p><p style="color: #1B4298;text-align: center;font-size: 16px;">Find out more about how UHR app <br>works by visiting our website<br><a style="font-weight: bold;" href="https://www.uhrewards.com" target="_blank">www.uhrewards.com</a></p><p style="color: #1B4298;text-align: center;font-size: 16px;">If you have any questions, suggestions <br>or comments, please send us an email at <br><span style="font-weight: bold;">support@uhrewards.com</span></p></div>' // html body

    sendEmail(to, subject, text, html)
    return res.json({
      success: true,
      message: 'A new password was sent successfully. Please, check your email.'
    })
  } else {
    return res.json({
      success: false,
      message: 'Account not found!'
    })
  }
}
