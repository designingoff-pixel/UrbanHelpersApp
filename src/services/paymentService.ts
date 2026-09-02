import RazorpayCheckout from 'react-native-razorpay';

export interface PaymentOptions {
  amount: number; // in Rupees
  customerPhone: string;
  customerEmail?: string;
  customerName?: string;
  description: string;
}

/**
 * Initiates the Razorpay checkout flow.
 * Returns the payment_id on success, or throws an error on failure/cancellation.
 */
export async function processRazorpayPayment(options: PaymentOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const razorpayOptions = {
      description: options.description,
      image: 'https://i.imgur.com/3g7nmJC.png',
      currency: 'INR',
      // Using a test key for development.
      // IMPORTANT: Replace this with your live key in production.
      key: 'rzp_test_1DP5mmOlF5G5ag', 
      amount: Math.round(options.amount * 100), // amount in paise
      name: 'Urban Helpers',
      prefill: {
        email: options.customerEmail || 'customer@example.com',
        contact: options.customerPhone,
        name: options.customerName || 'Urban Helpers Customer'
      },
      theme: { color: '#2563eb' }
    };
    
    RazorpayCheckout.open(razorpayOptions).then((data: any) => {
      resolve(data.razorpay_payment_id);
    }).catch((error: any) => {
      // error.code (0 for cancellation, 1 for other errors)
      // error.description
      reject(new Error(error.description || 'Payment cancelled or failed.'));
    });
  });
}
