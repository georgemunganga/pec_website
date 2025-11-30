import { useEffect, useState } from 'react';
import { AccountLayout } from '@/components/AccountLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { addressesAPI } from '@/services/api';
import { toast } from 'sonner';
import { MapPin, Plus, Trash2, Check } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/store/queryKeys';

export default function Addresses() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    postalCode: '',
    phone: '',
  });
  const queryClient = useQueryClient();

  const parseAddresses = (payload: any): any[] => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.data?.addresses)) return payload.data.addresses;
    return [];
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', street: '', city: '', postalCode: '', phone: '' });
    setEditingAddress(null);
  };

  const loadAddresses = async () => {
    setIsLoading(true);
    try {
      const response = await addressesAPI.getAddresses();
      const parsed = parseAddresses(response);
      setAddresses(parsed);
      queryClient.setQueryData(queryKeys.addresses(), parsed);
    } catch (error) {
      toast.error('Unable to load addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAddress) {
        await addressesAPI.updateAddress(editingAddress.id, formData);
        toast.success('Address updated successfully!');
      } else {
        await addressesAPI.addAddress(formData);
        toast.success('Address added successfully!');
      }
      
      setIsDialogOpen(false);
      resetForm();
      loadAddresses();
    } catch (error) {
      toast.error('Failed to save address');
    }
  };

  const handleEdit = (address: any) => {
    setEditingAddress(address);
    setFormData({
      name: address.name || '',
      street: address.street || '',
      city: address.city || '',
      postalCode: address.postalCode || '',
      phone: address.phone || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    try {
      await addressesAPI.deleteAddress(id);
      toast.success('Address deleted successfully!');
      loadAddresses();
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await addressesAPI.setDefaultAddress(id);
      toast.success('Default address updated');
      loadAddresses();
    } catch (error) {
      toast.error('Failed to update default address');
    }
  };

  return (
    <AccountLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Shipping Addresses</h1>
            <p className="text-muted-foreground mt-2">Manage your delivery addresses</p>
          </div>
          
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                resetForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="rounded-full" onClick={() => { resetForm(); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Address Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Home, Office, etc."
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="rounded-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    required
                    className="rounded-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="rounded-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      required
                      className="rounded-full"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="rounded-full"
                  />
                </div>
                <Button type="submit" className="w-full rounded-full">
                  {editingAddress ? 'Update Address' : 'Add Address'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Addresses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-2 bg-card rounded-3xl p-12 border border-border text-center">
              <p className="text-muted-foreground">Loading addresses...</p>
            </div>
          ) : addresses.map((address) => (
            <div key={address.id} className="bg-card rounded-3xl p-6 border border-border relative">
              {address.isDefault && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    <Check className="h-3 w-3" />
                    Default
                  </span>
                </div>
              )}
              
              <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{address.name}</h3>
                </div>
              </div>

              <div className="text-sm text-muted-foreground space-y-1 mb-6">
                <p>{address.street}</p>
                <p>{address.city}, {address.postalCode}</p>
                <p className="pt-2">{address.phone}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-full"
                  onClick={() => handleEdit(address)}
                >
                  Edit
                </Button>
                {!address.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    Make Default
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => handleDelete(address.id)}
                  disabled={address.isDefault}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {!isLoading && addresses.length === 0 && (
            <div className="col-span-2 bg-card rounded-3xl p-12 border border-border text-center">
              <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No addresses yet</h3>
              <p className="text-muted-foreground">Add your first shipping address</p>
            </div>
          )}
        </div>
      </div>
    </AccountLayout>
  );
}
