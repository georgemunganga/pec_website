import { useEffect, useState } from 'react';
import { AccountLayout } from '@/components/AccountLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supportAPI } from '@/services/api';
import { CONTACT_INFO } from '@/const/contact';
import { toast } from 'sonner';
import { HelpCircle, Plus, Phone, Mail, MessageSquare } from 'lucide-react';

const normalizeTickets = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export default function Support() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });

  useEffect(() => {
    const loadTickets = async () => {
      setIsLoading(true);
      try {
        const response = await supportAPI.getTickets();
        setTickets(normalizeTickets(response));
      } catch (error) {
        setTickets([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTickets();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supportAPI.createTicket({
        ...formData,
        category: 'general',
        priority: 'medium',
      });
      toast.success('Support ticket created successfully!');
      setIsDialogOpen(false);
      setFormData({ subject: '', message: '' });
      const refreshed = await supportAPI.getTickets();
      setTickets(normalizeTickets(refreshed));
    } catch (error) {
      toast.error('Failed to create support ticket');
    }
  };

  return (
    <AccountLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
            <p className="text-muted-foreground mt-2">Get help with your orders and account</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full">
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle>Create Support Ticket</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="Brief description of your issue"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="rounded-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Please provide details about your issue..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="rounded-2xl"
                  />
                </div>
                <Button type="submit" className="w-full rounded-full">
                  Submit Ticket
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href={`tel:${CONTACT_INFO.phone}`} className="bg-card rounded-3xl p-6 border border-border hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
              <Phone className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Call Us</h3>
            <p className="text-sm text-muted-foreground">{CONTACT_INFO.phone}</p>
          </a>

          <a href={`mailto:${CONTACT_INFO.email}`} className="bg-card rounded-3xl p-6 border border-border hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Email Us</h3>
            <p className="text-sm text-muted-foreground break-all">{CONTACT_INFO.email}</p>
          </a>

          <div className="bg-card rounded-3xl p-6 border border-border">
            <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Live Chat</h3>
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </div>
        </div>

        <div className="bg-card rounded-3xl p-8 border border-border">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                question: 'How long does shipping take?',
                answer: 'Standard shipping takes 3-5 business days. Express shipping is available for 1-2 day delivery.',
              },
              {
                question: 'What is your return policy?',
                answer: 'We accept returns within 30 days of purchase. Items must be unused and in original packaging.',
              },
              {
                question: 'How can I track my order?',
                answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also track orders in your account dashboard.',
              },
              {
                question: 'Do you ship internationally?',
                answer: 'Currently, we ship within Zambia only. International shipping coming soon!',
              },
            ].map((faq, index) => (
              <div key={index} className="pb-6 border-b border-border last:border-0 last:pb-0">
                <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-3xl p-8 border border-border">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Your Support Tickets</h2>
          
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No support tickets yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 rounded-2xl border border-border">
                  <div>
                    <h3 className="font-semibold text-foreground">{ticket.subject}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ticket #{ticket.id} • Created {new Date(ticket.createdAt ?? ticket.date).toLocaleDateString()}
                    </p>
                    {ticket.lastReply && (
                      <p className="text-xs text-muted-foreground">Updated {new Date(ticket.lastReply).toLocaleString()}</p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ticket.status?.toLowerCase() === 'open'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-gray-500/10 text-gray-500'
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AccountLayout>
  );
}
