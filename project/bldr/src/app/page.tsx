'use client';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"
import { MouseEventHandler, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function Login() {

    const router = useRouter();
    const [ userId, setUserId ] = useState('');
    const [password, setPassword] = useState("");
    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              onlineID: userId,
              password: password,
            }),
          });
          if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message || response.statusText, {
              style: { fontFamily: 'Inter', backgroundColor: '#404040', color: '#fff' },
              duration: 3000,
              icon: '❌',
            });
            console.error("Login failed:", errorData.message || response.statusText);
            return;
          }
  
          setUserId(userId);
  
          router.push('/builder');
        } catch (error) {
          console.error("Network or server error:", error);
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
                        <h2 className="text-[#A8A8A8] text-xs font-inter mb-4">Please enter your Online ID and password to continue</h2>
                    </div>
                    <form className="flex flex-col gap-4 w-96">
                      <div className="w-full flex justify-between items-center -mb-1">
                        <Label htmlFor="username" className="text-sm font-inter -mb-1">Online ID</Label>
                      </div>
                        <Input type="text" value = {userId} onChange = {(e) => {setUserId(e.target.value)}} id="onlineid" placeholder="a123b456" className={`font-inter selection:bg-blue-400 border-[#404040] border-2`} required />

                        <div className="w-full flex justify-between items-center -mb-1">
                        <Label htmlFor="password" className="text-sm font-inter -mb-1">Password</Label>
                        </div>
                        <Input type="password" value = {password} onChange = {(e) => {setPassword(e.target.value)}} id='password' placeholder='********' className={`font-inter selection:bg-blue-400 border-[#404040] border-2`} required />
                         <Button type="submit" variant={'secondary'}  onClick={handleSubmit} className={`cursor-pointer font-dmsans text-md my-3`}>Login</Button>
                    </form>
                    <div className="text-[#a8a8a8] text-xs mt-3 font-inter">Don't have an account with us? <Link href={'/signup'} className="font-medium text-white font-inter">Sign up</Link></div>
                </div>
            </div>
        </div>
    );
}