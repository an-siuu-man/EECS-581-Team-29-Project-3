'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { LogOut, AlertCircle } from 'lucide-react';
import ClassSearch from '@/components/ClassSearch';

export default function Builder() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully', {
        style: { fontFamily: 'Inter', backgroundColor: '#404040', color: '#fff' },
        duration: 2000,
        icon: <LogOut className="h-5 w-5" />,
      });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout', {
        style: { fontFamily: 'Inter', backgroundColor: '#404040', color: '#fff' },
        duration: 3000,
        icon: <AlertCircle className="h-5 w-5" />,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-dmsans mb-2">Loading...</h2>
          <p className="text-[#A8A8A8] font-inter">Please wait</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-figtree font-semibold mb-2">
              <span className="font-dmsans font-bold">
                <span className="text-white">b</span>
                <span className="text-red-500">l</span>
                <span className="text-blue-600">d</span>
                <span className="text-yellow-300">r</span>
              </span>
              {' '}Schedule Builder
            </h1>
            <p className="text-[#A8A8A8] font-inter">
              Welcome back, {user.email}!
            </p>
          </div>
          <Button 
            onClick={handleLogout}
            variant="secondary"
            className="font-dmsans cursor-pointer"
          >
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="border border-[#404040] rounded-lg p-8">
            <h2 className="text-2xl font-dmsans font-bold mb-4">Your Schedule</h2>
            <p className="text-[#A8A8A8] font-inter">
              Start building your schedule here...
            </p>
          </div>

          <div className="flex justify-center">
            <ClassSearch />
          </div>
        </div>
      </div>
    </div>
  );
}
