import React, { useEffect } from 'react';

const RazorpayButton = () => {
  useEffect(() => {
    // Create a script element
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
    script.async = true;
    script.dataset.paymentButtonId = 'pl_NJprXcBmegB6aA';

    // Append the script to the document head
    document.head.appendChild(script);

    // Clean up the script when the component unmounts
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <form></form>
  );
};

export default RazorpayButton;
