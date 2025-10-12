import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types';

type WebViewScreenNavigationProp = StackNavigationProp<RootStackParamList, 'WebView'>;
type WebViewScreenRouteProp = RouteProp<RootStackParamList, 'WebView'>;

const WebViewScreen = () => {
  const navigation = useNavigation<WebViewScreenNavigationProp>();
  const route = useRoute<WebViewScreenRouteProp>();
  const { type } = route.params;

  const getContent = () => {
    switch (type) {
      case 'terms':
        return {
          title: 'Terms of Service',
          content: `
TERMS OF SERVICE

Last updated: ${new Date().toLocaleDateString()}

1. ACCEPTANCE OF TERMS
By using the Kundli application, you agree to be bound by these Terms of Service.

2. DESCRIPTION OF SERVICE
Kundli is a mobile application that connects users with professional astrologers for consultations via chat and voice calls.

3. USER ACCOUNTS
- You must provide accurate information when creating an account
- You are responsible for maintaining the security of your account
- One person may not maintain more than one account

4. PAYMENT AND BILLING
- All consultations are paid services charged per minute
- Wallet balance must be maintained for uninterrupted service
- All payments are non-refundable unless specified otherwise

5. ASTROLOGER SERVICES
- Astrologers are independent professionals
- We do not guarantee the accuracy of predictions or advice
- Services are for entertainment and guidance purposes only

6. USER CONDUCT
You agree not to:
- Use the service for illegal purposes
- Harass or abuse astrologers or other users
- Share inappropriate content
- Attempt to reverse engineer the application

7. PRIVACY
Your privacy is important to us. Please review our Privacy Policy.

8. LIMITATION OF LIABILITY
The service is provided "as is" without warranties of any kind.

9. TERMINATION
We may suspend or terminate your account for violations of these terms.

10. CHANGES TO TERMS
We reserve the right to modify these terms at any time.

For questions about these Terms, please contact us at support@kundliapp.com
          `
        };
      case 'privacy':
        return {
          title: 'Privacy Policy',
          content: `
PRIVACY POLICY

Last updated: ${new Date().toLocaleDateString()}

1. INFORMATION WE COLLECT
We collect information you provide directly:
- Account information (name, email, phone)
- Payment information
- Chat conversations and session data
- Usage analytics and app performance data

2. HOW WE USE YOUR INFORMATION
- To provide astrology consultation services
- To process payments and maintain wallet
- To improve our service quality
- To send important updates and notifications
- To provide customer support

3. INFORMATION SHARING
We do not sell or rent your personal information. We may share:
- With astrologers during consultations
- With payment processors for transactions
- With service providers who assist our operations
- When required by law or legal process

4. DATA SECURITY
We implement appropriate security measures to protect your information:
- Encryption of sensitive data
- Secure payment processing
- Regular security audits
- Limited access to personal information

5. DATA RETENTION
- Account information: Until account deletion
- Chat history: 12 months unless requested for deletion
- Payment records: As required by law (typically 7 years)

6. YOUR RIGHTS
You have the right to:
- Access your personal information
- Correct inaccurate information
- Delete your account and data
- Opt out of marketing communications

7. COOKIES AND TRACKING
We use analytics to improve user experience but do not track across other apps.

8. CHILDREN'S PRIVACY
Our service is not intended for users under 18 years of age.

9. INTERNATIONAL TRANSFERS
Your data may be processed in countries other than your residence.

10. CONTACT US
For privacy-related questions: privacy@kundliapp.com

Changes to this policy will be posted in the app with advance notice.
          `
        };
      default:
        return {
          title: 'Document',
          content: 'Content not available.'
        };
    }
  };

  const content = getContent();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{content.title}</Text>
        <View style={styles.headerSpace} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.textContainer}>
          <Text style={styles.contentText}>{content.content}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSpace: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  textContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  contentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
});

export default WebViewScreen;
