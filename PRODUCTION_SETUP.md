# Quick Production Setup Guide

## Immediate Steps to Fix the Current Issue

1. **Update the Server Deployment**:

   - Go to your Vercel dashboard for the server project
   - Add the `OPENROUTER_API_KEY` environment variable with your API key
   - Redeploy the server

2. **Verify the Client Configuration**:

   - The client's `vercel.json` has been updated to route API requests to `https://lineup-server.vercel.app/api/`
   - If your server is deployed at a different URL, update this in the client's `vercel.json` file

3. **Redeploy Both Client and Server**:
   - Push all changes to your repository
   - Redeploy both the client and server projects in Vercel

## Testing the Deployment

After deploying, test the application by:

1. Opening the deployed client application (e.g., https://lineupai.vercel.app)
2. Try sending a message to the AI assistant
3. Check the browser console for any errors
4. If there are errors, check the server logs in the Vercel dashboard

## Common Issues and Solutions

### If the AI Assistant Still Doesn't Work:

1. **Check Server Logs**:

   - Go to the Vercel dashboard for your server project
   - Check the Function Logs for any errors related to the OpenRouter API

2. **Verify Environment Variables**:

   - Ensure the `OPENROUTER_API_KEY` is correctly set in the server's environment variables
   - Make sure the client is correctly configured to use the server API

3. **Check API Endpoint**:

   - Open your browser's developer tools
   - Look at the Network tab when sending a message to the AI assistant
   - Verify that requests are being sent to the correct server URL

4. **Test the Server API Directly**:
   - Use a tool like Postman to test the server's API endpoints directly
   - Try sending a request to `https://lineup-server.vercel.app/api/openrouter/completions`

## Next Steps

Once everything is working correctly:

1. Review the `VERCEL_DEPLOYMENT.md` file for more detailed deployment instructions
2. Consider setting up monitoring for your API usage
3. Implement regular API key rotation for better security
