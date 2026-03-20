const axios = require('axios');

async function createInstance() {
  try {
    const response = await axios.post('http://localhost:8080/instance/create', {
      instanceName: 'NursingCare',
      token: 'evolution_nursingcare_2026',
      qrcode: true
    }, {
      headers: {
        'apikey': 'evolution_nursingcare_2026',
        'Content-Type': 'application/json'
      }
    });
    console.log('Successfully created instance:', response.data);
  } catch (error) {
    if (error.response && error.response.status === 403) {
      console.log('Instance might already exist or apikey is wrong.');
    } else {
      console.log('Error creating instance:', error.message);
      if (error.response) console.log('Response data:', error.response.data);
    }
  }
}

createInstance();
