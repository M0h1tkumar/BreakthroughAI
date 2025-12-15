import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Lock } from 'lucide-react';

interface ComplianceAlertProps {
  type: 'ai_disclaimer' | 'patient_privacy' | 'doctor_only';
  className?: string;
}

export function ComplianceAlert({ type, className }: ComplianceAlertProps) {
  const alerts = {
    ai_disclaimer: {
      icon: <AlertTriangle className="h-4 w-4" />,
      title: "AI-Generated Content",
      message: "This content contains AI-generated insights. Final medical interpretation and decisions must be made by a licensed doctor.",
      variant: "default" as const
    },
    patient_privacy: {
      icon: <Shield className="h-4 w-4" />,
      title: "Privacy Protected",
      message: "Your medical data is encrypted and only accessible to your authorized care team. No AI systems have direct patient access.",
      variant: "default" as const
    },
    doctor_only: {
      icon: <Lock className="h-4 w-4" />,
      title: "Doctor Access Only",
      message: "AI clinical support tools are restricted to licensed medical professionals only.",
      variant: "destructive" as const
    }
  };

  const alert = alerts[type];

  return (
    <Alert variant={alert.variant} className={className}>
      {alert.icon}
      <AlertDescription>
        <span className="font-medium">{alert.title}:</span> {alert.message}
      </AlertDescription>
    </Alert>
  );
}