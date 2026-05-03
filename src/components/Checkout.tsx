import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, Package, CreditCard, Activity, Copy, Check, MessageCircle, Tag, Upload, Database, Lock, Truck } from 'lucide-react';
import type { CartItem } from '../types';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { useShippingLocations } from '../hooks/useShippingLocations';
import { useCouriers } from '../hooks/useCouriers';
import { useSiteSettings } from '../hooks/useSiteSettings';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const supabaseHeaders = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
};

async function supabaseRest<T = any>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
        ...init,
        headers: { ...supabaseHeaders, ...(init.headers || {}) },
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Supabase error ${res.status}: ${text}`);
    }
    if (res.status === 204) return undefined as T;
    return res.json();
}

async function uploadPaymentProof(file: File): Promise<string> {
    const ext = file.name.split('.').pop() || 'png';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const uploadRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/payment-proofs/${fileName}`,
        {
            method: 'POST',
            headers: {
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': file.type || 'application/octet-stream',
                'x-upsert': 'true',
            },
            body: file,
        },
    );
    if (!uploadRes.ok) {
        const text = await uploadRes.text();
        throw new Error(`Upload failed ${uploadRes.status}: ${text}`);
    }
    return `${SUPABASE_URL}/storage/v1/object/public/payment-proofs/${fileName}`;
}

