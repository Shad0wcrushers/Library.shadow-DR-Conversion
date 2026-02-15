/**
 * Root App (Client-Side) Example
 * 
 * This example demonstrates using the UnifiedClient for building Root Apps.
 * Root Apps are client-side GUI applications that run inside Root communities
 * on user devices.
 * 
 * Key differences from Root Bots:
 * - Runs on user devices (client-side)
 * - Can upload files directly from user's device
 * - Access to user profile and theme
 * - No token or authentication needed
 * - Cannot send messages (use Root Bot for that)
 * 
 * Usage:
 *   npm run build
 *   # Then integrate this in your Root App's HTML/UI
 */

import { UnifiedClient, RootAppProvider, LogLevel } from '../src';

// Create Root App client (no token needed!)
const client = new UnifiedClient({
  platform: 'root-app',
  config: {
    appConfig: {
      // Your app-specific configuration here
    }
  },
  logLevel: LogLevel.DEBUG
});

// Ready event - app is initialized
client.on('ready', (info?: any) => {
  console.log(`✅ Root App is ready!`);
  console.log(`Platform: ${client.platformName} v${client.platformVersion}`);
  
  // Get current user ID
  const provider = client.getProvider() as RootAppProvider;
  const userId = provider.getCurrentUserId();
  console.log(`📱 App running for user: ${userId}`);
  
  // Get current theme
  const theme = provider.getTheme();
  console.log(`🎨 Current theme: ${theme}`);
});

// Initialize the app
async function run() {
  try {
    await client.connect();
    
    const provider = client.getProvider() as RootAppProvider;
    
    // Register theme change callback
    provider.onThemeChange((theme) => {
      console.log(`🎨 Theme dynamically changed to: ${theme}`);
      // Update your UI styling
      document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
    });
    
    // Example: Get user profile
    const userId = provider.getCurrentUserId();
    if (userId) {
      const user = await provider.getUser(userId);
      console.log(`
👤 User Profile:
   Username: ${user.username}
   Display Name: ${user.displayName}
   Avatar: ${user.avatarUrl || 'none'}
      `);
      
      // Example: Show user profile in Root's UI
      // provider.showUserProfile(userId); // Opens profile modal
    }
    
    // Example: Get multiple users at once
    const userIds = [userId]; // Add more user IDs here
    if (userIds.length > 0) {
      const users = await provider.getUsers(userIds);
      console.log(`📋 Fetched ${users.length} user profiles`);
    }
    
    // Example: Upload files with preview  
    // NOTE: In a real app, you'd trigger this from user interaction:
    // const tokens = await provider.uploadFiles('imageAll');
    // tokens.forEach(token => {
    //   const previewUrl = provider.getUploadPreview(token);
    //   if (previewUrl) {
    //     console.log('Image preview available:', previewUrl);
    //   }
    // });
    
    // Example: Asset URL conversion
    // const assetUri = 'root://asset/some-id';
    // const url = provider.assetToUrl(assetUri);
    // const imageUrl = provider.imageToUrl(assetUri, 'large');
    // console.log('Asset URL:', url);
    // console.log('Image URL:', imageUrl);
    
    console.log(`
🎯 Root App Features Available:
   ✅ User profile access (getUser, getUsers)
   ✅ User profile display (showUserProfile)
   ✅ Theme detection with live updates (getTheme, onThemeChange)
   ✅ File uploads with preview support (uploadFiles, getUploadPreview)
   ✅ Asset URL conversion (assetToUrl, imageToUrl)
   ✅ App lifecycle management (restart)
   
💡 Tip: Combine Root App (client) with Root Bot (server) for full functionality:
   - Root App: File uploads, UI, user interactions, theme-aware design
   - Root Bot: Messaging, events, server logic, community management
    `);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Error handling
client.on('error', (error) => {
  console.error('❌ Root App error:', error);
});

// Start the app
run();

/**
 * Example UI Integration (HTML)
 * 
 * <!DOCTYPE html>
 * <html>
 * <head>
 *   <title>My Root App</title>
 *   <style>
 *     .dark-theme { background: #1a1a1a; color: #fff; }
 *     .light-theme { background: #fff; color: #000; }
 *     .preview-container { display: flex; gap: 10px; flex-wrap: wrap; }
 *     .preview-container img { max-width: 200px; height: auto; }
 *   </style>
 * </head>
 * <body>
 *   <h1>My Root App</h1>
 *   
 *   <!-- User Profile -->
 *   <div id="userProfile"></div>
 *   <button id="showProfileBtn">Show My Profile</button>
 *   
 *   <!-- File Upload with Preview -->
 *   <div>
 *     <h2>Upload Files</h2>
 *     <button id="uploadImagesBtn">Upload Images</button>
 *     <button id="uploadFilesBtn">Upload Any Files</button>
 *     <div id="uploadPreviews" class="preview-container"></div>
 *   </div>
 *   
 *   <script src="bundle.js"></script>
 *   <script>
 *     const provider = client.getProvider();
 *     
 *     // Display user profile
 *     provider.getUser(provider.getCurrentUserId()).then(user => {
 *       document.getElementById('userProfile').innerHTML = `
 *         <h2>Welcome, ${user.displayName}!</h2>
 *         ${user.avatarUrl ? `<img src="${user.avatarUrl}" alt="Avatar">` : ''}
 *       `;
 *     });
 *     
 *     // Show profile button
 *     document.getElementById('showProfileBtn').addEventListener('click', () => {
 *       provider.showUserProfile(provider.getCurrentUserId());
 *     });
 *     
 *     // Upload images with preview
 *     document.getElementById('uploadImagesBtn').addEventListener('click', async () => {
 *       const tokens = await provider.uploadFiles('imageAll');
 *       console.log('Image tokens:', tokens);
 *       
 *       // Show previews
 *       const previewsDiv = document.getElementById('uploadPreviews');
 *       previewsDiv.innerHTML = '';
 *       tokens.forEach(token => {
 *         const previewUrl = provider.getUploadPreview(token);
 *         if (previewUrl) {
 *           const img = document.createElement('img');
 *           img.src = previewUrl;
 *           previewsDiv.appendChild(img);
 *         }
 *       });
 *       
 *       // Send tokens to your Root Bot or backend
 *       // await fetch('/api/process-uploads', { 
 *       //   method: 'POST', 
 *       //   body: JSON.stringify({ tokens }) 
 *       // });
 *     });
 *     
 *     // Upload any files
 *     document.getElementById('uploadFilesBtn').addEventListener('click', async () => {
 *       const tokens = await provider.uploadFiles('all');
 *       console.log('File tokens:', tokens);
 *       // Process uploaded files
 *     });
 *   </script>
 * </body>
 * </html>
 */
