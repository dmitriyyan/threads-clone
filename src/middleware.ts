import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  debug: true,
  ignoredRoutes: ['api/webhook/clerk'],
  publicRoutes: ['api/webhook/clerk'],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
