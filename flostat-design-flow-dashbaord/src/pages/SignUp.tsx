import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Mail, User, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import flostatLogo from "./images/flostat-logo.webp";

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const { signup } = useAuth();

  // Parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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
      const success = await signup({
        email,
        password,
        firstName: middleName ? `${firstName} ${middleName}` : firstName,
        lastName,
        conformPassword: confirmPassword
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

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const validRules = Object.values(rules).filter(Boolean).length;
    return (validRules / 5) * 100;
  }, [rules]);

  const getStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-destructive';
    if (passwordStrength < 80) return 'bg-yellow-500';
    return 'bg-success';
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(hsl(var(--aqua)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--aqua)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }} />
      </div>

      {/* Animated Background Logos with Parallax */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden z-0"
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          transition: 'transform 0.3s ease-out'
        }}
      >
        {/* Center Logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20">
          <div className="relative w-full h-full">
            <img
              src={flostatLogo}
              alt="Flostat Logo"
              className="w-full h-full object-contain animate-float"
            />
            <div className="absolute inset-0 bg-[hsl(var(--aqua))]/40 animate-float" style={{ mixBlendMode: 'multiply' }} />
          </div>
        </div>

        {/* Left Side Logo */}
        <div className="absolute -left-20 top-1/4 w-[500px] h-[500px] opacity-20">
          <div className="relative w-full h-full" style={{ animationDelay: '1s' }}>
            <img
              src={flostatLogo}
              alt="Flostat Logo"
              className="w-full h-full object-contain animate-float"
              style={{ animationDelay: '1s' }}
            />
            <div className="absolute inset-0 bg-[hsl(var(--aqua))]/40 animate-float" style={{ mixBlendMode: 'multiply', animationDelay: '1s' }} />
          </div>
        </div>

        {/* Right Side Logo */}
        <div className="absolute -right-20 bottom-1/4 w-[500px] h-[500px] opacity-20">
          <div className="relative w-full h-full" style={{ animationDelay: '2s' }}>
            <img
              src={flostatLogo}
              alt="Flostat Logo"
              className="w-full h-full object-contain animate-float"
              style={{ animationDelay: '2s' }}
            />
            <div className="absolute inset-0 bg-[hsl(var(--aqua))]/40 animate-float" style={{ mixBlendMode: 'multiply', animationDelay: '2s' }} />
          </div>
        </div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/80 pointer-events-none" />

      {/* Enhanced Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[hsl(var(--aqua))]/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-[hsl(var(--aqua))]/10 rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-[hsl(var(--aqua))]/15 rounded-full animate-ping" style={{ animationDuration: '5s' }} />
        <div className="absolute top-1/2 left-1/3 w-4 h-4 bg-[hsl(var(--aqua))]/8 rounded-full animate-pulse" style={{ animationDuration: '6s' }} />
      </div>

      {/* Morphing Blob Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-[hsl(var(--aqua))]/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-[hsl(var(--aqua))]/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
      </div>

      {/* Card with Glow Effect */}
      <Card className="w-full max-w-lg shadow-2xl border-border/50 backdrop-blur-sm bg-card/95 animate-fadeIn relative z-10 group my-8">


        <div className="relative">
          <CardHeader className="space-y-1 pb-2">
            <div className="flex justify-center mb-2">
              <img
                src={flostatLogo}
                alt="Flostat Logo"
                className="h-14 w-auto animate-float hover:scale-110 transition-transform duration-300 cursor-pointer"
              />
            </div>
            <CardTitle className="text-center text-xl bg-gradient-to-r from-foreground via-[hsl(var(--aqua))] to-foreground bg-clip-text text-transparent font-bold">
              Create Account
            </CardTitle>
            <p className="text-center text-sm text-muted-foreground animate-typewriter overflow-hidden whitespace-nowrap border-r-2 border-[hsl(var(--aqua))] mx-auto" style={{ animationDelay: '0.1s' }}>
              Join Flostat today
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <form onSubmit={handleSignUp}>
              <div className="grid gap-2 md:grid-cols-3">
                <div className="space-y-2 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                  <label className="text-sm font-medium">First Name <span className="text-destructive">*</span></label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[hsl(var(--aqua))] transition-colors" />
                    <Input
                      placeholder="First Name"
                      className="pl-9 focus:ring-2 focus:ring-[hsl(var(--aqua))]/20 transition-all"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2 animate-fadeIn" style={{ animationDelay: '0.25s' }}>
                  <label className="text-sm font-medium">Middle Name</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[hsl(var(--aqua))] transition-colors" />
                    <Input
                      placeholder="Middle Name"
                      className="pl-9 focus:ring-2 focus:ring-[hsl(var(--aqua))]/20 transition-all"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                  <label className="text-sm font-medium">Last Name <span className="text-destructive">*</span></label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[hsl(var(--aqua))] transition-colors" />
                    <Input
                      placeholder="Last Name"
                      className="pl-9 focus:ring-2 focus:ring-[hsl(var(--aqua))]/20 transition-all"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-3 animate-fadeIn" style={{ animationDelay: '0.35s' }}>
                <label className="text-sm font-medium">Email <span className="text-destructive">*</span></label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[hsl(var(--aqua))] transition-colors" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="pl-9 focus:ring-2 focus:ring-[hsl(var(--aqua))]/20 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 mt-3">
                <div className="space-y-1 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                  <label className="text-sm font-medium">Password <span className="text-destructive">*</span></label>
                  <div className="relative group">
                    <Input
                      type={showPw ? "text" : "password"}
                      placeholder="Password"
                      className="pr-9 focus:ring-2 focus:ring-[hsl(var(--aqua))]/20 transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground transition-colors hover:text-[hsl(var(--aqua))]"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password && (
                    <>
                      {/* Password Strength Meter */}
                      <div className="mt-2">
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                            style={{ width: `${passwordStrength}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {passwordStrength < 40 && 'Weak'}
                          {passwordStrength >= 40 && passwordStrength < 80 && 'Medium'}
                          {passwordStrength >= 80 && 'Strong'}
                        </p>
                      </div>
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
                    </>
                  )}
                </div>
                <div className="space-y-1 animate-fadeIn" style={{ animationDelay: '0.45s' }}>
                  <label className="text-sm font-medium">Confirm Password <span className="text-destructive">*</span></label>
                  <div className="relative group">
                    <Input
                      type={showConfirmPw ? "text" : "password"}
                      placeholder="Confirm Password"
                      className="pr-9 focus:ring-2 focus:ring-[hsl(var(--aqua))]/20 transition-all"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground transition-colors hover:text-[hsl(var(--aqua))]"
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
                className="w-full h-10 bg-[hsl(var(--aqua))] hover:bg-[hsl(var(--aqua))]/90 text-white font-medium mt-4 shadow-lg hover:shadow-xl hover:shadow-[hsl(var(--aqua))]/20 transition-all animate-fadeIn"
                style={{ animationDelay: '0.5s' }}
                type="submit"
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>

            <div className="relative my-4 animate-fadeIn" style={{ animationDelay: '0.55s' }}>
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="w-full animate-fadeIn" style={{ animationDelay: '0.6s' }}>
              <Button variant="outline" className="w-full gap-2 hover:bg-[hsl(var(--aqua))]/10 hover:text-[hsl(var(--aqua))] hover:border-[hsl(var(--aqua))]/50 transition-all">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground animate-fadeIn" style={{ animationDelay: '0.65s' }}>
              Already have an account? <a className="text-[hsl(var(--aqua))] hover:underline font-medium" href="/signin">Sign in</a>
            </p>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground animate-fadeIn" style={{ animationDelay: '0.7s' }}>
              <ShieldCheck className="h-3 w-3" />
              <span>We do not share your information with third parties.</span>
            </div>

            {/* Terms & Privacy */}
            <div className="text-center text-xs text-muted-foreground pt-2 animate-fadeIn" style={{ animationDelay: '0.75s' }}>
              By signing up, you agree to our{" "}
              <button className="text-[hsl(var(--aqua))] hover:underline" onClick={() => toast.info("Terms coming soon")}>
                Terms of Service
              </button>{" "}
              and{" "}
              <button className="text-[hsl(var(--aqua))] hover:underline" onClick={() => toast.info("Privacy Policy coming soon")}>
                Privacy Policy
              </button>
            </div>
          </CardContent>
        </div>
      </Card >

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0px, 0px) rotate(0deg);
          }
          33% {
            transform: translate(10px, -15px) rotate(2deg);
          }
          66% {
            transform: translate(-10px, -5px) rotate(-1deg);
          }
        }
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-blob {
          animation: blob 7s ease-in-out infinite;
        }
        .animate-typewriter {
          width: 0;
          animation: typewriter 3s steps(30, end) forwards, blink .75s step-end infinite;
        }
        @keyframes typewriter {
          from { width: 0 }
          to { width: 100% }
        }
        @keyframes blink {
          from, to { border-color: transparent }
          50% { border-color: hsl(var(--aqua)) }
        }
      `}</style>
    </div >
  );
}