import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Mail, User, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const rules = useMemo(() => {
    const length = password.length >= 8;
    const upper = /[A-Z]/.test(password);
    const lower = /[a-z]/.test(password);
    const number = /[0-9]/.test(password);
    const special = /[^A-Za-z0-9]/.test(password);
    return { length, upper, lower, number, special };
  }, [password]);

  const isFormValid = useMemo(() => {
    return (
      firstName.trim() !== "" &&
      lastName.trim() !== "" &&
      email.trim() !== "" &&
      password.trim() !== "" &&
      confirmPassword.trim() !== "" &&
      password === confirmPassword &&
      Object.values(rules).every(rule => rule)
    );
  }, [firstName, lastName, email, password, confirmPassword, rules]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      toast.error("Please fill all required fields and ensure password meets requirements");
      return;
    }
    
    try {
      setIsLoading(true);
      // In a real implementation, this would call the API to create a new user
      // For now, we'll just simulate the signup and navigate to the dashboard
      const success = await signup({ 
        email, 
        password, 
        firstName: middleName ? `${firstName} ${middleName}` : firstName,
        lastName,
        conformPassword: confirmPassword
        // contactNumber is optional
      });
      if (success) {
        toast.success("Account created successfully!");
        navigate('/organizations');
      } else {
        toast.error("Failed to create account. Please try again.");
      }
    } catch (error: any) {
      console.error("Signup failed:", error);
      toast.error("An error occurred during signup. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-soft-lg border-border/50">
        <CardHeader>
          <CardTitle className="text-center">Sign Up</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={handleSignUp}>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">First Name <span className="text-destructive">*</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="First Name" 
                    className="pl-9" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Middle Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Middle Name" 
                    className="pl-9" 
                    value={middleName} 
                    onChange={(e) => setMiddleName(e.target.value)} 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Last Name <span className="text-destructive">*</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Last Name" 
                    className="pl-9" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1 mt-3">
              <label className="text-sm font-medium">Email <span className="text-destructive">*</span></label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 mt-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Password <span className="text-destructive">*</span></label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    placeholder="Password"
                    className="pr-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && (
                  <ul className="mt-2 space-y-1 text-xs">
                    <li className="flex items-center gap-1">
                      {rules.length ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <XCircle className="h-3.5 w-3.5 text-destructive" />}<span>At least 8 characters</span>
                    </li>
                    <li className="flex items-center gap-1">
                      {rules.upper ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <XCircle className="h-3.5 w-3.5 text-destructive" />}<span>One uppercase letter</span>
                    </li>
                    <li className="flex items-center gap-1">
                      {rules.lower ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <XCircle className="h-3.5 w-3.5 text-destructive" />}<span>One lowercase letter</span>
                    </li>
                    <li className="flex items-center gap-1">
                      {rules.number ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <XCircle className="h-3.5 w-3.5 text-destructive" />}<span>One number</span>
                    </li>
                    <li className="flex items-center gap-1">
                      {rules.special ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <XCircle className="h-3.5 w-3.5 text-destructive" />}<span>One special character</span>
                    </li>
                  </ul>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Confirm Password <span className="text-destructive">*</span></label>
                <div className="relative">
                  <Input
                    type={showConfirmPw ? "text" : "password"}
                    placeholder="Confirm Password"
                    className="pr-9"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"
                    aria-label={showConfirmPw ? "Hide password" : "Show password"}
                  >
                    {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                )}
              </div>
            </div>

            <Button 
              className="w-full h-10 bg-[hsl(var(--aqua))] hover:bg-[hsl(var(--aqua))]/90 text-white font-medium mt-4" 
              type="submit"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>
          
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">OR</span>
            </div>
          </div>
          
          <Button className="w-full h-9 gap-2 bg-[hsl(var(--aqua))] hover:bg-[hsl(var(--aqua))]/90 text-white">
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>
          
          <p className="text-center text-xs text-muted-foreground">
            Already have an account? <a className="text-[hsl(var(--aqua))] hover:underline" href="/signin">Sign in</a>
          </p>
          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
            <ShieldCheck className="h-3 w-3" />
            <span>We do not share your information with third parties.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}