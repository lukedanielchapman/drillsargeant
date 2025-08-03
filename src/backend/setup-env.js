const fs = require('fs');
const path = require('path');

const envContent = `# Server Configuration
PORT=3001
NODE_ENV=development

# Firebase Admin SDK
FIREBASE_PROJECT_ID=drillsargeant-19d36
FIREBASE_PRIVATE_KEY_ID=772b4535ac5b77bb8aec0b7a172121f66dbaa319
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC1aXZI29BU9CMR\nMaCnN7mJuQBqhmR0rMF6QCxdZx1Lh73actEEIYECsit3qz2q6VqJOfngtmLQ+Qja\n+cpvxpFkgtIpzY/6HsRQSGFxRDER+mI/C9i7HP5vmBLoHrPJv43/VPmx+2ueKBQe\ns6tq2bYRgFS+giUeRX24QoX74XGyPnJjNQ/6RzbePFg+Mg6N6Y5ySb4Y8tH8uF17\n26ATVazLrdvF6anFUGjZ0d6QoKRq/M9ttDuUBVaGbgom0/uc+1z8hDN8g29Y2USW\n+Z/BQPo38tt9+YYtHuKxJqj1L0SdGTxQyzQYqZ3tVSSHqK12DKHmLR5U9Xtae2tV\nvEA0Sph3AgMBAAECggEADhTMkKU3S5DTs/71KGWj6jPI+3vJCmFqdzHJ/8oENRup\nOe6VmMt89xebViOdmsmYNHSil7Wwf+YEsPKYqwpvuKyK4aHKHjELLewgXCld4bZc\nr+YcgZGjkkfsl8XiULOkswAGjbElTlZwEV4C3T1e64bZjRwPA4WDV60aN03thFdB\nFpLtt2OdycjzDXCZvzt7efoloCy7NeNvttqtbLciciCouJJaVvVJdzseYS7QhFtf\nnLxZ0HL9ADtMidmdt9NE8Ubs18X8WOsOmOZoXlLy39u4yP5YlNVOFQnv8iKVZVkv\nH5kCqGCRv/yR7qR7WTN2WH1YLGY4PkN22TxSfYbnIQKBgQDaHq4kiEwHm0Tf7CC7\nCRK4RsE1LuWLoozdAvn95Nwe70MY6gIkjVRLF3yqveU7LI1cS014oTGNtpZqpJ5M\nMqi/eGf3GyNgORYXSPQFN6CfMFC0Gsv33uhe4boG3YrkgDVnfxZATxOCDCrJO5uh\ngkbh1tDowsoX9graFfbp+sn60QKBgQDU6sxAhxnF3LiFvNK2nbAZ+/II33c9D7Uo\nsR/SBS5Cw40wzl0IP2a7cxfGp4tEC6ngvD6s94RzWZ2CkItb565rKglO0HMgPTtt\nHkOKGFSOnzsOpGRHpB9R0iQQ9Ak/wfmZGFsCg1J3cSCZCMv6Tem0Yx2SiG/lzwqa\nxofnkaagxwKBgQCQ5krHiCgB8ZsaqpG/zrI56v8VJpdlYNH1TLHoge3dOxM27NYJ\nlD3IOM0f3FD5M4qhIoFPvr3dp8tbAwsKEalasVFXrhadKK9NPrCk+qRgvEcQrrCL\ndPCnf4sGXoyTabyQibOtexq5jP2re0bTT2lpRDy6NBTvQAtLf8XtACbH0QKBgFWk\nUB4QeZxtyMb6iaMs0F3TSqqpADROcib4//yhWtc+AzfDegZMQk1Z4RFl6Q2ox17/\nORKnyN4BCOswqu1/xleSpAXQsM4h8xpUFwSf/rsTb1TXaQKsEHD/3sP29RVxN62N\n72WWXwBuP5duw2VeG4gUahu7x46fdfuFqbrKikSXAoGAZvCE7ubj8GO+1aKPaGvl\nn8wBahG+FBN5SZT1TGxXTLkGfS8G5AWtBiJoOtZF1jVbcpLXAnNHj+vHfYZLrj9e\nH3GlPBiRpl9iiuK5E4cvxyxrhkV9cl+mouy/lFNHg/PYUoZT9bj9QWlFPylHcEkF\nW7ZYTLDZ40aPXK4nqZo6zIg=\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@drillsargeant-19d36.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=113026537805812429530
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40drillsargeant-19d36.iam.gserviceaccount.com

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
`;

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Backend .env file updated successfully!');
  console.log('📁 Location:', envPath);
  console.log('🔧 Firebase Admin SDK configured with complete credentials');
  console.log('🌐 CORS configured for frontend');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
} 