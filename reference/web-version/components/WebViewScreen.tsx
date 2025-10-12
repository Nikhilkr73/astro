import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

interface WebViewScreenProps {
  type: "terms" | "privacy";
  onBack: () => void;
}

export function WebViewScreen({ type, onBack }: WebViewScreenProps) {
  const isTerms = type === "terms";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="rounded-xl -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl">
            {isTerms ? "Terms & Conditions" : "Privacy Policy"}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6 max-w-2xl text-xs">
        {isTerms ? (
          <>
            <section className="space-y-3">
              <h2 className="text-sm text-primary">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using Kundli mobile application, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm text-primary">2. Use License</h2>
              <p className="text-muted-foreground">
                Permission is granted to temporarily use Kundli for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to decompile or reverse engineer any software contained in Kundli</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm text-primary">3. Astrology Services</h2>
              <p className="text-muted-foreground">
                The astrology consultations provided through Kundli are for entertainment and guidance purposes only. While our astrologers are experienced professionals, we do not guarantee specific outcomes or results. Users should use their own judgment when making important life decisions.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm text-primary">4. Payment & Refunds</h2>
              <p className="text-muted-foreground">
                All payments made through the app are processed securely. Wallet recharges are non-refundable once processed. Unused wallet balance can be used for future consultations. In case of technical issues during a session, please contact our support team within 24 hours.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm text-primary">5. User Conduct</h2>
              <p className="text-muted-foreground">
                Users must maintain respectful communication with astrologers. Any form of harassment, abuse, or inappropriate behavior will result in immediate account suspension. Users are responsible for maintaining the confidentiality of their account credentials.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm text-primary">6. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                Kundli and its astrologers shall not be held liable for any decisions made based on astrological consultations. The service is provided "as is" without any warranties, expressed or implied.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm text-primary">7. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. Users will be notified of significant changes through the app. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm text-primary">8. Contact Information</h2>
              <p className="text-muted-foreground">
                For any questions regarding these terms, please contact us at support@kundli.app
              </p>
            </section>

            <div className="pt-4 pb-8 text-center text-muted-foreground">
              Last Updated: January 2025
            </div>
          </>
        ) : (
          <>
            <section className="space-y-3">
              <h2 className="text-sm text-primary">1. Information We Collect</h2>
              <p className="text-muted-foreground">
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Name and contact information (phone number)</li>
                <li>Birth details (date, time, and place of birth)</li>
                <li>Language preferences</li>
                <li>Payment and transaction information</li>
                <li>Chat history with astrologers</li>
                <li>Device information and usage data</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm text-primary">2. How We Use Your Information</h2>
              <p className="text-muted-foreground">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Provide accurate astrological consultations and kundli generation</li>
                <li>Process payments and maintain transaction records</li>
                <li>Match you with appropriate astrologers based on your preferences</li>
                <li>Send important notifications about your consultations</li>
                <li>Improve our services and user experience</li>
                <li>Prevent fraud and ensure platform security</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm text-primary">3. Information Sharing</h2>
              <p className="text-muted-foreground">
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Astrologers on our platform (only information necessary for consultation)</li>
                <li>Payment processors to complete transactions</li>
                <li>Service providers who assist in operating our platform</li>
                <li>Law enforcement when required by law</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm text-primary">4. Data Security</h2>
              <p className="text-muted-foreground">
                We implement industry-standard security measures to protect your personal information. All sensitive data is encrypted during transmission and storage. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm text-primary">5. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your personal information for as long as necessary to provide our services and comply with legal obligations. You may request deletion of your account and associated data at any time through the app settings.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm text-primary">6. Your Rights</h2>
              <p className="text-muted-foreground">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Access and review your personal information</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your account and data</li>
                <li>Opt-out of marketing communications</li>
                <li>Export your data in a portable format</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm text-primary">7. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Kundli is intended for users aged 18 and above. We do not knowingly collect personal information from children under 18. If we become aware of such collection, we will delete the information immediately.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm text-primary">8. Changes to Privacy Policy</h2>
              <p className="text-muted-foreground">
                We may update this privacy policy from time to time. We will notify you of significant changes through the app or via email. Your continued use after changes indicates acceptance of the updated policy.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm text-primary">9. Contact Us</h2>
              <p className="text-muted-foreground">
                For privacy-related questions or to exercise your rights, contact us at privacy@kundli.app
              </p>
            </section>

            <div className="pt-4 pb-8 text-center text-muted-foreground">
              Last Updated: January 2025
            </div>
          </>
        )}
      </div>
    </div>
  );
}
