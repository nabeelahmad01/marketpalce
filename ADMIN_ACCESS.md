# Admin Panel Access Guide

## How to Access Admin Panel

### Step 1: Open the App
Launch your React Native app on your device or emulator.

### Step 2: Login as Admin
On the login screen, use these credentials:
- **Phone Number**: `00000000000` (11 zeros)
- **Password**: `admin123`

### Step 3: Access Admin Features
Once logged in, you'll see the Admin Dashboard with the following features:

## Available Admin Features

### ✅ Currently Working:
1. **KYC Approvals** - Review and approve/reject KYC submissions
   - View all pending KYC requests
   - See user documents (CNIC front, back, selfie)
   - Approve or reject with reasons
   - Filter by status (pending, approved, rejected)

### 🚧 Coming Soon:
2. **User Management** - Manage customers and mechanics
3. **Service Analytics** - View service statistics and reports  
4. **Revenue Reports** - Financial reports and earnings
5. **Support Tickets** - Handle customer support requests
6. **App Settings** - Configure app settings and features

## Admin Dashboard Features

### Stats Overview:
- Total Users count
- Active Services count  
- Pending KYC requests count

### Quick Actions:
- Direct access to KYC review
- User management (coming soon)

### Navigation:
- Easy logout functionality
- Clean, professional interface
- Real-time data updates

## KYC Approval System

### Features:
- **Tabbed Interface**: Filter by Pending, Approved, Rejected, All
- **Detailed Review**: View all user documents with zoom capability
- **Approval Workflow**: 
  - Approve with timestamp and admin ID
  - Reject with custom reason
- **User Information**: Complete user profile and contact details
- **Status Tracking**: Real-time status updates
- **Refresh Capability**: Pull-to-refresh for latest data

### How to Use:
1. Click on "KYC Approvals" from dashboard
2. Browse through pending requests
3. Click on any request to view details
4. Review all documents carefully
5. Approve or reject with appropriate reason
6. Status updates automatically

## Security Features

- Admin-only access with secure credentials
- Session management with AsyncStorage
- Proper logout functionality
- Role-based navigation

## Technical Notes

- Built with React Native and Expo
- Uses AsyncStorage for session management
- Mock data for demonstration (easily replaceable with real API)
- Responsive design for all screen sizes
- Professional UI with consistent theming

---

**Note**: This is a development/demo version. In production, admin credentials should be properly secured and managed through a backend authentication system.
