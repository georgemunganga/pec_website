import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cartAPI, ordersAPI } from "@/services/api";

const deliveryOptions = [
  { id: "standard", label: "Standard Delivery", detail: "3-5 business days", note: "Free on orders over K500" },
  { id: "express", label: "Express Courier", detail: "1-2 business days", note: "+ K80 priority shipping" },
  { id: "pickup", label: "Boutique Pickup", detail: "Same day", note: "Collect at our Cairo Road Studio" },
];

const paymentOptions = [
  {
    id: "mobile_money" as const,
    title: "Mobile Money",
    description: "Pay with MTN or Airtel. We'll confirm payment after checkout.",
  },
  {
    id: "card" as const,
    title: "Credit / Debit Card",
    description: "Secure Stripe checkout for Visa, Mastercard & UnionPay cards.",
  },
  {
    id: "paypal" as const,
    title: "PayPal",
    description: "Sign in to PayPal for express checkout and buyer protection.",
  },
];

type PaymentMethod = (typeof paymentOptions)[number]["id"];

export default function Checkout() {
  const {
    cart,
    summary,
    shippingDetails,
    saveShippingDetails,
    quoteCart,
    clearCart,
    isSyncing,
    refreshCart,
  } = useCart();
  const { formatPrice } = useCurrency();
  const [, setLocation] = useLocation();
  const [shippingForm, setShippingForm] = useState(shippingDetails);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(summary.couponCode ?? null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [isSavingShipping, setIsSavingShipping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mobile_money");
  const [cardDetails, setCardDetails] = useState({ number: "", exp: "", cvc: "" });
  const [paypalAuthorized, setPaypalAuthorized] = useState(false);
  const [notes, setNotes] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setShippingForm(prev => ({ ...prev, ...shippingDetails }));
  }, [shippingDetails]);

  useEffect(() => {
    if (summary.couponCode) {
      setAppliedCoupon(summary.couponCode);
    }
  }, [summary.couponCode]);

  useEffect(() => {
    if (!isSyncing && cart.length === 0) {
      setLocation("/cart");
    }
  }, [cart.length, isSyncing, setLocation]);

  if (isSyncing && cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading your cart...</p>
      </div>
    );
  }

  if (!isSyncing && cart.length === 0) {
    return null;
  }

  const subtotal = summary.subtotal;
  const shippingCost = summary.shipping;
  const taxAmount = summary.tax;
  const discountAmount = summary.discount;
  const total = summary.total;

  const handleFieldChange = (field: keyof typeof shippingForm, value: string) => {
    setShippingForm(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleDeliveryOption = (optionId: string) => {
    setShippingForm(prev => ({ ...prev, deliveryOption: optionId }));
  };

  const validateRequiredFields = (fields: Array<keyof typeof shippingForm>) => {
    const errors: Record<string, string> = {};
    fields.forEach((field) => {
      if (!shippingForm[field]) {
        errors[field] = "This field is required";
      }
    });
    if (Object.keys(errors).length) {
      setFormErrors(prev => ({ ...prev, ...errors }));
      return false;
    }
    return true;
  };

  const handleSaveShipping = async () => {
    if (!validateRequiredFields(["fullName", "line1", "city", "country", "email", "phone"])) {
      toast.error("Please complete the highlighted fields.");
      return;
    }
    setIsSavingShipping(true);
    try {
      await saveShippingDetails(shippingForm);
      await quoteCart(shippingForm);
      toast.success("Delivery preferences saved");
    } catch (error) {
      toast.error("Failed to update delivery preferences");
    } finally {
      setIsSavingShipping(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    setApplyingCoupon(true);
    try {
      await cartAPI.applyCoupon(couponCode.trim());
      await refreshCart();
      setAppliedCoupon(couponCode.trim().toUpperCase());
      toast.success("Coupon applied");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to apply coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setApplyingCoupon(true);
    try {
      await cartAPI.removeCoupon();
      await refreshCart();
      setAppliedCoupon(null);
      setCouponCode("");
      toast.success("Coupon removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const ensurePaymentAuthorization = () => {
    if (paymentMethod === "card") {
      if (!cardDetails.number || !cardDetails.exp || !cardDetails.cvc) {
        toast.error("Enter your card details to continue");
        return false;
      }
    }
    if (paymentMethod === "paypal" && !paypalAuthorized) {
      toast.error("Authorize PayPal before placing the order");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validContact = validateRequiredFields(["fullName", "email", "phone"]);
    const validAddress = validateRequiredFields(["line1", "city", "country"]);
    if (!validContact || !validAddress) {
      toast.error("Please complete the highlighted fields.");
      return;
    }
    if (!ensurePaymentAuthorization()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const paymentToken =
        paymentMethod === "card"
          ? btoa(`${cardDetails.number.slice(-4)}|${cardDetails.exp}`)
          : paymentMethod === "paypal"
          ? "paypal_authorized"
          : undefined;

      await saveShippingDetails(shippingForm);

      await ordersAPI.createOrder({
        paymentMethod,
        couponCode: appliedCoupon ?? undefined,
        contact: {
          name: shippingForm.fullName,
          email: shippingForm.email,
          phone: shippingForm.phone,
        },
        shippingDetails: shippingForm,
        deliveryOption: shippingForm.deliveryOption,
        notes,
        paymentToken,
      });
      await clearCart();
      toast.success("Order placed successfully!");
      setLocation("/thank-you");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentDescription = useMemo(
    () => paymentOptions.find(option => option.id === paymentMethod)?.description ?? "",
    [paymentMethod],
  );

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-card rounded-lg p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Contact Information</h2>
                  <p className="text-sm text-muted-foreground">We send order updates to this email and phone number.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={shippingForm.fullName}
                      onChange={e => handleFieldChange("fullName", e.target.value)}
                      placeholder="Enter your full name"
                      aria-invalid={!!formErrors.fullName}
                      />
                    {formErrors.fullName && <p className="text-xs text-destructive">{formErrors.fullName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingForm.email}
                      onChange={e => handleFieldChange("email", e.target.value)}
                      placeholder="you@example.com"
                      aria-invalid={!!formErrors.email}
                    />
                    {formErrors.email && <p className="text-xs text-destructive">{formErrors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={shippingForm.phone}
                      onChange={e => handleFieldChange("phone", e.target.value)}
                      placeholder="+260 97 000 0000"
                      aria-invalid={!!formErrors.phone}
                    />
                    {formErrors.phone && <p className="text-xs text-destructive">{formErrors.phone}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={shippingForm.country}
                      onChange={e => handleFieldChange("country", e.target.value)}
                      placeholder="Zambia"
                      aria-invalid={!!formErrors.country}
                    />
                    {formErrors.country && <p className="text-xs text-destructive">{formErrors.country}</p>}
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Shipping Address</h2>
                  <p className="text-sm text-muted-foreground">Choose your delivery destination and method.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="line1">Address Line 1 *</Label>
                  <Input
                    id="line1"
                    value={shippingForm.line1}
                    onChange={e => handleFieldChange("line1", e.target.value)}
                    placeholder="Street name and number"
                    aria-invalid={!!formErrors.line1}
                  />
                  {formErrors.line1 && <p className="text-xs text-destructive">{formErrors.line1}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="line2">Address Line 2</Label>
                  <Input
                    id="line2"
                    value={shippingForm.line2 ?? ""}
                    onChange={e => handleFieldChange("line2", e.target.value)}
                    placeholder="Apartment, suite, etc. (optional)"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={shippingForm.city}
                      onChange={e => handleFieldChange("city", e.target.value)}
                      placeholder="Lusaka"
                      aria-invalid={!!formErrors.city}
                    />
                    {formErrors.city && <p className="text-xs text-destructive">{formErrors.city}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region / Province</Label>
                    <Input
                      id="region"
                      value={shippingForm.region ?? ""}
                      onChange={e => handleFieldChange("region", e.target.value)}
                      placeholder="Central Province"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={shippingForm.postalCode ?? ""}
                      onChange={e => handleFieldChange("postalCode", e.target.value)}
                      placeholder="10101"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-semibold">Delivery Option</Label>
                  <div className="grid gap-3">
                    {deliveryOptions.map(option => (
                      <button
                        type="button"
                        key={option.id}
                        onClick={() => handleDeliveryOption(option.id)}
                        className={`rounded-xl border p-4 text-left transition ${
                          shippingForm.deliveryOption === option.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{option.label}</p>
                            <p className="text-sm text-muted-foreground">{option.detail}</p>
                          </div>
                          <span className="text-sm font-medium">{option.note}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button type="button" variant="outline" onClick={handleSaveShipping} disabled={isSavingShipping}>
                  {isSavingShipping ? "Saving..." : "Save & Refresh Totals"}
                </Button>
              </div>

              <div className="bg-card rounded-lg p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Payment Method</h2>
                  <p className="text-sm text-muted-foreground">{paymentDescription}</p>
                </div>

                <div className="grid gap-3">
                  {paymentOptions.map(option => (
                    <button
                      type="button"
                      key={option.id}
                      onClick={() => setPaymentMethod(option.id)}
                      className={`rounded-xl border p-4 text-left transition ${
                        paymentMethod === option.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <p className="font-semibold">{option.title}</p>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </button>
                  ))}
                </div>

                {paymentMethod === "card" && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="4242 4242 4242 4242"
                        value={cardDetails.number}
                        onChange={e => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardExp">Expiry</Label>
                      <Input
                        id="cardExp"
                        placeholder="MM / YY"
                        value={cardDetails.exp}
                        onChange={e => setCardDetails(prev => ({ ...prev, exp: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardCvc">CVC</Label>
                      <Input
                        id="cardCvc"
                        placeholder="123"
                        value={cardDetails.cvc}
                        onChange={e => setCardDetails(prev => ({ ...prev, cvc: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === "paypal" && (
                  <div className="bg-secondary/40 rounded-xl p-4 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Authorize PayPal to redirect you back with a confirmed payment token.
                    </p>
                    <Button
                      type="button"
                      variant={paypalAuthorized ? "secondary" : "outline"}
                      onClick={() => {
                        setPaypalAuthorized(true);
                        toast.success("PayPal account authorized");
                      }}
                    >
                      {paypalAuthorized ? "PayPal Authorized" : "Authorize PayPal"}
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Order Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Add gift notes or delivery instructions..."
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : "Place Order"}
                </Button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg p-6 shadow-sm sticky top-20 space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Order Summary</h2>
                <p className="text-sm text-muted-foreground">
                  {cart.length} {cart.length === 1 ? "item" : "items"} in your bag
                </p>
              </div>

              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {cart.map(item => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="w-16 h-16 rounded overflow-hidden bg-secondary flex-shrink-0">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-primary">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">{formatPrice(taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {shippingCost > 0 ? formatPrice(shippingCost) : "Calculated after address"}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <Label className="text-sm font-medium">Have a coupon?</Label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-sm font-semibold text-green-700">{appliedCoupon}</p>
                      <p className="text-xs text-green-600">Discount applied</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleRemoveCoupon} disabled={applyingCoupon}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                    />
                    <Button variant="outline" onClick={handleApplyCoupon} disabled={applyingCoupon}>
                      {applyingCoupon ? "..." : "Apply"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
