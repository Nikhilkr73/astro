import { useState } from "react";
import { ArrowLeft, MessageCircle, Phone, ArrowDownLeft, CreditCard } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";

interface WalletHistoryProps {
  onNavigate: (screen: string) => void;
}

interface DeductionTransaction {
  id: string;
  type: 'chat' | 'call';
  astrologerName: string;
  amount: number;
  duration: string;
  date: string;
  time: string;
}

interface PaymentTransaction {
  id: string;
  amount: number;
  bonus: number;
  paymentMethod: string;
  status: 'success' | 'failed' | 'pending';
  date: string;
  time: string;
  transactionId: string;
}

const deductionHistory: DeductionTransaction[] = [
  {
    id: '1',
    type: 'chat',
    astrologerName: 'Pandit Rajesh Kumar',
    amount: 24,
    duration: '12 min',
    date: 'Today',
    time: '2:30 PM'
  },
  {
    id: '2',
    type: 'call',
    astrologerName: 'Dr. Priya Sharma',
    amount: 36,
    duration: '18 min',
    date: 'Yesterday',
    time: '4:15 PM'
  },
  {
    id: '3',
    type: 'chat',
    astrologerName: 'Guru Vikash Joshi',
    amount: 16,
    duration: '8 min',
    date: '2 days ago',
    time: '11:20 AM'
  },
  {
    id: '4',
    type: 'call',
    astrologerName: 'Swami Anand Tiwari',
    amount: 48,
    duration: '24 min',
    date: '3 days ago',
    time: '6:45 PM'
  },
  {
    id: '5',
    type: 'chat',
    astrologerName: 'Pandit Suresh Mishra',
    amount: 20,
    duration: '10 min',
    date: '5 days ago',
    time: '1:00 PM'
  }
];

const paymentHistory: PaymentTransaction[] = [
  {
    id: '1',
    amount: 200,
    bonus: 25,
    paymentMethod: 'UPI',
    status: 'success',
    date: 'Yesterday',
    time: '3:45 PM',
    transactionId: 'TXN123456789'
  },
  {
    id: '2',
    amount: 500,
    bonus: 75,
    paymentMethod: 'Credit Card',
    status: 'success',
    date: '1 week ago',
    time: '10:30 AM',
    transactionId: 'TXN987654321'
  },
  {
    id: '3',
    amount: 100,
    bonus: 10,
    paymentMethod: 'UPI',
    status: 'failed',
    date: '2 weeks ago',
    time: '5:20 PM',
    transactionId: 'TXN456789123'
  },
  {
    id: '4',
    amount: 1000,
    bonus: 200,
    paymentMethod: 'Net Banking',
    status: 'success',
    date: '3 weeks ago',
    time: '2:15 PM',
    transactionId: 'TXN789123456'
  }
];

export function WalletHistory({ onNavigate }: WalletHistoryProps) {
  const [activeTab, setActiveTab] = useState("deductions");

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onNavigate("wallet")} 
            className="h-10 w-10 p-0 active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl">Transaction History</h1>
        </div>
      </div>

      <div className="px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50 rounded-xl p-1">
            <TabsTrigger value="deductions" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Wallet History
            </TabsTrigger>
            <TabsTrigger value="payments" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Payment Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deductions" className="mt-5 space-y-3">
            <div className="text-sm text-muted-foreground mb-4">
              Money deducted for consultations
            </div>
            {deductionHistory.map((transaction) => (
              <Card key={transaction.id} className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      transaction.type === 'chat' ? 'bg-blue-50' : 'bg-green-50'
                    }`}>
                      {transaction.type === 'chat' ? (
                        <MessageCircle className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Phone className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{transaction.astrologerName}</div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.type === 'chat' ? 'Chat' : 'Call'} • {transaction.duration}
                          </div>
                        </div>
                        <div className="text-red-600 font-semibold flex-shrink-0">
                          -₹{transaction.amount}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {transaction.date} • {transaction.time}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="payments" className="mt-5 space-y-3">
            <div className="text-sm text-muted-foreground mb-4">
              Payments made by you
            </div>
            {paymentHistory.map((transaction) => (
              <Card key={transaction.id} className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      {transaction.status === 'success' ? (
                        <ArrowDownLeft className="w-5 h-5 text-green-600" />
                      ) : (
                        <CreditCard className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">Wallet Recharge</div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.paymentMethod}
                          </div>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <div className="text-green-600 font-semibold">
                            +₹{transaction.amount + transaction.bonus}
                          </div>
                          {transaction.bonus > 0 && (
                            <div className="text-xs text-green-600">
                              (₹{transaction.bonus} bonus)
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-2">
                        <div className="text-xs text-muted-foreground truncate">
                          {transaction.transactionId}
                        </div>
                        <Badge className={`text-xs ${getStatusColor(transaction.status)} border-0`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {transaction.date} • {transaction.time}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
