// pages/api/login.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { client } from '@/app/utils/sanityClient';

interface LoginRequestBody {
  email: string;
  password: string;
}

interface ErrorResponse {
  message: string;
}

interface SuccessResponse {
  token: string;
}

export default async function login(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  const { email, password } = req.body as LoginRequestBody;
  const jwtSecret = process.env.NEXT_PUBLIC_JWT_SECRET as string;

  try {
    // Fetch user from Sanity
    const query = '*[_type == "user" && email == $email][0]';
    const user = await client.fetch(query, { email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare password
    if (!bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user._id, email }, jwtSecret, {
      expiresIn: '1h',
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
}
