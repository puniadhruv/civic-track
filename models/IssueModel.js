   const mongoose = require('mongoose');

   const IssueSchema = new mongoose.Schema({
       title: { type: String, required: true },
       description: { type: String, required: true },
       location: { type: { type: String, enum: ['Point'], required: true }, coordinates: { type: [Number], required: true } },
       user: { type: mongoose.Schema.Types.ObjectId, ref: 'User ' },
       status: { type: String, default: 'Pending' },
       createdAt: { type: Date, default: Date.now },
   });

   IssueSchema.index({ location: '2dsphere' });

   module.exports = mongoose.model('Issue', IssueSchema);
   