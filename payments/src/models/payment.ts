import mongoose from "mongoose";

interface PaymentAttrs {
    token: string,
    orderId: string
}

interface PaymentDoc extends mongoose.Document {
    token: string,
    orderId: string,
    // version: number
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
    build(attr: PaymentAttrs): PaymentDoc
}

const paymentSchema = new mongoose.Schema({
    orderId: {
        required: true,
        type: String
    },
    token: {
        required: true,
        type: String
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        },
    }
});


paymentSchema.statics.build = (attrs: PaymentAttrs) => {
    return new Payment(attrs);
}

const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema);

export { Payment };