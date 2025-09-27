import { PrismaClient, PromotionType, PromotionTargetType, PromotionStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🎯 Seeding promotions...')

  // Create customer segments
  const newCustomerSegment = await prisma.customerSegment.create({
    data: {
      name: 'New Customers',
      description: 'Customers who have not made any orders yet',
      criteria: {
        orderCount: 0
      }
    }
  })

  const vipCustomerSegment = await prisma.customerSegment.create({
    data: {
      name: 'VIP Customers',
      description: 'Customers who have spent more than AED 1000',
      criteria: {
        totalSpent: { gte: 1000 }
      }
    }
  })

  // Get category IDs for targeting
  const lightingCategory = await prisma.category.findFirst({
    where: { name: { contains: 'Lighting', mode: 'insensitive' } }
  })

  const bathroomCategory = await prisma.category.findFirst({
    where: { name: { contains: 'Bathroom', mode: 'insensitive' } }
  })

  // Create sample promotions
  const promotions = [
    // Welcome promotion for new customers
    {
      name: 'Welcome 15% Off',
      description: 'Get 15% off your first order with us',
      code: 'WELCOME15',
      type: PromotionType.PERCENTAGE,
      targetType: PromotionTargetType.FIRST_ORDER,
      status: PromotionStatus.ACTIVE,
      discountValue: 15,
      maxDiscountAmount: 100,
      minimumOrderValue: 50,
      usageLimit: 1000,
      customerSegments: [newCustomerSegment.id],
      stackable: false,
      priority: 10
    },

    // Bulk discount for large orders
    {
      name: 'Bulk Order Discount',
      description: 'Get 10% off when you order 5 or more items',
      type: PromotionType.BULK_DISCOUNT,
      targetType: PromotionTargetType.BULK_ORDER,
      status: PromotionStatus.ACTIVE,
      discountValue: 10,
      minimumQuantity: 5,
      stackable: true,
      priority: 5
    },

    // Category-specific promotion for lighting
    {
      name: 'Lighting Special',
      description: '20% off all lighting products',
      code: 'LIGHT20',
      type: PromotionType.PERCENTAGE,
      targetType: PromotionTargetType.PRODUCT_CATEGORY,
      status: PromotionStatus.ACTIVE,
      discountValue: 20,
      maxDiscountAmount: 200,
      minimumOrderValue: 100,
      applicableCategories: lightingCategory ? [lightingCategory.id] : [],
      usageLimit: 500,
      stackable: true,
      priority: 7
    },

    // Free shipping promotion
    {
      name: 'Free Shipping',
      description: 'Free shipping on orders over AED 150',
      type: PromotionType.FREE_SHIPPING,
      targetType: PromotionTargetType.CART_TOTAL,
      status: PromotionStatus.ACTIVE,
      discountValue: 0,
      minimumOrderValue: 150,
      stackable: true,
      priority: 3
    },

    // Buy X Get Y promotion
    {
      name: 'Buy 3 Get 1 Free',
      description: 'Buy 3 bathroom fixtures, get 1 free',
      type: PromotionType.BUY_X_GET_Y,
      targetType: PromotionTargetType.PRODUCT_CATEGORY,
      status: PromotionStatus.ACTIVE,
      discountValue: 0,
      buyQuantity: 3,
      getQuantity: 1,
      getDiscountPercent: 100,
      applicableCategories: bathroomCategory ? [bathroomCategory.id] : [],
      stackable: false,
      priority: 8
    },

    // Fixed amount discount
    {
      name: 'AED 50 Off',
      description: 'Get AED 50 off orders over AED 300',
      code: 'SAVE50',
      type: PromotionType.FIXED_AMOUNT,
      targetType: PromotionTargetType.CART_TOTAL,
      status: PromotionStatus.ACTIVE,
      discountValue: 50,
      minimumOrderValue: 300,
      usageLimit: 200,
      stackable: true,
      priority: 6
    },

    // VIP customer exclusive
    {
      name: 'VIP Exclusive 25% Off',
      description: 'Exclusive 25% discount for our VIP customers',
      code: 'VIP25',
      type: PromotionType.PERCENTAGE,
      targetType: PromotionTargetType.CUSTOMER_SEGMENT,
      status: PromotionStatus.ACTIVE,
      discountValue: 25,
      maxDiscountAmount: 300,
      customerSegments: [vipCustomerSegment.id],
      usageLimitPerCustomer: 2,
      stackable: false,
      priority: 9
    },

    // Weekend special (scheduled)
    {
      name: 'Weekend Flash Sale',
      description: '30% off everything for the weekend',
      code: 'WEEKEND30',
      type: PromotionType.PERCENTAGE,
      targetType: PromotionTargetType.CART_TOTAL,
      status: PromotionStatus.SCHEDULED,
      discountValue: 30,
      maxDiscountAmount: 500,
      minimumOrderValue: 100,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // Next week + 2 days
      usageLimit: 100,
      stackable: false,
      priority: 15
    }
  ]

  // Create promotions
  for (const promotionData of promotions) {
    const promotion = await prisma.promotion.create({
      data: promotionData
    })
    console.log(`✅ Created promotion: ${promotion.name}`)

    // Create individual coupons for code-based promotions
    if (promotion.code) {
      // Create a few individual coupons for testing
      for (let i = 1; i <= 3; i++) {
        await prisma.coupon.create({
          data: {
            code: `${promotion.code}-${i.toString().padStart(2, '0')}`,
            promotionId: promotion.id,
            usageLimit: 1
          }
        })
      }
      console.log(`   Created individual coupons for ${promotion.code}`)
    }
  }

  // Create some cart rules for automatic promotions
  const cartRules = [
    {
      name: 'First Time Buyer Bonus',
      description: 'Automatic 10% discount for first-time buyers',
      priority: 5,
      conditions: {
        userOrderCount: 0,
        minimumCartValue: 75
      },
      actionType: 'discount',
      actionValue: 10,
      actionData: {
        type: 'percentage',
        description: 'First-time buyer discount'
      }
    },

    {
      name: 'High Value Order Bonus',
      description: 'Automatic AED 25 off for orders over AED 500',
      priority: 3,
      conditions: {
        minimumCartValue: 500
      },
      actionType: 'discount',
      actionValue: 25,
      actionData: {
        type: 'fixed',
        description: 'High value order bonus'
      }
    }
  ]

  for (const ruleData of cartRules) {
    const rule = await prisma.cartRule.create({
      data: ruleData
    })
    console.log(`✅ Created cart rule: ${rule.name}`)
  }

  console.log('🎉 Promotions seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding promotions:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
