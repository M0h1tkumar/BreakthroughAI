import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Send, Bot, User, Phone, Calendar } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
}

export function VirtualFrontDesk() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'agent',
      content: 'Hello! I\'m your virtual front desk assistant. I can help you schedule appointments, answer questions about your visit, check insurance, or connect you with the right specialist. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
  }, []);

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSendMessage(transcript, true);
      };

      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const speak = (text: string) => {
    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    }
  };

  const generateResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();
    
    // Appointment scheduling
    if (msg.includes('appointment') || msg.includes('schedule') || msg.includes('book')) {
      return "I'd be happy to help you schedule an appointment! What type of visit do you need? We offer Primary Care, Weight Loss Management, Pain Management, Cardiology, and other specialties. What works best for your schedule?";
    }
    
    // Insurance questions
    if (msg.includes('insurance') || msg.includes('coverage') || msg.includes('copay')) {
      return "I can help verify your insurance coverage. Please have your insurance card ready. We accept most major insurance plans including PPO, HMO, and Medicare. Would you like me to check your eligibility now?";
    }
    
    // Symptoms/medical questions
    if (msg.includes('pain') || msg.includes('symptom') || msg.includes('sick') || msg.includes('hurt')) {
      return "I understand you're experiencing some health concerns. Based on your symptoms, I can help connect you with the right specialist. Can you describe what you're experiencing? I'll route you to the appropriate care team.";
    }
    
    // Location/directions
    if (msg.includes('location') || msg.includes('address') || msg.includes('directions')) {
      return "Our main clinic is located at 123 Healthcare Drive. We have 5 locations to serve you better. Would you like directions to our nearest location, or do you have a preferred clinic location?";
    }
    
    // Wait times
    if (msg.includes('wait') || msg.includes('how long') || msg.includes('time')) {
      return "Current wait times vary by specialty. Primary Care: 15-20 minutes, Specialists: 10-15 minutes. I can check real-time availability and get you the earliest slot. What type of appointment do you need?";
    }
    
    // Prescription refills
    if (msg.includes('prescription') || msg.includes('refill') || msg.includes('medication')) {
      return "I can help with prescription refills! I'll need to verify your last visit date and current medications. Most refills are processed within 2 hours if you're due for renewal. What medication do you need refilled?";
    }
    
    // Default response
    return "I'm here to help with appointments, insurance questions, directions, wait times, and connecting you with the right care team. What specific assistance do you need today?";
  };

  const handleSendMessage = (message?: string, isVoice = false) => {
    const messageText = message || input;
    if (!messageText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date(),
      isVoice
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Generate and add agent response
    setTimeout(() => {
      const response = generateResponse(messageText);
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentMessage]);
      speak(response); // Speak the response
    }, 1000);
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          Virtual Front Desk Assistant
          {isSpeaking && <Badge variant="secondary" className="text-xs">Speaking...</Badge>}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {message.type === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                  <span className="text-xs opacity-75">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                  {message.isVoice && (
                    <Badge variant="outline" className="text-xs">Voice</Badge>
                  )}
                </div>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message or use voice..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          
          <Button
            variant={isListening ? "destructive" : "outline"}
            size="icon"
            onClick={isListening ? stopListening : startListening}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          
          <Button onClick={() => handleSendMessage()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            { icon: Calendar, text: "Schedule Appointment", action: "I need to schedule an appointment" },
            { icon: Phone, text: "Check Insurance", action: "Can you verify my insurance coverage?" },
            { text: "Wait Times", action: "What are the current wait times?" },
            { text: "Directions", action: "I need directions to the clinic" }
          ].map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleSendMessage(action.action)}
              className="text-xs"
            >
              {action.icon && <action.icon className="h-3 w-3 mr-1" />}
              {action.text}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}