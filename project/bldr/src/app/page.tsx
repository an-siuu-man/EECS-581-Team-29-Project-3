'use client';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                toast.error('Login Failed', {
                    style: { fontFamily: 'Inter', backgroundColor: '#404040', color: '#fff' },
                    description: error.message,
                    duration: 3000,
                    icon: <XCircle className="h-5 w-5" />,
                });
                return;
            }

            if (data.user) {
                toast.success('Login Successful', {
                    style: { fontFamily: 'Inter', backgroundColor: '#404040', color: '#fff' },
                    description: 'Redirecting to builder...',
                    duration: 2000,
                    icon: <CheckCircle2 className="h-5 w-5" />,
                });
                router.push('/builder');
                router.refresh();
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error('Error', {
                style: { fontFamily: 'Inter', backgroundColor: '#404040', color: '#fff' },
                description: 'An unexpected error occurred',
                duration: 3000,
                icon: <AlertTriangle className="h-5 w-5" />,
            });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="landing-page ">
            <div className="flex flex-col justify-start items-center h-screen py-10">
                <div className="header w-full flex flex-col justify-start items-center mb-10">
                    <h1 className="text-5xl font-figtree font-semibold mb-3">Welcome to 
                      <span className="font-dmsans font-bold">
                        <span className="text-white">{' b'}</span>
                        <span className="text-red-500">l</span>
                        <span className="text-blue-600">d</span>
                        <span className="text-yellow-300">r</span>
                      </span>
                      </h1>
                    <h2 className="text-3xl font-dmsans text-[#A8A8A8] ">Flagship Schedule Builder</h2>                
                </div>
                <div className="login-form flex flex-col justify-center items-center w-fit border border-[#404040] p-10 rounded-lg">
                    <div className="form-header w-full flex flex-col justify-start items-start mb-2">
                        <h1 className="text-3xl font-bold font-dmsans mb-2 ">Login</h1>
                        <h2 className="text-[#A8A8A8] text-xs font-inter mb-4">Please enter your email and password to continue</h2>
                    </div>
                    <form className="flex flex-col gap-4 w-96" onSubmit={handleSubmit}>
                      <div className="w-full flex justify-between items-center -mb-1">
                        <Label htmlFor="email" className="text-sm font-inter -mb-1">Email</Label>
                      </div>
                        <Input 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          id="email" 
                          placeholder="your.email@example.com" 
                          className={`font-inter selection:bg-blue-400 border-[#404040] border-2`} 
                          required 
                          disabled={isLoading}
                        />

                        <div className="w-full flex justify-between items-center -mb-1">
                        <Label htmlFor="password" className="text-sm font-inter -mb-1">Password</Label>
                        </div>
                        <Input 
                          type="password" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          id='password' 
                          placeholder='********' 
                          className={`font-inter selection:bg-blue-400 border-[#404040] border-2`} 
                          required 
                          disabled={isLoading}
                        />
                         <Button 
                          type="submit" 
                          variant={'secondary'} 
                          className={`cursor-pointer font-dmsans text-md my-3`}
                          disabled={isLoading}
                         >
                          {isLoading ? 'Logging in...' : 'Login'}
                         </Button>
                    </form>
                    <div className="text-[#a8a8a8] text-xs mt-3 font-inter">Don't have an account with us? <Link href={'/signup'} className="font-medium text-white font-inter">Sign up</Link></div>
                </div>
            </div>
        </div>
    );
}