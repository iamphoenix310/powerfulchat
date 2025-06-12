'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import UserEditableFields from './Bio/UserEditableFields';

interface Props {
  user: any;
  currentUserId: string;
  onSuccess?: () => void; // ✅ ADD THIS
}

export default function UserEditorToggle({ user, currentUserId, onSuccess }: Props) {
  const [showEditor, setShowEditor] = useState(false);

  const handleSuccess = async () => {
    setShowEditor(false);
    onSuccess?.(); // ✅ call optional revalidate or refresh
  };

  return (
    <div className="mt-4">
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowEditor((prev) => !prev)}
        className="mb-2"
      >
        {showEditor ? 'Cancel' : 'Edit Profile'}
      </Button>

      {showEditor && (
        <UserEditableFields
          user={user}
          currentUserId={currentUserId}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
