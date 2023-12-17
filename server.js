require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser')
const cors = require('cors')
const router = require('./routes/index')
const errorMiddleware = require('./middlewares/error-middleware')

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use('/api', router);
app.use(errorMiddleware)

const { sequelize } = require('./models');

sequelize
  .sync()
  .then(() => {
    console.log('Connected to the database!');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });
