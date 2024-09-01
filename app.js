

require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');

const Razorpay = require('razorpay');
const connectTodb = require('./config/mongodb.js');
const Payment = require('./model/payment.js');

connectTodb();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/create/orderId', async (req, res) => {
  const options = {
    amount: 5000 * 100, // amount in smallest currency unit
    currency: 'INR',
  };

  try {
    const order = await razorpay.orders.create(options);
 
       res.send(order);
    
    // Create a new payment record
    await Payment.create({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: 'pending',
    });

 
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).send('Error creating order');
  }
});

app.post('/api/payment/verify', async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, signature } = req.body;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  try {
    const { validatePaymentVerification } = require('razorpay/dist/utils/razorpay-utils');

    const result = validatePaymentVerification({ order_id: razorpayOrderId, payment_id: razorpayPaymentId }, signature, secret);

    if (result) {
      const payment = await Payment.findOne({ orderId: razorpayOrderId });
      
      if (payment) {
        payment.paymentId = razorpayPaymentId;
        payment.signature = signature;
        payment.status = 'completed';
        await payment.save();
        res.json({ status: 'success' });
      } else {
        res.status(404).send('Payment record not found');
      }
    } else {
      res.status(400).send('Invalid signature');
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).send('Error verifying payment');
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
