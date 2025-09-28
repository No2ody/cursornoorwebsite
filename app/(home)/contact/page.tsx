import React from 'react'
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  MessageCircle
} from 'lucide-react'

export default function ContactPage() {

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      details: ['+971 50 538 2246'],
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['info@nooraltayseer.com'],
      color: 'from-green-500 to-green-600'
    },
    {
      icon: MapPin,
      title: 'Address',
      details: [
        'Dubai Business District',
        'Dubai, United Arab Emirates'
      ],
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: [
        'Sun - Thu: 8:00 AM - 6:00 PM',
        'Saturday: 8:00 AM - 2:00 PM',
        'Friday: Closed'
      ],
      color: 'from-orange-500 to-orange-600'
    }
  ]



  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Get in touch with our expert team for all your building materials and construction needs
            </p>
            <div className="flex justify-center">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-yellow-400" />
                  <span>+971 50 538 2246</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-yellow-400" />
                  <span>info@nooraltayseer.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="group"
              >
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
                  <div className={`w-12 h-12 bg-gradient-to-r ${info.color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <info.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {info.title}
                  </h3>
                  <div className="space-y-2">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-gray-600 text-sm">
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information & Map */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Get In Touch
                  </h2>
                </div>

                <div className="space-y-6">
                  <p className="text-lg text-gray-600 leading-relaxed mb-8">
                    Ready to discuss your project? Contact us using any of the methods below. Our expert team is here to help with all your building material and construction needs.
                  </p>

                  {/* Primary Contact Methods */}
                  <div className="space-y-4">
                    <a
                      href="tel:+971505382246"
                      className="flex items-center space-x-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Phone className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Call Us</p>
                        <p className="text-xl font-bold text-gray-900">+971 50 538 2246</p>
                        <p className="text-sm text-gray-600">Available Sun-Thu 8AM-6PM, Sat 8AM-2PM</p>
                      </div>
                    </a>

                    <a
                      href="mailto:info@nooraltayseer.com"
                      className="flex items-center space-x-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Mail className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Email Us</p>
                        <p className="text-xl font-bold text-gray-900">info@nooraltayseer.com</p>
                        <p className="text-sm text-gray-600">We respond within 24 hours</p>
                      </div>
                    </a>

                    <a
                      href="https://wa.me/971505382246"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <MessageCircle className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">WhatsApp</p>
                        <p className="text-xl font-bold text-gray-900">+971 50 538 2246</p>
                        <p className="text-sm text-gray-600">Quick response guaranteed</p>
                      </div>
                    </a>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      <p className="font-semibold text-gray-900">Visit Our Office</p>
                    </div>
                    <p className="text-gray-600 ml-8">
                      Dubai Business District<br />
                      Dubai, United Arab Emirates
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map & Additional Info */}
            <div className="space-y-8">
              {/* Map Placeholder */}
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl overflow-hidden shadow-lg h-96 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-blue-900 mb-2">Dubai Business District</h3>
                  <p className="text-blue-700">Dubai, United Arab Emirates</p>
                </div>
              </div>

              {/* Quick Contact */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Quick Contact
                </h3>
                
                <div className="space-y-4">
                  <a
                    href="tel:+971505382246"
                    className="flex items-center space-x-4 p-4 bg-white rounded-lg hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Call Us Now</p>
                      <p className="text-gray-600">+971 50 538 2246</p>
                    </div>
                  </a>

                  <a
                    href="mailto:info@nooraltayseer.com"
                    className="flex items-center space-x-4 p-4 bg-white rounded-lg hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Email Us</p>
                      <p className="text-gray-600">info@nooraltayseer.com</p>
                    </div>
                  </a>

                  <a
                    href="https://wa.me/971505382246"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-4 p-4 bg-white rounded-lg hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">WhatsApp</p>
                      <p className="text-gray-600">Quick Response</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Quick answers to common questions about our products and services
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {[
              {
                question: 'What areas do you deliver to?',
                answer: 'We deliver throughout the UAE, including Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, and Umm Al Quwain.'
              },
              {
                question: 'Do you offer bulk discounts?',
                answer: 'Yes, we offer competitive pricing for bulk orders. Contact us for a customized quote based on your project requirements.'
              },
              {
                question: 'What is your delivery timeframe?',
                answer: 'Standard delivery is 2-5 business days within Dubai and 3-7 business days for other emirates, depending on product availability.'
              }
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow duration-300"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
