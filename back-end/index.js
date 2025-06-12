const express = require('express');
const mongoose = require('mongoose');
const app=express();
const cors=require('cors');
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true 
}));
const port=process.env.PORT||5000;
const url='mongodb+srv://sk9088075:vJhzp1yLJcy7GTuf@cluster0.srtro0h.mongodb.net/Gymdb?retryWrites=true&w=majority';
const gymRoutes = require('./Routes/gym');
const cookieParser = require('cookie-parser');
const membershipRoutes = require('./Routes/membership');
const memberRoutes = require('./Routes/member');

app.use(cookieParser());
app.use(express.json());

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('Welcome on gym server!');
});

app.use('/gym',gymRoutes);
app.use('/plan',membershipRoutes);
app.use('/members',memberRoutes);

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
