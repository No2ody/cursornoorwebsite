import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Link,
  Img,
  Row,
  Column,
} from '@react-email/components'
import { OrderEmailData } from '@/lib/resend'

type OrderConfirmationEmailProps = OrderEmailData

export function OrderConfirmationEmail({
  orderNumber,
  customerName,
  items,
  subtotal,
  shipping,
  tax,
  total,
  shippingAddress,
  estimatedDelivery,
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://nooraltayseer.com/images/NoorAlTayseer_logo.png"
              width="50"
              height="50"
              alt="Noor AlTayseer"
              style={logo}
            />
            <Heading style={headerTitle}>Noor AlTayseer</Heading>
            <Text style={headerSubtitle}>Building & Construction</Text>
          </Section>

          {/* Order Confirmation */}
          <Section style={orderConfirmation}>
            <Heading style={confirmationTitle}>
              🎉 Order Confirmed!
            </Heading>
            <Text style={confirmationText}>
              Thank you for your order, {customerName}! We&apos;re excited to get your products to you.
            </Text>
            
            <Section style={orderBox}>
              <Text style={orderNumberStyle}>Order #{orderNumber}</Text>
              <Text style={orderDate}>
                Order Date: {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </Section>
          </Section>

          {/* Order Items */}
          <Section style={itemsSection}>
            <Heading style={sectionTitle}>Order Items</Heading>
            {items.map((item, index) => (
              <Row key={index} style={itemRow}>
                <Column style={itemImageColumn}>
                  {item.image && (
                    <Img
                      src={item.image}
                      width="60"
                      height="60"
                      alt={item.name}
                      style={itemImage}
                    />
                  )}
                </Column>
                <Column style={itemDetailsColumn}>
                  <Text style={itemName}>{item.name}</Text>
                  <Text style={itemMeta}>
                    Quantity: {item.quantity} × AED {item.price.toFixed(2)}
                  </Text>
                </Column>
                <Column style={itemTotalColumn}>
                  <Text style={itemTotal}>
                    AED {item.total.toFixed(2)}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={divider} />

          {/* Order Summary */}
          <Section style={summarySection}>
            <Heading style={sectionTitle}>Order Summary</Heading>
            <Row style={summaryRow}>
              <Column style={summaryLabel}>
                <Text style={summaryLabelText}>Subtotal:</Text>
              </Column>
              <Column style={summaryValue}>
                <Text style={summaryValueText}>AED {subtotal.toFixed(2)}</Text>
              </Column>
            </Row>
            <Row style={summaryRow}>
              <Column style={summaryLabel}>
                <Text style={summaryLabelText}>Shipping:</Text>
              </Column>
              <Column style={summaryValue}>
                <Text style={summaryValueText}>AED {shipping.toFixed(2)}</Text>
              </Column>
            </Row>
            <Row style={summaryRow}>
              <Column style={summaryLabel}>
                <Text style={summaryLabelText}>Tax (10%):</Text>
              </Column>
              <Column style={summaryValue}>
                <Text style={summaryValueText}>AED {tax.toFixed(2)}</Text>
              </Column>
            </Row>
            <Hr style={subtotalDivider} />
            <Row style={totalRow}>
              <Column style={summaryLabel}>
                <Text style={totalLabelText}>Total:</Text>
              </Column>
              <Column style={summaryValue}>
                <Text style={totalValueText}>AED {total.toFixed(2)}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Shipping Information */}
          <Section style={shippingSection}>
            <Heading style={sectionTitle}>Shipping Information</Heading>
            <Text style={addressText}>
              {shippingAddress.street}<br />
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}<br />
              {shippingAddress.country}
            </Text>
            <Text style={deliveryText}>
              📦 Estimated delivery: {estimatedDelivery}
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Questions about your order? Contact us:
            </Text>
            <Text style={contactInfo}>
              📞 +971 50 538 2246<br />
              ✉️ info@nooraltayseer.com
            </Text>
            
            <Text style={footerNote}>
              Thank you for choosing Noor AlTayseer for your lighting and construction needs!
            </Text>
            
            <Link
              href="https://nooraltayseer.com"
              style={websiteLink}
            >
              Visit our website
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0',
  marginTop: '20px',
  marginBottom: '20px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  maxWidth: '600px',
}

const header = {
  textAlign: 'center' as const,
  padding: '32px 32px 24px',
  backgroundColor: '#0B72B9',
  color: '#ffffff',
  borderRadius: '8px 8px 0 0',
}

const logo = {
  margin: '0 auto 16px',
  borderRadius: '4px',
}

const headerTitle = {
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 8px',
  color: '#ffffff',
}

const headerSubtitle = {
  fontSize: '16px',
  margin: '0',
  color: '#E6C36A',
}

const orderConfirmation = {
  textAlign: 'center' as const,
  padding: '32px 32px 24px',
}

const confirmationTitle = {
  fontSize: '24px',
  fontWeight: '600',
  margin: '0 0 16px',
  color: '#1a202c',
}

const confirmationText = {
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 24px',
  color: '#4a5568',
}

const orderBox = {
  backgroundColor: '#f7fafc',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  margin: '0 auto',
  maxWidth: '300px',
}

const orderNumberStyle = {
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 8px',
  color: '#0B72B9',
  textAlign: 'center' as const,
}

const orderDate = {
  fontSize: '14px',
  margin: '0',
  color: '#718096',
  textAlign: 'center' as const,
}

const itemsSection = {
  padding: '0 32px',
}

const sectionTitle = {
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 20px',
  color: '#1a202c',
}

const itemRow = {
  marginBottom: '16px',
  paddingBottom: '16px',
  borderBottom: '1px solid #e2e8f0',
}

const itemImageColumn = {
  width: '80px',
  verticalAlign: 'top' as const,
}

const itemImage = {
  borderRadius: '4px',
}

const itemDetailsColumn = {
  paddingLeft: '16px',
  verticalAlign: 'top' as const,
}

const itemTotalColumn = {
  width: '100px',
  textAlign: 'right' as const,
  verticalAlign: 'top' as const,
}

const itemName = {
  fontSize: '16px',
  fontWeight: '500',
  margin: '0 0 4px',
  color: '#1a202c',
}

const itemMeta = {
  fontSize: '14px',
  margin: '0',
  color: '#718096',
}

const itemTotal = {
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
  color: '#1a202c',
}

const divider = {
  margin: '32px 0',
  borderColor: '#e2e8f0',
}

const summarySection = {
  padding: '0 32px',
}

const summaryRow = {
  marginBottom: '8px',
}

const summaryLabel = {
  width: '70%',
}

const summaryValue = {
  width: '30%',
  textAlign: 'right' as const,
}

const summaryLabelText = {
  fontSize: '14px',
  margin: '0',
  color: '#4a5568',
}

const summaryValueText = {
  fontSize: '14px',
  margin: '0',
  color: '#1a202c',
}

const subtotalDivider = {
  margin: '12px 0',
  borderColor: '#e2e8f0',
}

const totalRow = {
  paddingTop: '8px',
}

const totalLabelText = {
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
  color: '#1a202c',
}

const totalValueText = {
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
  color: '#0B72B9',
}

const shippingSection = {
  padding: '0 32px',
}

const addressText = {
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 16px',
  color: '#4a5568',
}

const deliveryText = {
  fontSize: '14px',
  margin: '0',
  color: '#0B72B9',
  fontWeight: '500',
}

const footer = {
  textAlign: 'center' as const,
  padding: '32px',
  backgroundColor: '#f7fafc',
  borderRadius: '0 0 8px 8px',
}

const footerText = {
  fontSize: '14px',
  margin: '0 0 8px',
  color: '#4a5568',
}

const contactInfo = {
  fontSize: '14px',
  margin: '0 0 20px',
  color: '#1a202c',
  lineHeight: '20px',
}

const footerNote = {
  fontSize: '14px',
  margin: '0 0 20px',
  color: '#4a5568',
  fontStyle: 'italic',
}

const websiteLink = {
  color: '#0B72B9',
  textDecoration: 'underline',
  fontSize: '14px',
}
