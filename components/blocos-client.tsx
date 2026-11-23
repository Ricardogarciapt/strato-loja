/* Selos de pagamento (usado em componentes de servidor e de cliente). */
const PAY = ['VISA', 'Mastercard', 'MB WAY', 'PayPal', 'Apple Pay'];
export const PayBadges = () => <div className="pay">{PAY.map((p) => <span key={p}>{p}</span>)}</div>;
