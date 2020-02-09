'use strict';

const functions = require('firebase-functions');
const {google} = require('googleapis');
const {WebhookClient} = require('dialogflow-fulfillment');

// calendar ID and service account JSON below.
const calendarId = '5hbtlv3fdivilaue6r56i8n7pg@group.calendar.google.com'; 

const serviceAccount = {
  "type": "service_account",
  "project_id": "challenge-3cd47",
  "private_key_id": "0a58fac2c645293b14e8f72c77b3ad3b60aabcb3",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCXRjFk+LNqdr9P\n4czGhaI1517UBEVqa+Xdv7Z9YaEwaH1mE6tebj+y0WUgaGyd7vLr2dYEiMWLV+DT\n/OBvamjs7MQ+U9bTZAJ4K9W6MloBOxtPW/vAf+6fPtJEa2qYZLXBrxuOx7wJemGD\nI5W5oaa2FPwn1wXYmkPgVYImvAElSOSmfV+ZCXUapW2W68kkCwirrwn0qhdU2Ybe\n7U6Mbf6GTqn8Cfw9KHa5xGAwQfdwpr7xpVV57HVthWGVchrJeyPYpV8q848c7lpq\nrxXF7t8WAZnWRhu64YRaYPCmsIrvka7GSSX7OjLwU/phPqXh/i4If+Mhh8nzVBVv\nNJYDbElpAgMBAAECggEAO4K7r9M/EeUBQjW8T2UG+Vm6LoI3pLQpy+C9s/mSZe7V\nVjDqu813dat2sxchk8gK/MnHriT4QeciZYMX7/zWpk5GrZZh7utrJUdpX0Srr8xG\n5CN1mLc7cp5OLehsGOOVtUpj9vmQedIRRnvbTRnQ8dSzliC7Bgk6Jqi8+OwBL18w\nm1F5k7MZkH++iBN51MAMSZYqt+yT/YRvgz/jHCkIKZzFhsh8dZVh+AO+cRUmA4dZ\n9KiJwbBtkmjXYLV+n9UffElmXNtStWX8QE7PDSn7zKBZythiMyumnyjUPSdGoRfb\nHK+IbJ2lPOyKl5WpmDWJatF0g12ubyZrwfB+M8ZbuQKBgQDR+G643bZvpLMjEQMM\nMt3A4gcjJC5dlkhl+e+v1pUJyMhEx9LGhawwlZoH/V3fP0lipt7xZZ5hLSzMJOIs\nwnHlyKQIgJwGfa1RT1duDFJhUbwyJuw4d9tYaEmUYvTL6+Ktn0ffD3DTtTR4R1Fy\nlVtqDPra+YbhPKC0Myk00SKUzwKBgQC4b7g3gr1keCNFx1LxpSiVXCFGkpw3JuGL\n5Zy+vfz6CUbvYtL9apLlytLNZba54GgW4quOu9ocZ66napiOHbemOlXe/l4hkUlR\n90StL725sc0JXRMFZ07B+JIYB6U6eRWIlYhiqY6IImvAQhQcqV2AcGt67pwRZWj6\nzJgjNuO8RwKBgFROVdawXvIQxUSNLhYVzmgF2SvI+TzmfIdFhXGqzQiyr4a+XOkM\n/wg66S/QEYLz3DlaGyX90UvfYZ9OJ+ok4KqMlyA602rfx1lgbBBpriIZOWFBs5Mw\nvMeQiAqmePfv7IId9DOh9YFrvneU2yUQxzWbpJWLnxaMy1HPQPpOBn6NAoGARets\njfbNb+IvlQt8gUlYek8D+mooOKxPwyZX5uPFnNCZiLURQar+Z4kdo2pU/GB7dXmX\nCjRi+nO//Y3mqbHQZn8lALWz38vhXOZ9rZ40scoa7drQFDNW4ygl0mBLnkA7Dp2J\np8WZ2DgcWzVxxG/cl42G4YLFvb6RLssTPf5YFY8CgYAQH8+NoHwBiiFFU3m7kYrP\nP0uQyhJY7jJy59RBZNLz2Aa5pXdijgE1CVqw2iFuxB5t3x/H6oqv8PPpjMkcP3rn\nKJHjKL1tiUipxUYaNJfmJncDn1FoDIZtqnT6pNe7Avk/iGCbms/MdwIBX/rbjoT9\nFtEXukePHjYXFc1rdfcKqw==\n-----END PRIVATE KEY-----\n",
  "client_email": "challenge-calendar@challenge-3cd47.iam.gserviceaccount.com",
  "client_id": "116917944307469439496",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/challenge-calendar%40challenge-3cd47.iam.gserviceaccount.com"
};


// Google Calendar service account credentials
const serviceAccountAuth = new google.auth.JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: 'https://www.googleapis.com/auth/calendar'
});

const calendar = google.calendar('v3');
process.env.DEBUG = 'dialogflow:*'; // It enables lib debugging statements

const timeZone = 'America/Los_Angeles';  // Change it to your time zone
const timeZoneOffset = '-07:00';         // Change it to your time zone offset

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });

  function bookAppointment (agent) {
    agent.add("here");
    const appointmentDuration = 1;// length of the appointment to be one hour.
    
    const dateTimeStart = new Date(Date.parse(agent.parameters.date.split('T')[0] + 'T' + agent.parameters.time.split('T')[1].split('-')[0] + timeZoneOffset));
    const dateTimeEnd = new Date(new Date(dateTimeStart).setHours(dateTimeStart.getHours() + 1));
    const appointmentTimeString = dateTimeStart.toLocaleString(
      'en-US',
      { month: 'long', day: 'numeric', hour: 'numeric', timeZone: timeZone }
    );
    // Check the availability of the time slot and set up an appointment if the time slot is available on the calendar
    return createCalendarEvent(dateTimeStart, dateTimeEnd).then(() => {
      agent.add(`Got it. I have your appointment scheduled at ${appointmentTimeString}. See you soon. Good-bye.`);
    }).catch(() => {
      agent.add(`Sorry, we're booked on at ${appointmentTimeString}. Is there anything else I can do for you?`);
    });
  }
  let intentMap = new Map();
  intentMap.set('Book Appointment', bookAppointment);  //
  agent.handleRequest(intentMap);
});

function createCalendarEvent (dateTimeStart, dateTimeEnd) {
  return new Promise((resolve, reject) => {
    calendar.events.list({
      auth: serviceAccountAuth, // List events for time period
      calendarId: calendarId,
      timeMin: dateTimeStart.toISOString(),
      timeMax: dateTimeEnd.toISOString()
    }, (err, calendarResponse) => {
      // Check if there is a event already on the Bike Shop Calendar
      if (err || calendarResponse.data.items.length > 0) {
        reject(err || new Error('Requested time conflicts with another appointment'));
      } else {
        // Create event for the requested time period
        calendar.events.insert({ auth: serviceAccountAuth,
          calendarId: calendarId,
          resource: {summary: 'Bike Appointment',
            start: {dateTime: dateTimeStart},
            end: {dateTime: dateTimeEnd}}
        }, (err, event) => {
          err ? reject(err) : resolve(event);
        }
        );
      }
    });
  });
}
