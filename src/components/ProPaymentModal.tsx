import React, { useState } from 'react';
import {
  Crown,
  Check,
  ShieldCheck,
  Zap,
  Sliders,
  Activity,
  Sparkles,
  QrCode,
  Smartphone,
  CreditCard,
  X,
  Lock,
  ArrowRight,
  CheckCircle2,
  Volume2
} from 'lucide-react';
import { ThemeConfig } from '../types';

interface ProPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  isProUnlocked: boolean;
  onUnlockPro: () => void;
  theme: ThemeConfig;
  featureTrigger?: 'equalizer' | 'spectrum' | 'general';
}

export const ProPaymentModal: React.FC<ProPaymentModalProps> = ({
  isOpen,
  onClose,
  isProUnlocked,
  onUnlockPro,
  theme,
  featureTrigger = 'general',
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'qr'>('upi');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      onUnlockPro();
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 1400);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in select-none">
      <div
        id="aurapulse-pro-payment-modal"
        className="w-full max-w-md rounded-3xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.85)] border border-amber-500/30 flex flex-col relative animate-in zoom-in-95 backdrop-blur-3xl"
        style={{ backgroundColor: `${theme.surfaceDark}fa` }}
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="pro-modal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-all z-20 border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          /* Payment Success Animation Screen */
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-4 my-8 animate-in zoom-in">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.5)]">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
            </div>
            <h3 className="text-2xl font-extrabold text-white">AuraPulse PRO Unlocked!</h3>
            <p className="text-sm text-neutral-300 max-w-xs">
              Hardware Equalizer, Live Spectrum Visualizers & Pro Themes are now fully active for lifetime.
            </p>
          </div>
        ) : (
          <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[90vh]">
            {/* Header / Crown Banner */}
            <div className="text-center space-y-2 pt-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 shadow-[0_0_30px_rgba(245,158,11,0.5)] p-0.5 mb-1">
                <div className="w-full h-full bg-neutral-950/80 rounded-[14px] flex items-center justify-center">
                  <Crown className="w-7 h-7 text-amber-400 fill-amber-400/20 animate-pulse" />
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                  AuraPulse <span className="text-amber-400">PRO</span>
                </h2>
              </div>
              <p className="text-xs text-neutral-300">
                {featureTrigger === 'equalizer'
                  ? 'Unlock the 5-Band Hardware Equalizer & Bass Boost DSP'
                  : featureTrigger === 'spectrum'
                  ? 'Unlock Live Audio Spectrum Visualizers & Winamp Studio'
                  : 'Get audiophile-grade features with a one-time lifetime pass'}
              </p>
            </div>

            {/* Pricing Card */}
            <div className="rounded-2xl p-4 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-600/15 border border-amber-500/40 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono-numbers block">
                    LIFETIME PASS (ONE-TIME)
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-3xl font-black text-white">₹299</span>
                    <span className="text-xs text-neutral-400 line-through">₹999</span>
                    <span className="text-[10px] text-emerald-400 font-bold ml-1.5 px-1.5 py-0.5 rounded bg-emerald-500/20">
                      70% OFF
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-neutral-300 font-medium block">Lifetime Access</span>
                  <span className="text-[10px] text-neutral-400">No monthly subscription</span>
                </div>
              </div>
            </div>

            {/* Pro Features Included */}
            <div className="space-y-2.5 bg-black/40 rounded-2xl p-3.5 border border-white/10">
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                What you get:
              </div>
              
              <div className="flex items-start gap-2.5 text-xs text-neutral-200">
                <div className="p-1 rounded-md bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                  <Sliders className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-white">5-Band Equalizer & Bass Boost:</span> Real-time hardware DSP, Treble Booster, and 3D Stereo Virtualizer.
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-neutral-200">
                <div className="p-1 rounded-md bg-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-white">Live Spectrum Visualizers:</span> Winamp Classic, Neon Bars, Laser Waveform, Hi-Fi VU Meter & Flame.
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-neutral-200">
                <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-white">Audiophile Themes & Lossless FLAC:</span> 24-bit studio engine with zero audio compression.
                </div>
              </div>
            </div>

            {/* Payment Options Selection */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                Select Payment Option:
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  id="pay-method-upi-btn"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'upi'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="text-[11px] font-bold">GPay / UPI</span>
                </button>

                <button
                  id="pay-method-qr-btn"
                  onClick={() => setPaymentMethod('qr')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'qr'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span className="text-[11px] font-bold">Scan QR</span>
                </button>

                <button
                  id="pay-method-card-btn"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-[11px] font-bold">Card / Net</span>
                </button>
              </div>

              {/* UPI & QR Details Input */}
              {paymentMethod === 'upi' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] text-neutral-300 font-medium">Enter UPI ID / VPA</label>
                  <input
                    id="upi-id-input"
                    type="text"
                    placeholder="yourname@okhdfcbank or @upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                  <div className="flex gap-2 pt-1">
                    {['@okaxis', '@okhdfcbank', '@paytm', '@ybl'].map((suffix) => (
                      <button
                        key={suffix}
                        type="button"
                        onClick={() => setUpiId((prev) => (prev ? prev.split('@')[0] + suffix : 'user' + suffix))}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10"
                      >
                        {suffix}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {paymentMethod === 'qr' && (
                <div className="p-3 bg-black/60 rounded-xl border border-white/10 flex flex-col items-center justify-center space-y-2 text-center">
                  <div className="w-28 h-28 bg-white p-2 rounded-lg flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-black" />
                  </div>
                  <span className="text-[10px] text-neutral-300">Scan using GPay, PhonePe, Paytm or BHIM</span>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-2 text-xs">
                  <input
                    type="text"
                    placeholder="Card Number (XXXX XXXX XXXX XXXX)"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                    />
                    <input
                      type="password"
                      placeholder="CVV"
                      maxLength={4}
                      className="bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Pay Now Button */}
            <div className="space-y-2 pt-1">
              <button
                id="pay-now-submit-btn"
                disabled={isProcessing}
                onClick={handlePay}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-neutral-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                    Processing Payment...
                  </span>
                ) : (
                  <>
                    <span>Pay ₹299 & Unlock Lifetime</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-bit Secure Encrypted Payment • Instant Activation</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
