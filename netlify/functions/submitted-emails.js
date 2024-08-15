const { default: fetch } = await import('node-fetch')
const querystring = require('querystring')

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    }
  }

  let email
  try {
    // Parse the form data
    const parsedBody = querystring.parse(event.body)
    email = parsedBody.email
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid form input' }),
    }
  }

  // Basic email validation
  if (!email || !email.match(/^[^ ]+@[^ ]+\.[a-z]{2,3}$/)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid email address' }),
    }
  }

  try {
    const webhookUrl = process.env.ZAPIER_WEBHOOK_URL

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
