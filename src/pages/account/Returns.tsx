import { useEffect, useState } from 'react';
import { AccountLayout } from '@/components/AccountLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { returnsAPI } from '@/services/api';
import { toast } from 'sonner';
import { RotateCcw, Plus, Trash2 } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

interface ReturnItemForm {
  productId: string;
  quantity: number;
  reason: string;
}

const reasonOptions = [
  { value: 'damaged', label: 'Product damaged' },
  { value: 'wrong', label: 'Wrong item received' },
  { value: 'not-as-described', label: 'Not as described' },
  { value: 'quality', label: 'Quality issues' },
  { value: 'other', label: 'Other' },
];

const parseReturns = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export default function Returns() {
  const { formatPrice } = useCurrency();
  const [returns, setReturns] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    orderId: '',
    description: '',
  });
  const [items, setItems] = useState<ReturnItemForm[]>([{ productId: '', quantity: 1, reason: '' }]);

  useEffect(() => {
    const loadReturns = async () => {
      setIsLoading(true);
      try {
        const response = await returnsAPI.getReturns();
        setReturns(parseReturns(response));
      } catch (error) {
        setReturns([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadReturns();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleItemChange = (index: number, field: keyof ReturnItemForm, value: string | number) => {
    setItems(prev =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)),
    );
  };

  const addItemRow = () => setItems(prev => [...prev, { productId: '', quantity: 1, reason: '' }]);

  const removeItemRow = (index: number) => setItems(prev => prev.filter((_, idx) => idx !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const preparedItems = items
      .filter(item => item.productId && item.reason)
      .map(item => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity) || 1,
        reason: item.reason,
      }));

    if (!preparedItems.length) {
      toast.error('Add at least one product with a reason');
      return;
    }

    try {
      await returnsAPI.createReturn({
        orderId: formData.orderId,
        items: preparedItems,
        description: formData.description,
      });
      toast.success('Return request submitted successfully!');
      setIsDialogOpen(false);
      setFormData({ orderId: '', description: '' });
      setItems([{ productId: '', quantity: 1, reason: '' }]);
      const refreshed = await returnsAPI.getReturns();
      setReturns(parseReturns(refreshed));
    } catch (error) {
      toast.error('Failed to submit return request');
    }
  };

  const getStatusColor = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'approved': return 'bg-green-500/10 text-green-500';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500';
      case 'rejected': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <AccountLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Returns & Refunds</h1>
            <p className="text-muted-foreground mt-2">Manage your return requests</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full" onClick={() => {
                setFormData({ orderId: '', description: '' });
                setItems([{ productId: '', quantity: 1, reason: '' }]);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                New Return
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Return Request</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orderId">Order ID</Label>
                  <Input
                    id="orderId"
                    name="orderId"
                    placeholder="e.g., PE2LCHLRO"
                    value={formData.orderId}
                    onChange={handleChange}
                    required
                    className="rounded-full"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Items to Return</Label>
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end border rounded-2xl p-3">
                      <div className="space-y-2">
                        <Label htmlFor={`productId-${index}`}>Product ID</Label>
                        <Input
                          id={`productId-${index}`}
                          value={item.productId}
                          onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                          placeholder="e.g. 101"
                          required
                          className="rounded-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                          className="rounded-full"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Reason</Label>
                        <Select
                          value={item.reason}
                          onValueChange={(value) => handleItemChange(index, 'reason', value)}
                        >
                          <SelectTrigger className="rounded-full">
                            <SelectValue placeholder="Select a reason" />
                          </SelectTrigger>
                          <SelectContent>
                            {reasonOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="rounded-full"
                          onClick={() => removeItemRow(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" className="rounded-full" onClick={addItemRow}>
                    Add Another Item
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Please provide details about the issue..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="rounded-2xl"
                  />
                </div>
                <Button type="submit" className="w-full rounded-full">
                  Submit Return Request
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-card rounded-3xl p-12 border border-border text-center">
              <p className="text-muted-foreground">Loading return requests...</p>
            </div>
          ) : returns.length === 0 ? (
            <div className="bg-card rounded-3xl p-12 border border-border text-center">
              <RotateCcw className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No return requests</h3>
              <p className="text-muted-foreground">
                You haven&apos;t submitted any return requests yet
              </p>
            </div>
          ) : (
            returns.map((returnItem) => (
              <div key={returnItem.id} className="bg-card rounded-3xl p-6 border border-border">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <RotateCcw className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">Return #{returnItem.id}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(returnItem.status)}`}>
                          {returnItem.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Order #{returnItem.orderId} • {new Date(returnItem.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Reason: {returnItem.reason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Refund Amount</p>
                    <p className="text-2xl font-bold text-foreground">{formatPrice(returnItem.refundAmount)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AccountLayout>
  );
}
