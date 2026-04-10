# Admin Integration Guide 🚀

## Overview
The admin panel is now fully integrated with the main website using a real-time synchronization system. Changes made in the admin panel immediately appear on the home page without requiring a page refresh.

## Features

### ✅ Real-Time Product Management
- **Add Products**: Create new products with name, price, category, image, description, and video
- **Edit Products**: Update any product information including videos
- **Delete Products**: Remove products from the catalog
- **Automatic Sync**: All changes instantly appear on the home page

### 📊 Data Persistence
- All changes saved to browser localStorage (`ferrariProducts` key)
- Data persists even after page refresh or browser restart
- Original db.json remains unchanged (for reference)

### 🎥 Video Management
- Each product can have an associated video URL
- Videos support:
  - Local files: `media/sf90.mp4`
  - External URLs: `https://example.com/video.mp4`
- Videos auto-play when hovering over product cards on home page

## How to Use

### 1. Access Admin Panel
Navigate to: `http://localhost:4200/admin`

### 2. Add New Product
1. Click the **"🚗 Sản phẩm"** tab in the left sidebar
2. Fill in the form:
   - **Tên sản phẩm**: Product name (required)
   - **Giá (USD)**: Price in USD (required)
   - **Danh mục**: Select category from dropdown
   - **Ảnh**: URL or upload image file
   - **Mô tả**: Product description
   - **Video URL**: Optional video file path
3. Click **"➕ Thêm"** button

### 3. Edit Product
1. Find product in the table
2. Click **"✏️ Sửa"** button
3. Modify any fields
4. Click **"💾 Cập nhật"** to save

### 4. Delete Product
1. Find product in the table
2. Click **"🗑️ Xóa"** button
3. Confirm deletion

### 5. Search Products
- Use the search box to filter products by name or description
- Search updates in real-time

## Data Synchronization Flow

```
Admin Changes (add/edit/delete)
        ↓
ApiService processes request
        ↓
Save to localStorage
        ↓
Emit 'productsUpdated' event
        ↓
Home page listens & reloads
        ↓
User sees changes instantly!
```

## Technical Details

### Storage
- **Key**: `ferrariProducts`
- **Format**: JSON array of product objects
- **Location**: Browser localStorage
- **Size**: Approximately 1-2 KB per product

### Event System
- **Event Name**: `productsUpdated`
- **Data**: `{action: 'add'|'update'|'delete', product: {}, timestamp: ms}`
- **Listener**: Home component automatically updates when event fires

### Product IDs
- **Auto-generated**: New products get sequential IDs
- **Format**: Numeric (1, 2, 3, ...)
- **Modification**: ID never changes during product lifetime

## API Methods

All admin operations use these ApiService methods:

### addProduct(product)
```typescript
const newProduct = {
  name: "Ferrari SF90",
  price: 500000,
  category: "hybrid",
  image: "media/sf90.1.jpg",
  description: "Hybrid hypercar",
  video: "media/sf90.mp4"
};
await apiService.addProduct(newProduct);
```

### updateProduct(productId, productData)
```typescript
await apiService.updateProduct(1, {
  price: 450000,
  video: "media/sf90_new.mp4"
});
```

### deleteProduct(productId)
```typescript
await apiService.deleteProduct(1);
```

### refreshProducts()
```typescript
const allProducts = await apiService.refreshProducts();
```

## Troubleshooting

### Products Not Showing After Admin Changes
**Solution**: 
- Check browser console for errors
- Verify localStorage is enabled
- Clear browser cache and reload
- Check if product ID is valid (non-zero)

### Videos Not Playing
**Solutions**:
- Verify video file path is correct
- Ensure video file exists in `/public/media/`
- For external URLs, check CORS headers
- Test video format compatibility

### Changes Not Persisting
**Solutions**:
- Check if localStorage has space: `localStorage.getItem('ferrariProducts').length`
- Try exporting/importing data
- Clear localStorage and restart app
- Check browser developer tools for errors

### Admin Panel Crashes
**Solutions**:
- Clear localStorage: `localStorage.removeItem('ferrariProducts')`
- Refresh page or restart browser
- Check console for JavaScript errors
- Verify all required fields in form

## Best Practices

### ✅ Do's
- Always fill required fields (name, price)
- Use descriptive product names
- Test videos locally before adding URLs
- Export data regularly
- Use proper category names

### ❌ Don'ts
- Don't delete products without backup
- Don't use special characters in names
- Don't exceed reasonable file sizes
- Don't disable localStorage
- Don't modify localStorage directly

## Export/Import

### Export Data
1. Go to Admin Dashboard
2. Click **"📥 Export Data"** button
3. Browser downloads `ferrari-admin-export.json`

### Import Data
Currently manual - paste JSON content into localStorage using browser console:
```javascript
const data = {/* your json data */};
localStorage.setItem('ferrariProducts', JSON.stringify(data.products));
```

## Support

For issues or questions:
1. Check this guide
2. Review browser console for errors
3. Check localStorage contents
4. Verify network connectivity
5. Test in different browser

---

**Last Updated**: April 2026
**Version**: 1.0
**Status**: Production Ready ✅
