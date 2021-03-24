const Axios = require('axios');
const axios = Axios.create({
    port: 3000,
  });
export default axios;