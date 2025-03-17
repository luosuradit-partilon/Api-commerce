"use client";

const PaymentButton: React.FC = () => {
   return (
      <form action="/api/checkout_sessions" method="POST">
         <button type="submit" role="link">
            Make a payment
         </button>
      </form>
   );
};

export default PaymentButton;
