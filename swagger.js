const swaggerAutogen = require('swagger-autogen')()

const outputFile = './swagger.json'
const endpointsFiles = ['./src/app.js']

swaggerAutogen(outputFile, endpointsFiles)