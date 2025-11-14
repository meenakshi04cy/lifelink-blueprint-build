import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { sendOTP, verifyOTP } from '@/lib/mockApi.hospital';
import { useToast } from '@/hooks/use-toast';

interface OTPVerificationProps {
  phoneNumber: string;
  onVerified: () => void;
  onBack: () => void;
}

export function OTPVerification({ phoneNumber, onVerified, onBack }: OTPVerificationProps) {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const { toast } = useToast();

  // Timer for resend
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleRequestOTP = async () => {
    setLoading(true);
    setError('');

    try {
      await sendOTP(phoneNumber);
      setStep('verify');
      setTimer(60);
      toast({
        title: 'OTP Sent',
        description: `A 6-digit code has been sent to ${phoneNumber}. [Mock: Check console]`,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyOTP(phoneNumber, otp);
      toast({
        title: 'Phone Verified',
        description: 'Your phone number has been verified successfully.',
      });
      onVerified();
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 border-blue-200">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-2">Phone Verification</h3>
          <p className="text-sm text-gray-600">Verifying: {phoneNumber}</p>
        </div>

        {step === 'request' ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              We'll send a One-Time Password (OTP) to your phone number for verification.
            </p>
            <Button
              onClick={handleRequestOTP}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Send OTP
            </Button>
            <Button onClick={onBack} variant="outline" className="w-full">
              Back
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter 6-Digit OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                className="text-center text-2xl tracking-widest"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="flex gap-2 text-sm text-red-600 bg-red-50 p-3 rounded">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button
              onClick={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              className="w-full"
              size="lg"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Verify OTP
            </Button>

            <Button
              onClick={() => {
                setStep('request');
                setOtp('');
              }}
              disabled={timer > 0 || loading}
              variant="outline"
              className="w-full"
            >
              {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
            </Button>
          </div>
        )}

        {/* Mock OTP Display (for demo) */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
          <p className="font-semibold mb-1">🧪 Demo Mode: Check browser console for OTP</p>
          <p>In production, OTP is sent via SMS.</p>
        </div>
      </div>
    </Card>
  );
}

export default OTPVerification;
