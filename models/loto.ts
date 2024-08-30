import mongoose, { Schema } from 'mongoose';

const LotoSchema = new Schema({
	drawDate: { type: Date, required: true },
	numbers: { type: [Number], required: true }, // 5 numéros principaux
	luckyNumber: { type: Number, required: true }, // 1 numéro chance
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Loto || mongoose.model('Loto', LotoSchema);
