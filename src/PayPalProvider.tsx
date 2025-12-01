import { PayPalScriptProvider } from "@paypal/react-paypal-js";

// Opciones correctas para el SDK de PayPal
const paypalOptions = {
  clientId: "ASVlHhxx5cm-AgD-jt93WM6VcHVXu3SpsPVNUhrz_DJsZVQKJDq0FyccOnyHoN_ECQYnQhcSDcf5OGsd", // Usar clientId en camelCase
  currency: "USD",
  intent: "capture",
  components: "buttons", // Especificar qué componentes cargar
};

interface PayPalProviderProps {
  children: React.ReactNode;
}

export const PayPalProvider: React.FC<PayPalProviderProps> = ({ children }) => {
  return (
    <PayPalScriptProvider 
      options={paypalOptions}
      deferLoading={false} // Cambiar a true si quieres cargar solo cuando se necesite
    >
      {children}
    </PayPalScriptProvider>
  );
};