const express = require('express');
const app = express();
const PORT = process.env.PORT || 4001;
const cors = require('cors');
const joi = require('joi');
app.use(cors());
app.use(express.json());
const userRoutes = require('./routes/user.routes');
const connectDB = require('./config/database');
connectDB().then(() => {
    console.log('Database connected successfully');
}).catch((error) => {
    console.error('Database connection error:', error);
    process.exit(1);
});

app.use('/user', userRoutes);
// alias plural route to support clients using /users
app.use('/users', userRoutes);
app.get('/', (req, res) => {
  res.send('User services is running');
});
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
})

app.listen(PORT, () => {
  console.log(`User services is listening on port ${PORT}`);
});
