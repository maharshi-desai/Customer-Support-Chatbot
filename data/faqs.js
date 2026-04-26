export const FAQ_ENTRIES = [
  {
    id: "order-tracking",
    category: "orders",
    keywords: ["track order", "tracking", "where is my order", "shipping status"],
    answer:
      "You can track your order from the order confirmation email or your account order history. If the tracking link has not updated for more than 48 hours, please share your order number so support can review it.",
  },
  {
    id: "order-processing-time",
    category: "orders",
    keywords: ["processing time", "when will my order ship", "order processing", "how long to ship"],
    answer:
      "Most orders are processed within 1 to 2 business days before shipment. During promotions or holidays, processing may take a little longer.",
  },
  {
    id: "change-shipping-address",
    category: "orders",
    keywords: ["change address", "update shipping address", "wrong address", "edit address"],
    answer:
      "Shipping addresses can usually be updated only before the order is packed. Please contact support with your order number as soon as possible if you need an address correction.",
  },
  {
    id: "cancel-order",
    category: "orders",
    keywords: ["cancel order", "order cancellation", "stop my order", "can i cancel"],
    answer:
      "Orders can usually be canceled only before fulfillment begins. If your order has already shipped, you may need to request a return after delivery.",
  },
  {
    id: "delivery-delay",
    category: "orders",
    keywords: ["delayed order", "late delivery", "package delayed", "order not arrived"],
    answer:
      "Delivery delays can happen because of courier backlogs, weather, or address verification. If the estimated delivery date has passed, please share your order number so support can investigate.",
  },
  {
    id: "preorder-release",
    category: "orders",
    keywords: ["preorder", "pre-order", "release date", "when does preorder ship"],
    answer:
      "Preorders usually ship on or shortly before the listed release date. If your preorder has not moved after release, support can check the order status for you.",
  },
  {
    id: "international-shipping",
    category: "orders",
    keywords: ["international shipping", "ship internationally", "countries", "outside my country"],
    answer:
      "International shipping availability depends on your destination and the products in your cart. Duties, taxes, and customs delays may apply depending on local regulations.",
  },
  {
    id: "shipping-fees",
    category: "orders",
    keywords: ["shipping cost", "shipping fee", "delivery fee", "how much is shipping"],
    answer:
      "Shipping fees are calculated at checkout based on destination, delivery speed, and cart contents. Promotional free shipping offers apply only when their specific conditions are met.",
  },
  {
    id: "return-window",
    category: "returns-refunds",
    keywords: ["return window", "how many days return", "return period", "days to return"],
    answer:
      "Most eligible items can be returned within 30 days of delivery. Items that are final sale, personalized, or hygiene-sensitive may not be returnable.",
  },
  {
    id: "start-return",
    category: "returns-refunds",
    keywords: ["start return", "return item", "how do i return", "return label"],
    answer:
      "To start a return, use the return option in your order history if available or contact support with your order number and the item you want to return.",
  },
  {
    id: "refund-timeline",
    category: "returns-refunds",
    keywords: ["refund time", "how long refund", "refund processing", "when will i get my refund"],
    answer:
      "Refunds are usually issued within 5 to 7 business days after the returned item is received and inspected. Your bank or card issuer may take additional time to post the refund.",
  },
  {
    id: "refund-original-payment",
    category: "returns-refunds",
    keywords: ["original payment method", "refund to card", "where is refund sent", "how is refund issued"],
    answer:
      "Refunds are normally sent back to the original payment method used at checkout unless local policy or store credit terms say otherwise.",
  },
  {
    id: "exchange-policy",
    category: "returns-refunds",
    keywords: ["exchange item", "can i exchange", "size exchange", "replace item"],
    answer:
      "Exchanges depend on stock availability and item eligibility. If an exchange is not available, support may recommend returning the original item and placing a new order.",
  },
  {
    id: "damaged-or-wrong-item",
    category: "returns-refunds",
    keywords: ["damaged item", "wrong item", "defective item", "broken product"],
    escalated: true,
    answer:
      "If you received a damaged, defective, or incorrect item, contact support with your order number and photos if possible so the team can review replacement or refund options.",
  },
  {
    id: "store-credit",
    category: "returns-refunds",
    keywords: ["store credit", "credit instead of refund", "gift balance", "refund as credit"],
    answer:
      "Store credit options may be offered for eligible returns depending on the item and promotion terms. If available, support can explain whether store credit or the original payment method applies.",
  },
  {
    id: "payment-methods",
    category: "payments",
    keywords: ["payment methods", "how can i pay", "accepted cards", "checkout payment"],
    answer:
      "Accepted payment methods usually include major credit and debit cards, and in some regions digital wallets or buy-now-pay-later options may also be available at checkout.",
  },
  {
    id: "payment-failed",
    category: "payments",
    keywords: ["payment failed", "card declined", "checkout failed", "transaction failed"],
    escalated: true,
    answer:
      "If your payment failed, double-check your billing details, available funds, and card security settings. If the issue continues, try another payment method or contact support with the error shown at checkout.",
  },
  {
    id: "duplicate-charge",
    category: "payments",
    keywords: ["charged twice", "double charged", "duplicate charge", "two charges"],
    escalated: true,
    answer:
      "A duplicate charge should be reviewed by support right away. Please share your order number, payment method, and the charge timestamps if visible so the team can investigate.",
  },
  {
    id: "promo-code",
    category: "payments",
    keywords: ["promo code", "discount code", "coupon code", "voucher code"],
    answer:
      "Promo codes must usually be entered at checkout before payment is completed. Codes may have expiration dates, product exclusions, or minimum order requirements.",
  },
  {
    id: "invoice-receipt",
    category: "payments",
    keywords: ["invoice", "receipt", "billing receipt", "download invoice"],
    answer:
      "Order confirmations and receipts are typically sent by email after purchase. If you need a billing invoice or another copy of your receipt, support can help with that.",
  },
  {
    id: "gift-card",
    category: "payments",
    keywords: ["gift card", "gift balance", "redeem gift card", "gift voucher"],
    answer:
      "Gift cards can usually be applied during checkout by entering the code in the payment or gift card section. If the code does not work, support can help verify its status.",
  },
  {
    id: "reset-password",
    category: "account",
    keywords: ["reset password", "forgot password", "password reset", "can't log in"],
    answer:
      "If you forgot your password, use the password reset option on the sign-in page. If you do not receive the reset email, check spam folders and confirm the email address on file.",
  },
  {
    id: "change-email",
    category: "account",
    keywords: ["change email", "update email", "wrong email on account", "edit email"],
    answer:
      "You may be able to update your email address from your account settings. If the change is blocked or the old email is inaccessible, support can help verify and update your account securely.",
  },
  {
    id: "locked-account",
    category: "account",
    keywords: ["account locked", "locked out", "cannot access account", "login blocked"],
    escalated: true,
    answer:
      "If your account is locked or inaccessible, contact support for secure verification. Please be ready to confirm your account email and recent order details if requested.",
  },
  {
    id: "delete-account",
    category: "account",
    keywords: ["delete account", "close account", "remove my account", "deactivate account"],
    answer:
      "Account deletion requests may require identity verification for security. Contact support if you want to close your account or remove stored account information.",
  },
  {
    id: "guest-checkout",
    category: "account",
    keywords: ["guest checkout", "checkout without account", "buy without account", "order as guest"],
    answer:
      "Guest checkout may be available depending on region and product type. If guest checkout is not shown, creating an account may be required for that order.",
  },
  {
    id: "create-account",
    category: "account",
    keywords: ["create account", "sign up", "register account", "new account"],
    answer:
      "You can usually create an account during checkout or from the sign-in page. Using an account helps you track orders, save addresses, and manage returns more easily.",
  },
  {
    id: "unsubscribe-marketing",
    category: "account",
    keywords: ["unsubscribe", "stop emails", "marketing emails", "newsletter"],
    answer:
      "You can unsubscribe from marketing emails by using the unsubscribe link in the message or by updating your communication preferences in account settings.",
  },
  {
    id: "business-days",
    category: "general",
    keywords: ["business days", "working days", "weekends count", "processing days"],
    answer:
      "Business days usually mean Monday through Friday and exclude most public holidays. Processing and refund timelines are commonly measured using business days rather than calendar days.",
  },
  {
    id: "contact-human-support",
    category: "general",
    keywords: ["human support", "live agent", "talk to agent", "contact support"],
    answer:
      "If you need human assistance, please share your order number or account email and a brief description of the issue so support can route your case to the right team.",
  },
];
