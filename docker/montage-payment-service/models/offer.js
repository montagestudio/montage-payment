
// TODO schema

exports.Offers = [
  {
    enable: true,
    id: 'pro',
    name: "Pro",
    description: "Premium for individual profesional user.",
    features: [
      'Perfect for Dev and Project Manager',
    ],
    // Plan
    planId: 'PREMIUM',
    planDuration: 1,
    planPeriod: 'month',
    // Trail info
    trialPeriod: true,
    trialDuration: 14,
    trialDurationUnit: 'day',
    // Price
    amount: {
      currency: 'USD',
      value: '9.90'
    }
  },
  {
    enable: true,
    id: 'saas',
    name: "Team",
    description: "Premium for Team. Mutualized SAAS Server.",
    features: [
      'Multi-user Functionality',
      'Customize Branding',
      'Perfect for Agencies',
    ],
    // Order info
    planId: 'TEAM',
    planDuration: 1,
    planPeriod: 'month',
    // Trail info
    trialPeriod: true,
    trialDuration: 14,
    trialDurationUnit: 'day',
    // Price
    amount: {
      currency: 'USD',
      value: '399.00'
    }
  },
  {
    enable: true,
    id: 'business',
    name: "Business",
    description: "Premium for Team. Dedicated SAAS Server.",
    features: [
      'Everything Included in Team Offer',
      'Dedicated Virtual Private Cloud (VPC)',
      'Perfect for Corporation',
    ],
    // Order info
    planId: 'BUSINESS',
    planDuration: 1,
    planPeriod: 'month',
    // Trail info
    trialPeriod: true,
    trialDuration: 14,
    trialDurationUnit: 'day',
    // Price
    amount: {
      currency: 'USD',
      value: '799.00'
    }
  },
  {
    enable: true,
    id: 'support',
    name: "Support Hour",
    description: "One hour of prepaid dedicated support.",
    features: [
      'Support response in 1 hour 24/24',
      'Assistance for indivial or team',
      'Ideal for outsourcing Corporate support',
    ],
    // Product
    productId: "SUPPORT_HOUR",
    productQty: 1,
    productQtyUsed: 0,
    // Price
    amount: {
      currency: 'USD',
      value: '99.00'
    }
  }
];