# Cloudinary Migration - Implementation Summary

## Project: CampusArena Registration Form
## Migration Date: February 27, 2026
## Status: Complete ✓

---

## Quick Reference

| Aspect | Before | After |
|--------|--------|-------|
| Image Storage | Local filesystem (`/uploads`) | Cloudinary CDN |
| Database Field | `paymentQrUrl` (local path) | `imageUrl` (HTTPS URL) + `imagePublicId` |
| Upload Method | FormData with MultipartFile | Direct to Cloudinary (unsigned) |
| Request Format | Multipart form data | JSON with imageUrl/imagePublicId |
| Image Deletion | Manual cleanup needed | Automatic via Cloudinary API,  public_id |

---

## Files Modified

### Backend (Java/Spring)
1. **[pom.xml](pom.xml)**
   - Added `com.cloudinary:cloudinary-http45:1.36.1`

2. **[src/main/resources/application.yaml](src/main/resources/application.yaml)**
   - Added Cloudinary configuration (cloud-name, api-key, api-secret)

3. **[src/main/java/com/campusarena/eventhub/registration/model/RegistrationForm.java](src/main/java/com/campusarena/eventhub/registration/model/RegistrationForm.java)**
   - ❌ Removed: `private String paymentQrUrl;`
   - ✅ Added: `private String imageUrl;`
   - ✅ Added: `private String imagePublicId;`

