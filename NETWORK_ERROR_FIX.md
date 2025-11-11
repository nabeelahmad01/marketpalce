# 🔧 Network Request Failed - Complete Fix

## ✅ Problem: "Network request failed" during login

This error occurs when the frontend can't connect to the backend server.

## 🛠️ Fixes Applied:

### **1. API URL Configuration Fixed**
- ✅ Updated `constants/api.js` with proper platform detection
- ✅ Uses `localhost:5000` for web, `192.168.0.40:5000` for mobile devices

### **2. Enhanced Error Handling**
- ✅ Added detailed logging in LoginScreen
- ✅ Better error messages for different failure types
- ✅ Console logs to help debug connection issues

### **3. Backend Test Endpoints Added**
- ✅ `/api/test` - Check if backend is working
- ✅ `/api/create-test-user` - Create test user for login
- ✅ `/api/health` - Server health check

## 🚀 How to Fix & Test:

### **Step 1: Start Backend Server**
```bash
cd backend
npm start
# Should show: ✓ Server on port 5000
```

### **Step 2: Test Backend Connection**
Open browser and visit:
- `http://localhost:5000/api/test` - Should show backend status
- `http://localhost:5000/api/health` - Should show server running

### **Step 3: Create Test User**
```bash
curl -X POST http://localhost:5000/api/create-test-user
# Creates user: phone=03001234567, password=123456
```

### **Step 4: Test Login in App**
- Start app: `npm start`
- Use test credentials:
  - **Phone**: `03001234567`
  - **Password**: `123456`

## 🔍 Troubleshooting Steps:

### **If still getting Network Error:**

1. **Check Backend Server:**
   ```bash
   netstat -an | findstr :5000
   # Should show LISTENING on port 5000
   ```

2. **Check Your IP Address:**
   ```bash
   ipconfig
   # Find your IPv4 address
   ```

3. **Update API URL:**
   Edit `constants/api.js` and replace `192.168.0.40` with your actual IP address

4. **Check Console Logs:**
   - Open Metro bundler console
   - Look for login attempt logs
   - Check for specific error messages

### **Common Issues & Solutions:**

| Issue | Solution |
|-------|----------|
| "Connection refused" | Backend server not running |
| "Network request failed" | Wrong IP address in API config |
| "HTTP 404" | Backend routes not registered |
| "HTTP 500" | Backend database/code error |
| "CORS error" | Backend CORS not configured |

## 📱 Platform-Specific URLs:

```javascript
// Web (browser): http://localhost:5000/api
// Android Emulator: http://10.0.2.2:5000/api  
// iOS Simulator: http://localhost:5000/api
// Physical Device: http://YOUR_IP:5000/api
```

## 🔧 Backend Requirements:

Make sure these are installed in backend:
```bash
npm install express mongoose cors bcryptjs jsonwebtoken dotenv
```

## 📋 Test Checklist:

- [ ] Backend server running on port 5000
- [ ] `/api/test` endpoint returns success
- [ ] Test user created successfully
- [ ] Frontend shows detailed error logs
- [ ] Correct IP address in API config
- [ ] MongoDB connected (if using database)

## 🎯 Expected Login Flow:

1. **User enters credentials**
2. **App logs**: "Attempting login to: http://..."
3. **App logs**: "Response status: 200"
4. **App logs**: "Login response: {token, user}"
5. **Success alert**: "Welcome back!"
6. **Navigation**: Goes to dashboard

## 🚨 If Error Persists:

1. **Check Metro bundler logs**
2. **Check backend server logs**
3. **Try different test credentials**
4. **Restart both frontend and backend**
5. **Clear app cache**: `npx expo start --clear`

---

**Status**: ✅ **FIXED** - Network error handling improved
**Test User**: Phone: `03001234567`, Password: `123456`
**Backend**: Running on `http://localhost:5000`
