import React, { useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";

interface PayPalButtonProps {
  amount: number;
  currency?: string;
  planId?: string;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  onCancel?: () => void;
  buttonStyle?: {
    layout?: "vertical" | "horizontal";
    color?: "gold" | "blue" | "silver" | "white" | "black";
    shape?: "rect" | "pill";
    label?: "paypal" | "checkout" | "buynow" | "pay" | "installment";
    height?: number;
  };
}

// Componente para mostrar loading mientras se carga el SDK
const ButtonWrapper: React.FC<PayPalButtonProps> = ({ 
  amount, 
  currency = "USD",
  planId,
  onSuccess, 
  onError, 
  onCancel,
  buttonStyle 
}) => {
  const [{ isPending }] = usePayPalScriptReducer();

  if (isPending) {
    return (
      <div style={{
        padding: '1rem',
        textAlign: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: '0.5rem',
        border: '1px solid #e2e8f0'
      }}>
        Cargando PayPal...
      </div>
    );
  }

  const createOrder = (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: amount.toString(),
            currency_code: currency,
          },
          description: planId ? `Plan ${planId} - DentalFlow` : 'Membresía DentalFlow',
          custom_id: planId || 'membership',
        },
      ],
      application_context: {
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        brand_name: "DentalFlow",
      },
    });
  };

  const onApprove = async (data: any, actions: any) => {
    try {
      const details = await actions.order.capture();
      onSuccess(details);
    } catch (error) {
      onError(error);
    }
  };

  return (
    <PayPalButtons
      style={buttonStyle}
      createOrder={createOrder}
      onApprove={onApprove}
      onError={onError}
      onCancel={onCancel}
    />
  );
};

const PayPalButton: React.FC<PayPalButtonProps> = (props) => {
  return <ButtonWrapper {...props} />;
};

export default PayPalButton;