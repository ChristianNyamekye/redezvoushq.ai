const fetch = require('node-fetch')

exports.handler = async function (event, context) {
  const webhookUrl = process.env.ZAPIER_WEBHOOK_URL

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    }
  }

  const { email } = JSON.parse(event.body)

  // Basic email validation
  if (!email || !email.match(/^[^ ]+@[^ ]+\.[a-z]{2,3}$/)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid email address' }),
    }
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to send email')
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email successfully submitted' }),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    }
  }
}
