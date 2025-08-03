import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
}

const LegalModal = ({ isOpen, onClose, type }: LegalModalProps) => {
  const isTerms = type === 'terms';
  
  const termsContent = `
TERMS OF SERVICE

Last updated: ${new Date().toLocaleDateString()}

1. ACCEPTANCE OF TERMS
By accessing and using Revonn, you accept and agree to be bound by the terms and provision of this agreement.

2. DESCRIPTION OF SERVICE
Revonn is India's premier local garage booking platform that connects vehicle owners with trusted garage services in their area.

3. USER ACCOUNTS
- You must provide accurate and complete information when creating an account
- You are responsible for maintaining the confidentiality of your account
- You must notify us immediately of any unauthorized use of your account

4. BOOKING SERVICES
- All bookings are subject to garage availability
- Cancellation policies vary by garage and will be clearly displayed
- Payment terms are established at the time of booking

5. USER CONDUCT
You agree not to:
- Use the service for any unlawful purpose
- Interfere with or disrupt the service
- Attempt to gain unauthorized access to any portion of the service

6. LIMITATION OF LIABILITY
Revonn shall not be liable for any indirect, incidental, special, consequential, or punitive damages.

7. MODIFICATIONS
We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of any changes.

8. CONTACT INFORMATION
For questions about these Terms of Service, contact us at legal@revonn.com
  `;

  const privacyContent = `
PRIVACY POLICY

Last updated: ${new Date().toLocaleDateString()}

1. INFORMATION WE COLLECT
- Personal information (name, email, phone number)
- Vehicle information for service bookings
- Location data to find nearby garages
- Payment information for transactions

2. HOW WE USE YOUR INFORMATION
- To provide and improve our services
- To process bookings and payments
- To communicate with you about services
- To send promotional materials (with your consent)

3. INFORMATION SHARING
We do not sell, trade, or otherwise transfer your personal information to third parties except:
- With garage partners to fulfill your bookings
- With payment processors to handle transactions
- When required by law

4. DATA SECURITY
We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

5. COOKIES
We use cookies to enhance your experience on our platform. You can choose to disable cookies through your browser settings.

6. YOUR RIGHTS
You have the right to:
- Access your personal information
- Correct inaccurate information
- Delete your account and data
- Opt-out of marketing communications

7. CHILDREN'S PRIVACY
Our service is not intended for children under 13 years of age.

8. CONTACT US
For privacy-related questions, contact us at privacy@revonn.com
  `;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {isTerms ? 'Terms of Service' : 'Privacy Policy'}
          </DialogTitle>
          <DialogDescription>
            {isTerms 
              ? 'Please read our terms and conditions carefully.' 
              : 'Learn how we collect, use, and protect your information.'
            }
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
          <div className="whitespace-pre-line text-sm">
            {isTerms ? termsContent : privacyContent}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default LegalModal;