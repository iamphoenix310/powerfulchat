import { client } from '@/app/utils/sanityClient'
import UserData from '../../types/userProfile'

export interface UpdateUserResponse {
    success: boolean;
    message?: string;
    updatedUser?: UserData;
  }

// Function to fetch user data from Sanity
export const fetchUserData = async (email: string): Promise<UserData | null> => {
    try {
        const query = `*[_type == "user" && email == $email][0]`;
        const params = { email };
        const userData: UserData = await client.fetch(query, params);
        return userData;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
};

// Function to update user data using a Server Action
export const updateUser = async (
    userData: Partial<UserData> & { _id: string }
  ): Promise<UpdateUserResponse> => {
    try {
      const { _id, ...patchFields } = userData;
  
      const response = await client
        .patch(_id)
        .set(patchFields)
        .commit();
  
      const updatedUser: UserData = response as unknown as UserData;
  
      return {
        success: true,
        updatedUser,
      };
    } catch (error) {
      console.error('Error updating user data:', error);
      return {
        success: false,
        message: (error as Error).message,
      };
    }
  };
  
  