const mongoose = require('mongoose');

// Define the schema for the Payment model
const paymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true, // This field is required
  },
  paymentId: {
    type: String,
    // Optional field
  },
  signature: {
    type: String,
    // Optional field
  },
  amount: {
    type: Number,
    required: true, // This field is required
  },
  currency: {
    type: String,
    required: true, // This field is required
  },
  status: {
    type: String,
    default: 'pending', // Default value is 'pending'
  },
}, { timestamps: true }); // Adds createdAt and updatedAt fields

// Create and export the Payment model
const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
