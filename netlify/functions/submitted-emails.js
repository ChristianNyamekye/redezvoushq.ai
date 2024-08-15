// exports.handler = async function (event, context) {
//   // Import node-fetch inside the handler
//   const fetch = await (async () => (await import('node-fetch')).default)()

//   if (event.httpMethod !== 'POST') {
//     return {
//       statusCode: 405,
//       body: 'Method Not Allowed',
//     }
//   }

//   let email
//   try {
//     // Parse the form data
//     const querystring = require('querystring')
//     const parsedBody = querystring.parse(event.body)
//     email = parsedBody.email

//     // Log the email to the console for debugging
//     console.log('Parsed email:', email)
//   } catch (error) {
//     return {
//       statusCode: 400,
//       body: JSON.stringify({ error: 'Invalid form input' }),
//     }
//   }

//   // Basic email validation
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//   if (!email || !emailRegex.test(email)) {
//     console.log('Invalid email format:', email)
//     return {
//       statusCode: 400,
//       body: JSON.stringify({ error: 'Invalid email address' }),
//     }
//   }

//   try {
//     const webhookUrl = process.env.ZAPIER_WEBHOOK_URL

//     const response = await fetch(webhookUrl, {
//       method: 'POST',
//       body: JSON.stringify({ email }),
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     })

//     if (!response.ok) {
//       throw new Error('Failed to send email')
//     }

//     return {
//       statusCode: 200,
//       body: JSON.stringify({ message: 'Email successfully submitted' }),
//     }
//   } catch (error) {
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: 'Internal Server Error' }),
//     }
//   }
// }

require('dotenv').config()
const fetch = require('node-fetch')

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    }
  }

  let email
  try {
    const querystring = require('querystring')
    const parsedBody = querystring.parse(event.body)
    email = parsedBody.email

    console.log('Parsed email:', email)
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
        },
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to add email to Notion')
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
