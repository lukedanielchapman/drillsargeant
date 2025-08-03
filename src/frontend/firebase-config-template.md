# Frontend Firebase Configuration Template

Create a `.env` file in `src/frontend/` with the following content:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=AIzaSyANhKjZ2d9XWh7mJs3uVSD7n3qbetyBlZs
REACT_APP_FIREBASE_AUTH_DOMAIN=drillsargeant-19d36.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=drillsargeant-19d36
REACT_APP_FIREBASE_STORAGE_BUCKET=drillsargeant-19d36.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=930934013813
REACT_APP_FIREBASE_APP_ID=1:930934013813:web:1a2a32226b2d752ed7dd3c

# Application Configuration
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENVIRONMENT=development
```

## How to get the Firebase API Key:

1. Go to https://console.firebase.google.com/project/drillsargeant-19d36
2. Click on the gear icon (⚙️) next to "Project Overview" to open Project Settings
3. Scroll down to the "Your apps" section
4. If you don't have a web app, click "Add app" and select the web icon (</>)
5. Register your app with a nickname (e.g., "DrillSargeant Web")
6. Copy the `apiKey`, `messagingSenderId`, and `appId` from the config object
7. Replace the placeholder values in the `.env` file above

## Backend .env Configuration:

Create a `.env` file in `src/backend/` with the following content:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Firebase Admin SDK
FIREBASE_PROJECT_ID=drillsargeant-19d36
FIREBASE_PRIVATE_KEY_ID=772b4535ac5b77bb8aec0b7a172121f66dbaa319
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC1aXZI29BU9CMR
MaCnN7mJuQBqhmR0rMF6QCxdZx1Lh73actEEIYECsit3qz2q6VqJOfngtmLQ+Qja
+cpvxpFkgtIpzY/6HsRQSGFxRDER+mI/C9i7HP5vmBLoHrPJv43/VPmx+2ueKBQe
s6tq2bYRgFS+giUeRX24QoX74XGyPnJjNQ/6RzbePFg+Mg6N6Y5ySb4Y8tH8uF17
26ATVazLrdvF6anFUGjZ0d6QoKRq/M9ttDuUBVaGbgom0/uc+1z8hDN8g29Y2USW
+Z/BQPo38tt9+YYtHuKxJqj1L0SdGTxQyzQYqZ3tVSSHqK12DKHmLR5U9Xtae2tV
vEA0Sph3AgMBAAECggEADhTMkKU3S5DTs/71KGWj6jPI+3vJCmFqdzHJ/8oENRup
Oe6VmMt89xebViOdmsmYNHSil7Wwf+YEsPKYqwpvuKyK4aHKHjELLewgXCld4bZc
r+YcgZGjkkfsl8XiULOkswAGjbElTlZwEV4C3T1e64bZjRwPA4WDV60aN03thFdB
FpLtt2OdycjzDXCZvzt7efoloCy7NeNvttqtbLciciCouJJaVvVJdzseYS7QhFtf
nLxZ0HL9ADtMidmdt9NE8Ubs18X8WOsOmOZoXlLy39u4yP5YlNVOFQnv8iKVZVkv
H5kCqGCRv/yR7qR7WTN2WH1YLGY4PkN22TxSfYbnIQKBgQDaHq4kiEwHm0Tf7CC7
CRK4RsE1LuWLoozdAvn95Nwe70MY6gIkjVRLF3yqveU7LI1cS014oTGNtpZqpJ5M
Mqi/eGf3GyNgORYXSPQFN6CfMFC0Gsv33uhe4boG3YrkgDVnfxZATxOCDCrJO5uh
gkbh1tDowsoX9graFfbp+sn60QKBgQDU6sxAhxnF3LiFvNK2nbAZ+/II33c9D7Uo
sR/SBS5Cw40wzl0IP2a7cxfGp4tEC6ngvD6s94RzWZ2CkItb565rKglO0HMgPTtt
HkOKGFSOnzsOpGRHpB9R0iQQ9Ak/wfmZGFsCg1J3cSCZCMv6Tem0Yx2SiG/lzwqa
xofnkaagxwKBgQCQ5krHiCgB8ZsaqpG/zrI56v8VJpdlYNH1TLHoge3dOxM27NYJ
lD3IOM0f3FD5M4qhIoFPvr3dp8tbAwsKEalasVFXrhadKK9NPrCk+qRgvEcQrrCL
dPCnf4sGXoyTabyQibOtexq5jP2re0bTT2lpRDy6NBTvQAtLf8XtACbH0QKBgFWk
UB4QeZxtyMb6iaMs0F3TSqqpADROcib4//yhWtc+AzfDegZMQk1Z4RFl6Q2ox17/
ORKnyN4BCOswqu1/xleSpAXQsM4h8xpUFwSf/rsTb1TXaQKsEHD/3sP29RVxN62N
72WWXwBuP5duw2VeG4gUahu7x46fdfuFqbrKikSXAoGAZvCE7ubj8GO+1aKPaGvl
n8wBahG+FBN5SZT1TGxXTLkGfS8G5AWtBiJoOtZF1jVbcpLXAnNHj+vHfYZLrj9e
H3GlPBiRpl9iiuK5E4cvxyxrhkV9cl+mouy/lFNHg/PYUoZT9bj9QWlFPylHcEkF
W7ZYTLDZ40aPXK4nqZo6zIg=
-----END PRIVATE KEY-----
"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@drillsargeant-19d36.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=113026537805812429530
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40drillsargeant-19d36.iam.gserviceaccount.com

# JWT Configuration
JWT_SECRET=drillsargeant_jwt_secret_2024
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
``` 