interface CheckoutProps {
    cartItems: CartItem[];
    totalPrice: number;
    onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, totalPrice, onBack }) => {
    const { paymentMethods } = usePaymentMethods();
    const { locations: shippingLocations } = useShippingLocations();
    const { couriers } = useCouriers();
    const { siteSettings } = useSiteSettings();

    const whatsappEnabled = siteSettings?.contact_whatsapp_enabled === 'true';
    const telegramEnabled = siteSettings?.contact_telegram_enabled === 'true';
    const whatsappNumbers = (siteSettings?.contact_whatsapp_number || '').split(',').map(s => s.trim()).filter(Boolean);
    const telegramLinks = (siteSettings?.contact_telegram_link || '').split(',').map(s => s.trim()).filter(Boolean);
    const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details');

    // Customer Details
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    // Shipping Details
    const [address, setAddress] = useState('');
    const [barangay, setBarangay] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [selectedCourierId, setSelectedCourierId] = useState('');
    const [shippingLocation, setShippingLocation] = useState<string>('');

    // Payment
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [contactMethod, setContactMethod] = useState<'whatsapp' | 'telegram' | ''>('');
    const [notes, setNotes] = useState('');

    const [orderMessage, setOrderMessage] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const [contactOpened] = useState(false);

    const [orderNumber, setOrderNumber] = useState<string>('');

    // Payment Proof
    const [paymentProof, setPaymentProof] = useState<File | null>(null);
    const [isUploadingProof, setIsUploadingProof] = useState(false);

    // Medical Disclaimer
    const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

    // Promo Code State
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState<any>(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);
    const [promoError, setPromoError] = useState('');
    const [promoSuccess, setPromoSuccess] = useState('');

    React.useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

    // Auto-select contact method based on enabled settings
    React.useEffect(() => {
        if (!contactMethod) {
            if (whatsappEnabled) setContactMethod('whatsapp');
            else if (telegramEnabled) setContactMethod('telegram');
        }
    }, [whatsappEnabled, telegramEnabled, contactMethod]);

    React.useEffect(() => {
        if (paymentMethods.length > 0 && !selectedPaymentMethod) {
            setSelectedPaymentMethod(paymentMethods[0].id);
        }
    }, [paymentMethods, selectedPaymentMethod]);

    // Calculate shipping fee based on location
    const selectedLocation = shippingLocations.find(loc => loc.id === shippingLocation);
    const shippingFee = selectedLocation ? selectedLocation.fee : 0;

    // Calculate final total (Subtotal + Shipping - Discount)
    const finalTotal = Math.max(0, totalPrice + shippingFee - discountAmount);

    // Handle Promo Code Application
    const handleApplyPromoCode = async () => {
        setPromoError('');
        setPromoSuccess('');
        setAppliedPromo(null);
        setDiscountAmount(0);

        const code = promoCode.trim().toUpperCase();
        if (!code) {
            setPromoError('Please enter a promo code');
            return;
        }

        setIsApplyingPromo(true);

        try {
            const results = await supabaseRest<any[]>(
                `promo_codes?code=eq.${encodeURIComponent(code)}&limit=1`,
            );
            const promo = Array.isArray(results) ? results[0] : null;

            if (!promo || !promo.active) {
                setPromoError('Invalid or inactive promo code');
                setIsApplyingPromo(false);
                return;
            }

            // Check date validity
            const now = new Date();
            if (promo.start_date && new Date(promo.start_date) > now) {
                setPromoError('Promo code is not yet valid');
                setIsApplyingPromo(false);
                return;
            }
            if (promo.end_date && new Date(promo.end_date) < now) {
                setPromoError('Promo code has expired');
                setIsApplyingPromo(false);
                return;
            }

            // Check usage limits
            if (promo.usage_limit && promo.usage_count >= promo.usage_limit) {
                setPromoError('Promo code usage limit reached');
                setIsApplyingPromo(false);
                return;
            }

            // Check minimum purchase
            if (totalPrice < promo.min_purchase_amount) {
                setPromoError(`Minimum purchase of ₱${promo.min_purchase_amount} required`);
                setIsApplyingPromo(false);
                return;
            }

            // Calculate discount
            let discount = 0;
            if (promo.discount_type === 'percentage') {
                discount = (totalPrice * promo.discount_value) / 100;
                if (promo.max_discount_amount) {
                    discount = Math.min(discount, promo.max_discount_amount);
                }
            } else {
                discount = promo.discount_value;
            }

            discount = Math.min(discount, totalPrice);

            setDiscountAmount(discount);
            setAppliedPromo(promo);
            setPromoSuccess(`Promo code applied! You saved ₱${discount.toLocaleString()}`);
        } catch (err) {
            console.error('Error applying promo:', err);
            setPromoError('Failed to apply promo code');
        } finally {
            setIsApplyingPromo(false);
        }
    };

    const isDetailsValid =
        fullName.trim() !== '' &&
        email.trim() !== '' &&
        phone.trim() !== '' &&
        address.trim() !== '' &&
        barangay.trim() !== '' &&
        city.trim() !== '' &&
        state.trim() !== '' &&
        zipCode.trim() !== '' &&
        state.trim() !== '' &&
        zipCode.trim() !== '' &&
        selectedCourierId !== '' &&
        shippingLocation !== '';

    const handleProceedToPayment = () => {
        if (isDetailsValid) {
            setStep('payment');
        }
    };


    const handlePlaceOrder = async () => {
        if (!contactMethod) {
            alert('Please select your preferred contact method (Facebook or Viber).');
            return;
        }

        if (!shippingLocation) {
            alert('Please select your shipping location.');
            return;
        }

        if (!paymentProof) {
            alert('Please upload a screenshot of your payment proof to proceed.');
            return;
        }

        if (!disclaimerAccepted) {
            alert('Please read and check the Medical Disclaimer before completing your order.');
            const disclaimerEl = document.getElementById('medical-disclaimer');
            if (disclaimerEl) disclaimerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        const paymentMethod = paymentMethods.find(pm => pm.id === selectedPaymentMethod);

        try {
            // 1. Upload Payment Proof First
            let paymentProofUrl: string | null = null;
            if (paymentProof) {
                setIsUploadingProof(true);
                try {
                    paymentProofUrl = await uploadPaymentProof(paymentProof);
                } catch (uploadError: any) {
                    console.error('Failed to upload payment proof:', uploadError);
                    alert(`Failed to upload payment proof: ${uploadError.message}`);
                    setIsUploadingProof(false);
                    return;
                } finally {
                    setIsUploadingProof(false);
                }
            }

            const orderItems = cartItems.map(item => {
                const basePrice = item.variation ? item.variation.price : item.product.base_price;
                let currentPrice = basePrice;
                const isDiscounted = item.variation
                    ? (item.variation.discount_active && item.variation.discount_price !== null && item.variation.discount_price < basePrice)
                    : (item.product.discount_active && item.product.discount_price !== null && item.product.discount_price < item.product.base_price);
                if (isDiscounted) {
                    currentPrice = item.variation?.discount_price || item.product.discount_price || basePrice;
                }

                return {
                    product_id: item.product.id,
                    product_name: item.product.name,
                    variation_id: item.variation?.id || null,
                    variation_name: item.variation?.name || null,
                    quantity: item.quantity,
                    price: currentPrice,
                    total: currentPrice * item.quantity,
                    purity_percentage: item.product.purity_percentage
                };
            });

            // Generate order number before saving
            const randomDigits = Math.floor(Math.random() * 9000 + 1000); // 1000-9999
            const customOrderNumber = `BRC-${randomDigits}`;

            let orderData;
            try {
                const inserted = await supabaseRest<any[]>('orders', {
                    method: 'POST',
                    headers: { Prefer: 'return=representation' },
                    body: JSON.stringify({
                        customer_name: fullName,
                        customer_email: email,
                        customer_phone: phone,
                        shipping_address: address,
                        shipping_barangay: barangay,
                        shipping_city: city,
                        shipping_state: state,
                        shipping_zip_code: zipCode,
                        order_items: orderItems,
                        subtotal: totalPrice,
                        total_price: Math.max(0, totalPrice - discountAmount),
                        shipping_fee: shippingFee,
                        courier_id: selectedCourierId || null,
                        shipping_location: shippingLocation,
                        payment_method_id: paymentMethod?.id ?? null,
                        payment_method_name: paymentMethod?.name ?? null,
                        payment_proof_url: paymentProofUrl,
                        contact_method: contactMethod || null,
                        notes: notes.trim() || null,
                        order_status: 'new',
                        payment_status: 'pending',
                        promo_code_id: appliedPromo?.id ?? null,
                        promo_code: appliedPromo?.code ?? null,
                        discount_applied: discountAmount,
                        order_number: customOrderNumber,
                    }),
                });
                orderData = Array.isArray(inserted) ? inserted[0] : inserted;
            } catch (orderError: any) {
                console.error('❌ Error saving order:', orderError);
                alert(`Failed to save order: ${orderError?.message ?? 'Unknown error'}\n\nPlease contact support if this issue persists.`);
                return;
            }

            if (appliedPromo) {
                try {
                    await supabaseRest(`promo_codes?id=eq.${appliedPromo.id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({
                            usage_count: (appliedPromo.usage_count ?? 0) + 1,
                        }),
                    });
                } catch (promoUpdateError) {
                    console.error('Failed to update promo usage count:', promoUpdateError);
                }
            }

            console.log('✅ Order saved to database:', orderData);

            setOrderNumber(customOrderNumber);

            // Get current date and time
            const now = new Date();
            const dateTimeStamp = now.toLocaleString('en-PH', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });

            const orderDetails = `
✨ Pepstack Davao - NEW ORDER

📅 ORDER DATE & TIME
${dateTimeStamp}

👤 CUSTOMER INFORMATION
Name: ${fullName}
Email: ${email}
Phone: ${phone}

📦 SHIPPING ADDRESS
${address}
${barangay}
${city}, ${state} ${zipCode}
Courier: ${couriers.find(c => c.id === selectedCourierId)?.name || 'N/A'}

🛒 ORDER DETAILS
${cartItems.map(item => {
                let line = `• ${item.product.name}`;
                if (item.variation) {
                    line += ` (${item.variation.name})`;
                }
                const basePrice = item.variation ? item.variation.price : item.product.base_price;
                let currentPrice = basePrice;
                const isDiscounted = item.variation
                    ? (item.variation.discount_active && item.variation.discount_price !== null && item.variation.discount_price < basePrice)
                    : (item.product.discount_active && item.product.discount_price !== null && item.product.discount_price < item.product.base_price);
                if (isDiscounted) {
                    currentPrice = item.variation?.discount_price || item.product.discount_price || basePrice;
                }

                line += ` x${item.quantity} - ₱${(currentPrice * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 0 })}`;
                if (item.product.purity_percentage && item.product.purity_percentage > 0) {
                    line += `\n  Purity: ${item.product.purity_percentage}%`;
                }
                return line;
            }).join('\n\n')}

💰 PRICING
Product Total: ₱${totalPrice.toLocaleString('en-PH', { minimumFractionDigits: 0 })}
Shipping Fee: ₱${shippingFee.toLocaleString('en-PH', { minimumFractionDigits: 0 })} (${shippingLocation.replace('_', ' & ')})
${discountAmount > 0 ? `Discount (${appliedPromo?.code}): -₱${discountAmount.toLocaleString('en-PH', { minimumFractionDigits: 0 })}\n` : ''}Grand Total: ₱${finalTotal.toLocaleString('en-PH', { minimumFractionDigits: 0 })}

💳 PAYMENT METHOD
${paymentMethod?.name || 'N/A'}
      ${paymentMethod ? `Account: ${paymentMethod.account_number}` : ''}

📸 PROOF OF PAYMENT
${paymentProofUrl ? 'Screenshot attached to order.' : 'Pending'}

📱 CONTACT METHOD
Facebook Messenger

📋 ORDER NUMBER: ${customOrderNumber}

Please confirm this order. Thank you!
      `.trim();

            setOrderMessage(orderDetails);

            // Auto-copy to clipboard
            try {
                await navigator.clipboard.writeText(orderDetails);
                setCopied(true);
            } catch (err) {
                console.error('Failed to auto-copy:', err);
            }

            // Show confirmation
            setStep('confirmation');

            // Auto-open Facebook Messenger
            setTimeout(() => {
                window.open('https://www.facebook.com/share/1CJZ5FTx2N/?mibextid=wwXIfr', '_blank');
            }, 1500);
        } catch (error) {
            console.error('❌ Error placing order:', error);
            alert(`Failed to place order: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
        }
    };

    const handleCopyMessage = async () => {
        try {
            await navigator.clipboard.writeText(orderMessage);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch (error) {
            console.error('Failed to copy:', error);
            // Fallback
            alert('Failed to copy. Please manually select and copy the message.');
        }
    };

    const handleOpenContact = () => {
        window.open('https://www.facebook.com/share/1CJZ5FTx2N/?mibextid=wwXIfr', '_blank');
    };

    if (step === 'confirmation') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white via-brand-50 to-white flex items-center justify-center px-4 py-12">
                <div className="max-w-2xl w-full">
                    <div className="bg-white rounded shadow-clinical p-8 md:p-12 text-center border border-gray-100">
                        <div className="bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <ShieldCheck className="w-12 h-12 text-emerald-600" />
                        </div>
                        <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal-900 mb-4 tracking-tight">
                            Order Confirmed
                        </h1>
                        <p className="text-gray-600 mb-4 text-base md:text-lg leading-relaxed">
                            Your order details have been copied. Send them to us on Facebook Messenger to finalize your order!
                        </p>

                        {/* Order ID Display */}
                        {orderNumber && (
                            <div className="bg-brand-50/20 border border-brand-100 rounded-lg p-4 mb-6">
                                <p className="text-sm text-brand-700 mb-1 font-bold uppercase tracking-wider">Order Reference</p>
                                <p className="text-2xl font-bold text-charcoal-900 font-mono">
                                    {orderNumber}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">Use this reference for tracking and support</p>
                            </div>
                        )}

                        {/* Order Message Display */}
                        <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-charcoal-900 flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5 text-brand-600" />
                                    Order Details
                                </h3>
                                <button
                                    onClick={handleCopyMessage}
                                    className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded font-medium transition-all text-sm shadow-sm"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="bg-white rounded p-4 border border-gray-300 max-h-64 overflow-y-auto">
                                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                                    {orderMessage}
                                </pre>
                            </div>
                            {copied && (
                                <p className="text-emerald-600 text-sm mt-2 flex items-center gap-1 font-medium">
                                    <Check className="w-4 h-4" />
                                    Copied to clipboard! Ready to send.
                                </p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 mb-8">
                            <button
                                onClick={handleOpenContact}
                                className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2 shadow-lg"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Open Facebook Messenger
                            </button>

                            <p className="text-sm text-gray-500">
                                If Facebook doesn't open automatically, please send the copied order details to our <span className="font-bold">Pepstack Davao Facebook page</span>
                            </p>
                        </div>

                        <div className="bg-brand-50/20 rounded-lg p-6 mb-8 text-left border border-brand-100">
                            <h3 className="font-bold text-charcoal-900 mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-brand-600" />
                                Next Steps
                            </h3>
                            <ul className="space-y-3 text-sm text-gray-700">
                                <li className="flex items-start gap-3">
                                    <span className="font-bold text-brand-500">1.</span>
                                    <span>Confirmation within 24 hours of payment receipt.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="font-bold text-brand-500">2.</span>
                                    <span>Research-grade packaging and secure handling.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="font-bold text-brand-500">3.</span>
                                    <span>Same-day shipping for verified payments before 11 AM.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="font-bold text-brand-500">4.</span>
                                    <span>Tracking details sent via your selected contact method after dispatch.</span>
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={() => {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                window.location.href = '/';
                            }}
                            className="w-full btn-secondary py-3 flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Return to Catalog
                        </button>
                    </div>
                </div>
            </div >
        );
    }

    // Payment Step
    if (step === 'payment') {
        return (
            <div className="min-h-screen bg-cool-gray py-6 md:py-8">
                <div className="container mx-auto px-4 max-w-5xl">
                    <button
                        onClick={() => setStep('details')}
                        className="text-gray-500 hover:text-brand-600 font-medium mb-6 flex items-center gap-2 transition-colors group text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Details</span>
                    </button>

                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-900 mb-8 flex items-center gap-3">
                        Payment & Verification
                        <Lock className="w-6 h-6 text-brand-600" />
                    </h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">

                            {/* Payment Methods */}
                            <div className="bg-white rounded shadow-clinical p-6 border border-gray-100">
                                <h2 className="font-heading text-lg font-bold text-charcoal-900 mb-4 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-brand-600" />
                                    Select Payment Method
                                </h2>
                                <div className="space-y-3">
                                    {paymentMethods.map((method) => (
                                        <div key={method.id}>
                                            <label
                                                className={`block p-4 rounded border cursor-pointer transition-all ${selectedPaymentMethod === method.id
                                                    ? 'border-brand-500 bg-brand-50/20 ring-1 ring-brand-500'
                                                    : 'border-gray-200 hover:border-brand-300'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="radio"
                                                        name="paymentMethod"
                                                        value={method.id}
                                                        checked={selectedPaymentMethod === method.id}
                                                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                                        className="text-brand-600 focus:ring-brand-500"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="font-bold text-charcoal-900">{method.name}</p>
                                                                <p className="text-sm text-gray-600 font-mono mt-1">{method.account_number}</p>
                                                                {method.account_name && (
                                                                    <p className="text-xs text-gray-500 mt-0.5">Account Name: {method.account_name}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </label>

                                            {/* Show QR Code if this method is selected and has a QR code */}
                                            {selectedPaymentMethod === method.id && method.qr_code_url && (
                                                <div className="mt-2 ml-8 mb-4 p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 text-center">Scan to Pay</p>
                                                    <div className="flex justify-center">
                                                        <img
                                                            src={method.qr_code_url}
                                                            alt={`${method.name} QR Code`}
                                                            className="max-w-[200px] w-full h-auto rounded-lg border border-gray-200"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-center text-gray-400 mt-2">
                                                        Screenshot your payment and upload it below
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Proof Upload */}
                            <div className="bg-white rounded shadow-clinical p-6 border border-gray-100">
                                <h2 className="font-heading text-lg font-bold text-charcoal-900 mb-4 flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-brand-600" />
                                    Upload Proof of Payment
                                </h2>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand-400 transition-colors bg-gray-50/50">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setPaymentProof(e.target.files[0]);
                                            }
                                        }}
                                        className="hidden"
                                        id="payment-proof-upload"
                                    />
                                    <label htmlFor="payment-proof-upload" className="cursor-pointer flex flex-col items-center">
                                        {paymentProof ? (
                                            <>
                                                <Check className="w-12 h-12 text-emerald-600 mb-3" />
                                                <p className="font-medium text-charcoal-900">{paymentProof.name}</p>
                                                <p className="text-sm text-gray-500 mt-1">Click to change file</p>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                                                <p className="font-medium text-charcoal-900">Click to upload screenshot</p>
                                                <p className="text-xs text-gray-500 mt-1">Gcash/Bank transfer receipt</p>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="bg-white rounded shadow-clinical p-6 border border-gray-100">
                                <h2 className="font-heading text-lg font-bold text-charcoal-900 mb-4">
                                    Additional Notes (Optional)
                                </h2>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm h-24"
                                    placeholder="Special instructions for delivery..."
                                />
                            </div>

                            {/* Medical Disclaimer */}
                            <div id="medical-disclaimer" className={`bg-red-50/50 rounded-lg p-6 border transition-colors ${!disclaimerAccepted ? 'border-red-300 ring-1 ring-red-200' : 'border-red-100'}`}>
                                <h3 className="font-heading text-lg font-bold text-red-700 mb-3">
                                    Medical Disclaimer
                                </h3>
                                <p className="text-sm font-medium text-charcoal-900 mb-3">
                                    By purchasing this product, I confirm that:
                                </p>
                                <ul className="list-disc pl-5 space-y-1.5 text-sm text-charcoal-900 mb-4">
                                    <li>I do not have Medullary Thyroid Carcinoma (MTC) or Multiple Endocrine Neoplasia syndrome type 2 (MEN2).</li>
                                    <li>I am not pregnant or breastfeeding.</li>
                                    <li>I do not have pancreatitis or gallbladder issues.</li>
                                    <li>I do not have severe stomach problems.</li>
                                    <li>I have no known allergy to tirzepatide.</li>
                                    <li>I do not have an unstable thyroid condition.</li>
                                </ul>
                                <label className="flex items-start gap-3 p-3 bg-white border border-red-100 rounded cursor-pointer hover:bg-red-50/30 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={disclaimerAccepted}
                                        onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 shrink-0"
                                    />
                                    <span className="text-sm text-charcoal-900">
                                        I have read and understood the above, and I confirm that all statements are true.
                                    </span>
                                </label>
                            </div>

                            {!disclaimerAccepted && (
                                <p className="text-sm text-red-600 font-medium -mt-2 flex items-center gap-2">
                                    <span aria-hidden>⚠️</span>
                                    Please check the Medical Disclaimer above to complete your order.
                                </p>
                            )}

                            <button
                                onClick={handlePlaceOrder}
                                disabled={!paymentProof || isUploadingProof}
                                className="w-full btn-primary py-4 text-base shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isUploadingProof ? 'Uploading Proof...' : 'Complete Order'}
                            </button>
                        </div>

                        {/* Sidebar Summary (Reused logic, simplified UI) */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded shadow-clinical p-6 sticky top-24 border border-gray-100">
                                <h3 className="font-heading font-bold text-charcoal-900 mb-4">Order Summary</h3>
                                <div className="space-y-2 mb-4">
                                    {cartItems.map((item, idx) => {
                                        const basePrice = item.variation ? item.variation.price : item.product.base_price;
                                        let currentPrice = basePrice;
                                        const isDiscounted = item.variation
                                            ? (item.variation.discount_active && item.variation.discount_price !== null && item.variation.discount_price < basePrice)
                                            : (item.product.discount_active && item.product.discount_price !== null && item.product.discount_price < item.product.base_price);
                                        if (isDiscounted) {
                                            currentPrice = item.variation?.discount_price || item.product.discount_price || basePrice;
                                        }

                                        return (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="text-gray-600">{item.quantity}x {item.product.name}</span>
                                                <span className="font-medium">₱{(currentPrice * item.quantity).toLocaleString()}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span>₱{totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping</span>
                                        <span>₱{shippingFee.toLocaleString()}</span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between text-emerald-600 font-medium">
                                            <span>Discount</span>
                                            <span>-₱{discountAmount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-charcoal-900 text-lg pt-2">
                                        <span>Total</span>
                                        <span>₱{finalTotal.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    // Details Step
    return (
        <div className="min-h-screen bg-cool-gray py-6 md:py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <button
                    onClick={onBack}
                    className="text-gray-500 hover:text-brand-600 font-medium mb-6 flex items-center gap-2 transition-colors group text-sm"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Cart</span>
                </button>

                <h1 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-900 mb-8 flex items-center gap-3">
                    Checkout Information
                    <Activity className="w-6 h-6 text-brand-600" />
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer Information */}
                        <div className="bg-white rounded shadow-clinical p-6 border border-gray-100">
                            <h2 className="font-heading text-lg font-bold text-charcoal-900 mb-6 flex items-center gap-2">
                                <div className="bg-brand-50 p-2 rounded text-brand-600">
                                    <Package className="w-5 h-5" />
                                </div>
                                Customer Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="input-field"
                                        placeholder="Juan Dela Cruz"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-field"
                                        placeholder="juan@example.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="input-field"
                                        placeholder="09XX XXX XXXX"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white rounded shadow-clinical p-6 border border-gray-100">
                            <h2 className="font-heading text-lg font-bold text-charcoal-900 mb-6 flex items-center gap-2">
                                <div className="bg-brand-50 p-2 rounded text-brand-600">
                                    <Database className="w-5 h-5" />
                                </div>
                                Shipping Address
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-2">
                                        Street Address *
                                    </label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="input-field"
                                        placeholder="House/Unit, Street Name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-2">
                                        Barangay *
                                    </label>
                                    <input
                                        type="text"
                                        value={barangay}
                                        onChange={(e) => setBarangay(e.target.value)}
                                        className="input-field"
                                        placeholder="Brgy. Name"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-2">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            className="input-field"
                                            placeholder="City"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-2">
                                            Province *
                                        </label>
                                        <input
                                            type="text"
                                            value={state}
                                            onChange={(e) => setState(e.target.value)}
                                            className="input-field"
                                            placeholder="Province"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-2">
                                        ZIP/Postal Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={zipCode}
                                        onChange={(e) => setZipCode(e.target.value)}
                                        className="input-field"
                                        placeholder="ZIP Code"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Method */}
                        <div className="bg-white rounded shadow-clinical p-6 border border-gray-100">
                            <h2 className="font-heading text-lg font-bold text-charcoal-900 mb-3 flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-brand-600" />
                                Contact Method *
                            </h2>
                            <p className="text-xs text-gray-500 mb-4">
                                Select how you'd like us to contact you about your order.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {whatsappEnabled && (
                                    <button
                                        onClick={() => setContactMethod('whatsapp')}
                                        className={`p-4 rounded border transition-all text-left flex items-center gap-3 ${contactMethod === 'whatsapp'
                                            ? 'border-green-500 bg-green-50 ring-1 ring-green-500'
                                            : 'border-gray-200 hover:border-green-300'
                                        }`}
                                    >
                                        <svg className="w-6 h-6 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                        </svg>
                                        <div>
                                            <p className="font-bold text-charcoal-900 text-sm">WhatsApp</p>
                                            {whatsappNumbers.map((num, i) => (
                                                <p key={i} className="text-xs text-gray-500">{num}</p>
                                            ))}
                                        </div>
                                    </button>
                                )}
                                {telegramEnabled && (
                                    <button
                                        onClick={() => setContactMethod('telegram')}
                                        className={`p-4 rounded border transition-all text-left flex items-center gap-3 ${contactMethod === 'telegram'
                                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                            : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                    >
                                        <svg className="w-6 h-6 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                        </svg>
                                        <div>
                                            <p className="font-bold text-charcoal-900 text-sm">Telegram</p>
                                            {telegramLinks.map((link, i) => (
                                                <p key={i} className="text-xs text-gray-500">{link}</p>
                                            ))}
                                        </div>
                                    </button>
                                )}
                                {!whatsappEnabled && !telegramEnabled && (
                                    <div className="col-span-full p-4 rounded border border-gray-200 bg-gray-50 text-center">
                                        <p className="text-sm text-gray-500">No contact methods are currently configured.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Courier Selection */}
                    <div className="bg-white rounded shadow-clinical p-6 border border-gray-100">
                        <h2 className="font-heading text-lg font-bold text-charcoal-900 mb-3 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-brand-600" />
                            Select Courier Provider *
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {couriers
                                .filter(c => c.is_active)
                                .map((courier) => (
                                    <button
                                        key={courier.id}
                                        onClick={() => {
                                            setSelectedCourierId(courier.id);
                                            setShippingLocation(''); // Reset location when courier changes
                                        }}
                                        className={`p-4 rounded border transition-all text-left flex items-center gap-3 ${selectedCourierId === courier.id
                                            ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600'
                                            : 'border-gray-200 hover:border-brand-300'
                                            }`}
                                    >
                                        <div className="font-bold text-charcoal-900 text-sm">{courier.name}</div>
                                    </button>
                                ))}
                        </div>
                    </div>

                    {/* Shipping Location Selection */}
                    <div className={`bg-white rounded shadow-clinical p-6 border border-gray-100 transition-opacity duration-300 ${!selectedCourierId ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <h2 className="font-heading text-lg font-bold text-charcoal-900 mb-3 flex items-center gap-2">
                            Choose Shipping Region *
                        </h2>
                        <p className="text-xs text-gray-500 mb-6 bg-blue-50 p-3 rounded border border-blue-100">
                            {selectedCourierId
                                ? 'Select the rate applicable to your location.'
                                : 'Please select a courier provider above first.'}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {(() => {
                                if (!selectedCourierId) return [];
                                const courier = couriers.find(c => c.id === selectedCourierId);
                                if (!courier) return [];
                                const code = courier.code.toLowerCase();
                                const matched = shippingLocations.filter(loc => {
                                    const locId = loc.id.toLowerCase();
                                    const locName = loc.name.toLowerCase();
                                    return locId.includes(code) || locName.includes(code);
                                });
                                // Fall back to all locations if none match the courier code
                                return matched.length > 0 ? matched : shippingLocations;
                            })()
                                .map((loc) => (
                                    <button
                                        key={loc.id}
                                        onClick={() => setShippingLocation(loc.id)}
                                        className={`p-4 rounded border transition-all text-left ${shippingLocation === loc.id
                                            ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600'
                                            : 'border-gray-200 hover:border-brand-300'
                                            }`}
                                    >
                                        <p className="font-bold text-charcoal-900 text-sm mb-1">{loc.name || loc.id.replace('_', ' & ')}</p>
                                        <p className="text-xs text-brand-600 font-medium">₱{loc.fee}</p>
                                    </button>
                                ))}
                        </div>
                    </div>

                    <button
                        onClick={handleProceedToPayment}
                        disabled={!isDetailsValid}
                        className={`w-full py-4 rounded font-bold text-base transition-all transform shadow-md ${isDetailsValid
                            ? 'btn-primary hover:scale-[1.01]'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Proceed to Payment
                    </button>
                </div>

                {/* Order Summary Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded shadow-clinical p-6 sticky top-24 border border-gray-100">
                        <h2 className="font-heading text-lg font-bold text-charcoal-900 mb-6 flex items-center gap-2">
                            Order Summary
                            <Activity className="w-4 h-4 text-brand-600" />
                        </h2>

                        <div className="space-y-4 mb-6">
                            {cartItems.map((item, index) => {
                                const basePrice = item.variation ? item.variation.price : item.product.base_price;
                                let currentPrice = basePrice;
                                const isDiscounted = item.variation
                                    ? (item.variation.discount_active && item.variation.discount_price !== null && item.variation.discount_price < basePrice)
                                    : (item.product.discount_active && item.product.discount_price !== null && item.product.discount_price < item.product.base_price);

                                if (isDiscounted) {
                                    currentPrice = item.variation?.discount_price || item.product.discount_price || basePrice;
                                }

                                return (
                                    <div key={index} className="pb-4 border-b border-gray-100">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-charcoal-900 text-sm">{item.product.name}</h4>
                                                {item.variation && (
                                                    <p className="text-xs text-gray-600 mt-0.5">{item.variation.name}</p>
                                                )}
                                            </div>
                                            <span className="font-bold text-charcoal-900 text-sm">
                                                ₱{(currentPrice * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 0 })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Promo Code */}
                        <div className="mb-6 pt-2">
                            <p className="text-xs font-bold text-brand-700 uppercase mb-2 flex items-center gap-1">
                                <Tag className="w-3 h-3" /> Promo Code
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    placeholder="ENTER CODE"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none uppercase"
                                    disabled={!!appliedPromo || isApplyingPromo}
                                />
                                {appliedPromo ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAppliedPromo(null);
                                            setDiscountAmount(0);
                                            setPromoCode('');
                                            setPromoSuccess('');
                                        }}
                                        className="px-3 py-2 bg-red-50 text-red-600 rounded text-xs font-bold border border-red-100 hover:bg-red-100 shrink-0 whitespace-nowrap"
                                    >
                                        REMOVE
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleApplyPromoCode}
                                        disabled={!promoCode || isApplyingPromo}
                                        className="px-3 py-2 bg-brand-600 text-white rounded text-xs font-bold hover:bg-brand-700 disabled:opacity-50 shrink-0 whitespace-nowrap"
                                    >
                                        APPLY
                                    </button>
                                )}
                            </div>
                            {promoError && <p className="text-red-500 text-xs mt-1">{promoError}</p>}
                            {promoSuccess && <p className="text-emerald-600 text-xs mt-1 font-medium">{promoSuccess}</p>}
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-4">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>₱{totalPrice.toLocaleString()}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-emerald-600 font-medium">
                                    <span>Discount</span>
                                    <span>-₱{discountAmount.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-charcoal-900 text-base pt-2">
                                <span>Total Estimate</span>
                                <span>₱{Math.max(0, totalPrice - discountAmount).toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-gray-400 text-right italic">+ Shipping fee added at payment</p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