4. **[src/main/java/com/campusarena/eventhub/upload/service/CloudinaryService.java](src/main/java/com/campusarena/eventhub/upload/service/CloudinaryService.java)** ⭐ NEW
   - Handles Cloudinary image deletion via API
   - Non-blocking deletion (errors logged, don't prevent form deletion)

5. **[src/main/java/com/campusarena/eventhub/registration/service/RegistrationFormService.java](src/main/java/com/campusarena/eventhub/registration/service/RegistrationFormService.java)**
   - ❌ Removed: All file I/O code (Files.copy, etc.)
   - ❌ Removed: `MultipartFile` parameters
   - ✅ Added: CloudinaryService injection
   - ✅ Added: Image deletion logic on update (if imageUrl changed)
   - ✅ Added: Image deletion logic on delete
   - Method signatures changed:
     - `createForm(form, creator)` - imageUrl/imagePublicId now in form object
     - `updateForm(id, form, currentUser)` - imageUrl/imagePublicId now in form object

6. **[src/main/java/com/campusarena/eventhub/registration/controller/AdminRegistrationController.java](src/main/java/com/campusarena/eventhub/registration/controller/AdminRegistrationController.java)**
   - Changed from `@RequestParam("form")` + `@RequestParam("image")` to `@RequestBody RegistrationForm`
   - Removed ObjectMapper (no longer needed)
   - Endpoints themselves are unchanged (same URLs and HTTP methods)

### Frontend (React/TypeScript)
1. **[frontend/src/utils/cloudinary.ts](frontend/src/utils/cloudinary.ts)** ⭐ NEW
   - `uploadToCloudinary(file)` - Uploads to Cloudinary unsigned
   - `validateImageFile(file)` - Validates file type and size
   - Uses `VITE_CLOUDINARY_CLOUD_NAME` environment variable

2. **[frontend/.env](frontend/.env)**
   - Added: `VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name`

3. **[frontend/src/features/admin/AdminCreateRegistrationForm.tsx](frontend/src/features/admin/AdminCreateRegistrationForm.tsx)**
   - ❌ Removed: `image` state (File)
   - ✅ Added: `imageUrl`, `imagePublicId` states
   - ✅ Added: `isUploadingImage` state for loading indicator
   - Updated `handleImageChange`: Now uploads to Cloudinary
   - Updated `handleSubmit`: Now sends JSON instead of FormData
   - Updated image upload UI: Shows progress, file type restrictions
   - Updated `fetchFormData`: Loads `imageUrl` and `imagePublicId` instead of `paymentQrUrl`

4. **[frontend/src/features/registration/RegistrationFormSubmission.tsx](frontend/src/features/registration/RegistrationFormSubmission.tsx)**
   - Updated interface: `paymentQrUrl?: string` → `imageUrl?: string`
   - Updated JSX: References to `form.paymentQrUrl` → `form.imageUrl`

---

## API Contract Changes

### Request Format (Before → After)

#### Create/Update Form

**BEFORE:**
```
POST /api/admin/registration/forms
Content-Type: multipart/form-data

form: {JSON object}
image: {File object}
```

**AFTER:**
```
POST /api/admin/registration/forms
Content-Type: application/json

{
  "title": "...",
  "description": "...",
  "questions": [...],
  "imageUrl": "https://res.cloudinary.com/...",
  "imagePublicId": "campusarena/registration-form/xyz123",
  "paymentRequired": true,
  "paymentFees": 500,
  "startTime": "...",
  "endTime": "...",
  "active": true,
  "clubId": null,
  "eventId": "...",
  "contestId": null
}
```

### Response Format (Unchanged)

**GET /api/registration/forms/{id}**
```json
{
  "id": "...",
  "title": "...",
  "description": "...",
  "questions": [...],
  "imageUrl": "https://res.cloudinary.com/...",
  "imagePublicId": "campusarena/registration-form/xyz123",
  "paymentRequired": true,
  "paymentFees": 500,
  "startTime": "...",
  "endTime": "...",
  "active": true,
  "createdAt": "...",
  "clubId": "...",
  "eventId": "...",
  "contestId": "...",
  "createdBy": "..."
}
```

---

## Cloudinary Integration Flow

### Upload Flow (Frontend)
```
User selects image
    ↓
validateImageFile() - Type & size check
    ↓
uploadToCloudinary(file)
    ↓
FormData to https://api.cloudinary.com/v1_1/{cloud}/image/upload
    ↓
Get response: {secure_url, public_id}
    ↓
Store in state: imageUrl, imagePublicId
    ↓
Show preview
    ↓
User submits form
    ↓
Send JSON with imageUrl & imagePublicId to backend
```

### Backend Processing
```
Receive JSON with imageUrl & imagePublicId
    ↓
Save to MongoDB
    ↓
(On Update) Compare new imageUrl with old
    ↓
If different, call CloudinaryService.deleteImage(oldPublicId)
    ↓
(On Delete) Call CloudinaryService.deleteImage(publicId)
    ↓
Delete from MongoDB
```

---

## Configuration Required

### Backend (application.yaml)
```yaml
cloudinary:
  cloud-name: ${CLOUDINARY_CLOUD_NAME:}
  api-key: ${CLOUDINARY_API_KEY:}
  api-secret: ${CLOUDINARY_API_SECRET:}
```

Set environment variables:
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary account name
- `CLOUDINARY_API_KEY` - API key from dashboard
- `CLOUDINARY_API_SECRET` - API secret from dashboard

### Frontend (.env)
```
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### Cloudinary Preset (Already Configured)
- Name: `campusarena`
- Signing: Unsigned (allows unsigned uploads)
- Folder: `campusarena/registration-form`
- Unique filename: true

---

## Key Design Decisions

### 1. Unsigned Uploads
- ✅ Frontend uploads directly to Cloudinary without backend involvement
- ✅ No need to expose API secret to frontend
- ✅ Improves user experience (faster uploads)
- ✅ Reduces backend load

### 2. JSON Request Body
- ✅ Cleaner than FormData + JSON combo
- ✅ Easier to test and debug
- ✅ Standard REST practice
- ✅ Frontend already constructs JSON anyway

### 3. Non-Blocking Image Deletion
- ✅ Cloudinary deletion errors don't prevent form deletion
- ✅ Images are cleaned up asynchronously
- ✅ Improves reliability (network issues don't break form deletion)
- ⚠️ Orphaned images possible if Cloudinary API fails repeatedly

### 4. No Database Migration
- ✅ Old `paymentQrUrl` field can coexist
- ✅ No schema changes needed
- ✅ Can be cleaned up later via migration script
- ⚠️ Database will have unused field for legacy data

---

## Testing Checklist

### Happy Path
- [ ] Create form with image - upload succeeds
- [ ] Image displays in preview
- [ ] Form saves with imageUrl/imagePublicId
- [ ] Fetch form returns correct imageUrl
- [ ] Display form shows payment QR image

### Update Flow
- [ ] Update form, keep same image - image not deleted
- [ ] Update form, change image - old image deleted, new stored
- [ ] Verify in Cloudinary console that old image is deleted

### Delete Flow
- [ ] Delete form - image deleted from Cloudinary
- [ ] Verify in Cloudinary console that public_id is gone

### Error Handling
- [ ] Try uploading non-image file - error message shown
- [ ] Try uploading >2MB file - error message shown
- [ ] Try uploading with invalid Cloudinary config - graceful error

### Edge Cases
- [ ] Create form without image - imageUrl is null, form saves
- [ ] Cloudinary API down during upload - error shown, user can retry
- [ ] Cloudinary API down during deletion - form still deleted, image cleanup logged

---

## Environment Setup

### Local Development
```bash
# Backend
export CLOUDINARY_CLOUD_NAME="demo"
export CLOUDINARY_API_KEY="key123"
export CLOUDINARY_API_SECRET="secret123"
./mvnw spring-boot:run

# Frontend (in frontend/)
echo 'VITE_CLOUDINARY_CLOUD_NAME=demo' > .env.local
npm run dev
```

### Production
Set environment variables in your deployment platform (Docker, K8s, Heroku, etc.)

---

## Cleanup / Decommission

### Remove Local Upload System
1. Delete `uploads/` directory
2. Remove `file.upload-dir` from `application.yaml`  
3. Remove `FileUploadService` if not used elsewhere

### Legacy Data Migration (Optional)
If needed, migrate old `paymentQrUrl` records to new `imageUrl` format:
```java
// Batch process documents with paymentQrUrl
// Move value to imageUrl field
// Delete paymentQrUrl field
```

---

## Endpoint Summary

| Endpoint | Method | Changes | Status |
|----------|--------|---------|--------|
| `/api/admin/registration/forms` | POST | Request format changed to JSON | ✅ Active |
| `/api/admin/registration/forms/{id}` | PUT | Request format changed to JSON | ✅ Active |
| `/api/admin/registration/forms/{id}` | DELETE | Now deletes from Cloudinary | ✅ Active |
| `/api/registration/forms` | GET | Returns imageUrl instead of paymentQrUrl | ✅ Active |
| `/api/registration/forms/{id}` | GET | Returns imageUrl instead of paymentQrUrl | ✅ Active |
| `/api/registration/forms/event/{id}` | GET | Response format unchanged | ✅ Active |
| `/api/registration/forms/contest/{id}` | GET | Response format unchanged | ✅ Active |

---

## Dependencies Added/Removed

### Added
- `com.cloudinary:cloudinary-http45:1.36.1` (Backend)
- (Frontend: No new npm packages needed - uses standard Fetch API)

### Removed
- None (FileUploadService still available for other uses)

---

## Production Rollout

### Pre-Deployment Checklist
- [ ] Configure Cloudinary API credentials in all environments
- [ ] Test image upload in staging
- [ ] Test image deletion in staging
- [ ] Verify Cloudinary folder structure exists
- [ ] Brief team on new flow

### Deployment Steps
1. Deploy backend (services backward compatible for reads)
2. Deploy frontend (updated form creation/update)
3. Monitor for errors
4. Verify old forms still display (imageUrl is null for old data, works if both fields exist)

### Rollback Plan
- Revert frontend to old FormData format
- Revert backend controller to accept MultipartFile
- Revert service to save files locally
- Database is compatible both ways

---

## Support & Troubleshooting

### Common Issues

**Issue:** "Cloudinary configuration missing" on form submission
- **Cause:** VITE_CLOUDINARY_CLOUD_NAME not set
- **Fix:** Set environment variable and rebuild frontend

**Issue:** Image upload fails silently
- **Cause:** Invalid cloud name, preset not found, or CORS issue
- **Fix:** Check browser console for error, verify Cloudinary settings

**Issue:** Old form images don't display
- **Cause:** paymentQrUrl field still in database, imageUrl is null
- **Fix:** Users need to re-upload image, or run migration script

**Issue:** Form deletion fails
- **Cause:** Unlikely - deletion is non-blocking
- **Fix:** Check backend logs for Cloudinary API errors (form will still delete)

---

## Performance Impacts

### Positive
- ✅ Reduced server disk usage (no local file storage)
- ✅ Reduced server I/O (image processing)
- ✅ Faster image delivery (Cloudinary CDN)
- ✅ Better caching (Cloudinary handles it)

### Negative
- ⚠️ Additional network call to Cloudinary (upload)
- ⚠️ Dependency on Cloudinary uptime
- ⚠️ Slight delay during form submission (waiting for Cloudinary API)

### Mitigation
- Cloudinary has 99.99% uptime SLA
- Upload happens in front-end (doesn't block backend)
- Graceful error handling on upload failure

---

## Next Steps

1. **Set Environment Variables**
   - Get credentials from Cloudinary console
   - Set in backend and frontend

2. **Test Locally**
   - Create form with image
   - Verify it uploads to Cloudinary
   - Check public_id in Cloudinary folder

3. **Deploy to Staging**
   - Run full test suite
   - Test with real Cloudinary account

4. **Deploy to Production**
   - Monitor first 24 hours
   - Watch error logs
   - Verify images are properly deleted on form updates/deletes

5. **Legacy Data Cleanup** (Optional)
   - Run migration script for old paymentQrUrl records
   - Delete old uploaded files from server

---

## Questions & Support
Contact: [Support Channel]
Documentation: See CLOUDINARY_SETUP.md for detailed setup guide
