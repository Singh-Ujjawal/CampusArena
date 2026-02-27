# Cloudinary Integration Setup Guide

## Overview
This document provides setup instructions for the Cloudinary image storage migration for the CampusArena Registration Form system.

## Changes Summary

### Backend Changes

#### 1. **Model Updates** ([RegistrationForm.java](src/main/java/com/campusarena/eventhub/registration/model/RegistrationForm.java))
- **Removed:** `paymentQrUrl` field
- **Added:** 
  - `imageUrl` (String) - Cloudinary secure HTTPS URL
  - `imagePublicId` (String) - Cloudinary public_id for deletion

#### 2. **New Service** ([CloudinaryService.java](src/main/java/com/campusarena/eventhub/upload/service/CloudinaryService.java))
- Handles image deletion from Cloudinary using public_id
- Safe deletion with error handling (doesn't block form deletion)
- Requires Cloudinary API key and secret

#### 3. **Service Refactoring** ([RegistrationFormService.java](src/main/java/com/campusarena/eventhub/registration/service/RegistrationFormService.java))
- **Removed:** MultipartFile handling and local file saving logic
- **Updated method signatures:** 
  - `createForm(RegistrationForm form, User creator)` - No longer accepts MultipartFile
  - `updateForm(String id, RegistrationForm form, User currentUser)` - No longer accepts MultipartFile
  - `deleteForm(...)` - Now also deletes image from Cloudinary
- **New logic:**
  - Deletes old Cloudinary image when form image is updated
  - Deletes Cloudinary image when form is deleted

#### 4. **Controller Updates** ([AdminRegistrationController.java](src/main/java/com/campusarena/eventhub/registration/controller/AdminRegistrationController.java))
- **Changed request format:** From FormData with file to JSON @RequestBody
- **Endpoints remain unchanged:**
  - `POST /api/admin/registration/forms` - Create form
  - `PUT /api/admin/registration/forms/{id}` - Update form
  - `DELETE /api/admin/registration/forms/{id}` - Delete form
- **Request body now includes:** `imageUrl` and `imagePublicId` fields

#### 5. **Dependencies** (pom.xml)
- Added: `com.cloudinary:cloudinary-http45:1.36.1`

#### 6. **Configuration** (application.yaml)
```yaml
cloudinary:
  cloud-name: ${CLOUDINARY_CLOUD_NAME:}
  api-key: ${CLOUDINARY_API_KEY:}
  api-secret: ${CLOUDINARY_API_SECRET:}
```

### Frontend Changes

#### 1. **New Utility** ([src/utils/cloudinary.ts](frontend/src/utils/cloudinary.ts))
- `uploadToCloudinary(file)` - Uploads image directly to Cloudinary
- `validateImageFile(file)` - Validates file type (JPG, JPEG, PNG) and size (max 2MB)
- Uses unsigned upload preset: `campusarena`
- Returns: `{ secure_url, public_id }`

#### 2. **Component Updates** ([AdminCreateRegistrationForm.tsx](frontend/src/features/admin/AdminCreateRegistrationForm.tsx))
- **State changes:**
  - Removed: `image` (File state)
  - Added: `imageUrl`, `imagePublicId`, `isUploadingImage`
- **Image upload flow:**
  - File selected → Uploaded directly to Cloudinary
  - Shows loading state during upload
  - Stores secure_url and public_id locally
- **Form submission:** Now sends JSON with `imageUrl` and `imagePublicId` instead of FormData with file
- **UI improvements:** Loading indicator, better error messages, file type restrictions

#### 3. **Form Submission Component** ([RegistrationFormSubmission.tsx](frontend/src/features/registration/RegistrationFormSubmission.tsx))
- Updated interface: `paymentQrUrl` → `imageUrl`
- Updated JSX to use new field name

#### 4. **Environment Configuration** (.env)
```
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
```

## Setup Instructions

### 1. Backend Setup

#### Step 1: Install Maven Dependencies
```bash
cd CampusArena
./mvnw clean install
```

#### Step 2: Configure Environment Variables
Set these environment variables before starting the backend:
```bash
export CLOUDINARY_CLOUD_NAME="your_cloud_name"
export CLOUDINARY_API_KEY="your_api_key"
export CLOUDINARY_API_SECRET="your_api_secret"
```

Or add to `application-dev.yaml`:
```yaml
cloudinary:
  cloud-name: your_cloud_name
  api-key: your_api_key
  api-secret: your_api_secret
```

#### Step 3: Start Backend
```bash
./mvnw spring-boot:run
```

### 2. Frontend Setup

#### Step 1: Update Environment Variables
Edit `frontend/.env`:
```
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
```
Get your cloud name from: https://cloudinary.com/console

#### Step 2: Install Dependencies
The new Cloudinary JavaScript SDK is **not required** for unsigned uploads. The frontend uses standard Fetch API to upload directly to Cloudinary.

#### Step 3: Start Frontend
```bash
cd frontend
npm install  # If needed
npm run dev
```

### 3. Cloudinary Configuration

Ensure your Cloudinary unsigned upload preset is configured:
- **Preset Name:** `campusarena`
- **Signing Mode:** Unsigned
- **Asset Folder:** `campusarena/registration-form`
- **Folder:** campusarena/registration-form
- **Allow unsigned uploads:** ✓ Enabled
- **Overwrite:** false
- **Use filename:** false
- **Unique filename:** true

## API Usage Examples

### Create Registration Form (New)
```typescript
// Frontend - Now sends JSON directly
const formData = {
  title: "Event Registration",
  description: "Join our event",
  startTime: "2026-02-27T10:00:00Z",
  endTime: "2026-03-10T18:00:00Z",
  questions: [...],
  imageUrl: "https://res.cloudinary.com/.../image.jpg",  // From Cloudinary
  imagePublicId: "campusarena/registration-form/xyz123",  // From Cloudinary
  paymentRequired: true,
  paymentFees: 500,
  active: true,
  clubId: null,
  eventId: "123",
  contestId: null
};

// POST /api/admin/registration/forms
// Content-Type: application/json
// Body: formData
```

### Update Registration Form (New)
```typescript
// Same structure as create
// PUT /api/admin/registration/forms/{id}
// If imageUrl changes, old image is automatically deleted from Cloudinary
```

### Fetch Registration Form (Unchanged)
```typescript
// GET /api/registration/forms/{id}
// Returns form with imageUrl field (instead of paymentQrUrl)
```

## Migration Notes

### Database Considerations
- New forms will use `imageUrl` and `imagePublicId`
- Old forms still have `paymentQrUrl` field in database
- You can manually migrate old data or leave as-is (old field is ignored)

### Backward Compatibility
- Public API endpoints (GET) return both old and new field names
- Admin endpoints (POST/PUT) use new field names
- Old files in `uploads/` folder are no longer created or used

### Testing Checklist
- [ ] Upload image to Cloudinary in admin form creation
- [ ] Verify image appears in preview
- [ ] Submit form and verify imageUrl is stored
- [ ] Fetch form and verify imageUrl is returned
- [ ] Update form with new image, verify old image is deleted from Cloudinary
- [ ] Delete form, verify image is deleted from Cloudinary
- [ ] View form in RegistrationFormSubmission and verify image displays

## Troubleshooting

### "Cloudinary configuration missing" Error
**Solution:** Set `VITE_CLOUDINARY_CLOUD_NAME` in `frontend/.env`

### Image upload fails to Cloudinary
**Possible causes:**
1. Cloud name missing or invalid
2. Upload preset not found
3. CORS issues (shouldn't happen with Cloudinary)
4. File validation failed (not JPG/PNG or > 2MB)

**Debug:** Check browser console for detailed error message

### Image deletion fails (form deletion still succeeds)
**Expected behavior:** Image deletion errors don't block form deletion. Check Cloudinary console if image still exists.

### Old file path URLs don't work
**Expected:** `/files/` URLs no longer work. Old forms need data migration or users need to re-upload.

## Cleanup

### Remove Local Upload Directory (Optional)
Once migration is complete:
```bash
rm -rf CampusArena/uploads/
```

And remove from application.yaml:
```yaml
file:
  upload-dir: uploads  # Can be removed
```

## Support
For Cloudinary-specific issues: https://cloudinary.com/docs
For CampusArena support: [Your support channel]
