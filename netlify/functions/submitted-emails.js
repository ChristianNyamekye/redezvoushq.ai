require('dotenv').config()
const fetch = require('node-fetch')
const querystring = require('querystring')

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    }
  }

  console.log('Event received:', JSON.stringify(event))
  let email, dateTime, formType

  try {
    // Parse the form data (URL-encoded)
    const parsedBody = querystring.parse(event.body)
    email = parsedBody.email
    dateTime = parsedBody.dateTime
    formType = parsedBody.formType

    // Log the parsed email, date/time, and form type for debugging
    console.log(
      'Parsed email:',
      email,
      'Parsed dateTime:',
      dateTime,
      'Form type:',
      formType
    )
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid form input' }),
    }
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    console.log('Invalid email format:', email)
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid email address' }),
    }
  }

  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DATABASE_ID },
        properties: {
          Email: {
            title: [
              {
                text: {
                  content: email,
                },
              },
            ],
          },
          DateTime: {
            date: {
              start: dateTime, // Send the dateTime as a date property
            },
          },
          FormType: {
            rich_text: [
              {
                text: {
                  content: formType, // Send the formType as rich_text
                },
              },
            ],
          },
        },
      }),
    })

    const responseBody = await response.text()
    console.log('Notion API Response:', responseBody)

    if (!response.ok) {
      throw new Error(`Failed to add email to Notion: ${response.statusText}`)
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email successfully submitted' }),
    }
  } catch (error) {
    console.error('Error submitting to Notion:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    }
  }
}
