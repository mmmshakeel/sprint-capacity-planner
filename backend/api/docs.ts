import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (req: VercelRequest, res: VercelResponse) => {
  // Redirect to the Swagger documentation
  res.redirect('/api-docs');
};