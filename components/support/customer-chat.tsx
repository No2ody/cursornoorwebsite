'use client'

import { useState, useRef, useEffect } from 'react'
// Removed framer-motion for build compatibility
import { MessageCircle, X, Send, Bot, Phone, Mail, Clock, Minimize2, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSession } from 'next-auth/react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot' | 'agent'
  timestamp: Date
  agentName?: string
}

const predefinedResponses = [
  { trigger: ['hello', 'hi', 'hey'], response: "Hello! Welcome to Noor AlTayseer. How can I help you today?" },
  { trigger: ['hours', 'time', 'open'], response: "We're open Monday-Saturday 8:00 AM - 6:00 PM UAE time. Sunday we're closed." },
  { trigger: ['location', 'address', 'where'], response: "We're located in Dubai, UAE. Would you like our exact address?" },
  { trigger: ['product', 'lighting', 'bathroom'], response: "We specialize in premium LED lighting and bathroom fixtures. What specific products are you looking for?" },
  { trigger: ['price', 'cost', 'quote'], response: "I'd be happy to help with pricing. Could you tell me which products you're interested in?" },
  { trigger: ['installation', 'install'], response: "Yes, we provide professional installation services. Would you like to schedule a consultation?" },
  { trigger: ['shipping', 'delivery'], response: "We offer free shipping on orders over AED 500 within UAE. Delivery typically takes 2-3 business days." },
  { trigger: ['warranty', 'guarantee'], response: "All our LED products come with a 2-year warranty. Bathroom fixtures have a 1-year warranty." },
  { trigger: ['help', 'support'], response: "I'm here to help! You can ask about our products, pricing, delivery, or anything else." }
]

export function CustomerChat() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! Welcome to Noor AlTayseer customer support. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const findResponse = (text: string): string => {
    const lowercaseText = text.toLowerCase()
    
    for (const item of predefinedResponses) {
      if (item.trigger.some(trigger => lowercaseText.includes(trigger))) {
        return item.response
      }
    }
    
    return "Thank you for your message. Let me connect you with a live agent who can better assist you with your inquiry."
  }

  const simulateTyping = (response: string) => {
    setIsTyping(true)
    
    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date()
      }])
    }, 1000 + Math.random() * 1000) // Random delay between 1-2 seconds
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    
    const response = findResponse(inputValue)
    simulateTyping(response)
    
    setInputValue('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickActions = [
    { text: "Product Information", action: () => setInputValue("I need product information") },
    { text: "Get Quote", action: () => setInputValue("I would like a quote") },
    { text: "Installation Service", action: () => setInputValue("I need installation service") },
    { text: "Shipping Info", action: () => setInputValue("What are your shipping options?") }
  ]

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 transform transition-transform duration-300 hover:scale-105">
      
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-brand hover:bg-brand-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          aria-label="Open customer support chat"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        
        {/* Notification pulse */}
        <div className="absolute -top-1 -right-1">
          <div className="h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
            <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] transition-all duration-300 ease-in-out ${
        isMinimized ? 'h-auto' : 'h-[500px]'
      }`}
    >
      <Card className="h-full shadow-2xl border-0 bg-white">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-brand to-brand-700 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/images/NoorAlTayseer_logo.png" />
              <AvatarFallback className="bg-white text-brand text-xs">NA</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">Noor AlTayseer Support</h3>
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 bg-green-400 rounded-full" />
                <span className="text-xs opacity-90">Online</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="flex flex-col h-full p-0">
            {/* Contact Info Banner */}
            <div className="p-3 bg-gold-50 border-b flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Phone className="h-3 w-3 text-brand" />
                  <span className="text-xs">+971 50 538 2246</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-brand" />
                  <span className="text-xs">8AM-6PM</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end space-x-2 max-w-[80%] ${
                      message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      <Avatar className="h-6 w-6">
                        {message.sender === 'user' ? (
                          <AvatarFallback className="bg-brand text-white text-xs">
                            {session?.user?.name?.[0] || 'U'}
                          </AvatarFallback>
                        ) : (
                          <AvatarFallback className="bg-gold text-brand text-xs">
                            <Bot className="h-3 w-3" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      
                      <div className={`rounded-lg px-3 py-2 text-sm ${
                        message.sender === 'user'
                          ? 'bg-brand text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        {message.text}
                        <div className={`text-xs mt-1 opacity-70 ${
                          message.sender === 'user' ? 'text-white' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-end space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-gold text-brand text-xs">
                          <Bot className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 rounded-lg px-3 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            {messages.length <= 2 && (
              <div className="p-3 border-t bg-gray-50">
                <p className="text-xs text-gray-600 mb-2">Quick actions:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={action.action}
                      className="text-xs h-8 border-gray-200 hover:bg-gray-100"
                    >
                      {action.text}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 h-10"
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="h-10 w-10 p-0 bg-brand hover:bg-brand-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>Powered by Noor AlTayseer</span>
                <Badge variant="secondary" className="text-xs">
                  <Mail className="h-3 w-3 mr-1" />
                  info@nooraltayseer.com
                </Badge>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
