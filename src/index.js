const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger.json");
const app = require('./app')

const port = process.env.PORT

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})