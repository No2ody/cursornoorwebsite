import Link from 'next/link'
import { 
  Target, 
  Heart, 
  Award,
  CheckCircle,
  Building,
  Shield
} from 'lucide-react'

export default function AboutPage() {
  const values = [
    {
      icon: Award,
      title: 'Quality Excellence',
      description: 'We source only the highest quality materials from trusted manufacturers worldwide.'
    },
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Your success is our success. We go above and beyond to exceed your expectations.'
    },
    {
      icon: Shield,
      title: 'Reliability & Trust',
      description: 'Consistent delivery, competitive pricing, and unwavering commitment to our promises.'
    },
    {
      icon: Target,
      title: 'Innovation',
      description: 'Embracing new technologies and sustainable practices for a better future.'
    }
  ]

  const achievements = [
    { number: '500+', label: 'Projects Delivered' },
    { number: '1000+', label: 'Satisfied Clients' },
    { number: '15+', label: 'Years of Excellence' },
    { number: '50+', label: 'Expert Team Members' },
  ]

  const certifications = [
    {
      title: 'ISO 9001:2015',
      description: 'Quality Management System'
    },
    {
      title: 'UAE Municipal Approved',
      description: 'Licensed Building Materials Supplier'
    },
    {
      title: 'Green Building Certified',
      description: 'Sustainable Construction Materials'
    }
  ]

  return (
    <div className="min-h-screen pt-32 pb-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                About Noor AlTayseer
              </h1>
              <p className="text-xl text-yellow-300 mb-6 font-semibold">
                Building Excellence Since 2009
              </p>
              <p className="text-lg text-gray-200 leading-relaxed">
                With over 15 years of experience in the UAE construction industry, Noor Altayseer has established itself as the premier supplier of building materials and construction solutions. We pride ourselves on delivering excellence, reliability, and innovation to every project we support.
              </p>
            </div>
            
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-100 to-purple-100">
                <div className="w-full h-96 flex items-center justify-center">
                  <div className="text-center">
                    <Building className="w-24 h-24 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">Noor AlTayseer</h3>
                    <p className="text-blue-700">Building Excellence</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent" />
              </div>
              
              {/* Floating Achievement Cards */}
              <div className="absolute -top-4 -left-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl">
                <div className="text-2xl font-bold text-blue-600">500+</div>
                <div className="text-sm text-gray-600">Projects</div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl">
                <div className="text-2xl font-bold text-yellow-600">15+</div>
                <div className="text-sm text-gray-600">Years</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="text-left">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                To provide superior building materials and construction solutions that empower our clients to build with confidence, quality, and efficiency while contributing to the sustainable development of the UAE.
              </p>
              
              <div className="space-y-4">
                {[
                  'Quality-first approach in everything we do',
                  'Building lasting partnerships with our clients',
                  'Supporting UAE\'s infrastructure development'
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-left">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Our Values</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Our core values guide every decision we make and every relationship we build, ensuring we remain true to our commitment to excellence and customer satisfaction.
              </p>
              
              <div className="bg-gradient-to-br from-blue-50 to-yellow-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Our Experience
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Over 15 years of dedicated service in the UAE construction industry, building trust through consistent quality delivery and customer-focused solutions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide every decision we make and every relationship we build
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="text-center group"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Our Achievements
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Numbers that reflect our commitment to excellence and customer satisfaction
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="text-center"
              >
                <div className="text-4xl md:text-6xl font-bold text-yellow-400 mb-2">
                  {achievement.number}
                </div>
                <div className="text-sm md:text-base text-gray-200">
                  {achievement.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Certifications & Standards
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Committed to maintaining the highest industry standards and certifications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="text-center"
              >
                <div className="bg-gradient-to-br from-blue-50 to-yellow-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {cert.title}
                  </h3>
                  <p className="text-gray-600">
                    {cert.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Partner with Excellence
            </h2>
            <p className="text-xl mb-10 text-gray-200">
              Experience the Noor Altayseer difference. Join hundreds of satisfied clients who trust us for their construction material needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-xl hover:shadow-yellow-500/25 hover:scale-105"
              >
                Contact Us
              </Link>
              <Link
                href="/products"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-blue-900 transition-all duration-300 shadow-xl hover:scale-105"
              >
                View Products
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
