// Resource: https://docs.uploadthing.com/nextjs/appdir#create-a-nextjs-api-route-using-the-filerouter
// Copy paste (be careful with imports)

import { ourFileRouter } from './core';
import { createNextRouteHandler } from 'uploadthing/next';

// Export routes for Next App Router
export const { GET, POST } = createNextRouteHandler({
  router: ourFileRouter,
});
